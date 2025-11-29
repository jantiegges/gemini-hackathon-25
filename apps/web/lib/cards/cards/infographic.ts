/**
 * Infographic Card
 *
 * Uses Gemini's image generation to create a visual infographic
 * that explains a concept from the lesson.
 */

import type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
} from "../types";

export interface InfographicCardContent {
	/** Title of the infographic */
	title: string;
	/** Path to the generated image in Supabase Storage */
	imagePath: string;
	/** Alt text / description of the image */
	description: string;
	/** Optional caption shown below the image */
	caption?: string;
}

export const infographicCard: CardTypeDefinition = {
	type: "infographic",
	name: "Infographic",
	description:
		"A visually generated infographic that illustrates a concept. Uses AI image generation to create educational visuals.",
	bestUsedFor:
		"Visualizing complex concepts, showing relationships, illustrating processes, or making abstract ideas concrete. Great for visual learners.",
	exampleOutput: {
		title: "The Power Rule Visualized",
		imagePath: "cards/lesson-123/infographic-abc.png",
		description:
			"An infographic showing how the power rule works with visual examples",
		caption: "The power rule: derivative of x^n = nx^(n-1)",
	},

	generate: async (context: GeneratorContext): Promise<GeneratedCard> => {
		// First, generate the prompt and metadata for the infographic
		const metadataResult = await context.genAI.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `You are creating an educational infographic for a learning app.

Lesson: ${context.lessonTitle}
${context.lessonDescription ? `Description: ${context.lessonDescription}` : ""}

Content to visualize:
${context.lessonContent.slice(0, 6000)}

Your task: Create an infographic that ${context.focus}

Provide:
1. A short title for the infographic
2. A detailed image generation prompt that will create an educational infographic
3. A description of what the image shows
4. A short caption

The image prompt should describe:
- A clean, educational infographic style
- Clear visual hierarchy
- Diagrams, charts, or illustrations that explain the concept
- Labels and annotations where needed
- Professional color scheme

Return ONLY a JSON object:
{
  "title": "Understanding Derivatives",
  "imagePrompt": "Create an educational infographic about derivatives. Show a graph with a curve and a tangent line at a point. Include arrows showing the slope. Use a clean, modern style with blue and white colors. Add labels for 'f(x)', 'tangent line', and 'slope = derivative'. Include a small formula box showing f'(x) = lim(h→0) [f(x+h)-f(x)]/h",
  "description": "An infographic explaining derivatives with a visual graph showing a tangent line",
  "caption": "The derivative represents the slope of the tangent line"
}

No markdown code blocks, just the raw JSON.`,
						},
					],
				},
			],
		});

		const metadataText = metadataResult.text || "{}";
		const cleanedMetadata = metadataText
			.replace(/```json\n?/g, "")
			.replace(/```\n?/g, "")
			.trim();

		let metadata: {
			title: string;
			imagePrompt: string;
			description: string;
			caption?: string;
		};

		try {
			metadata = JSON.parse(cleanedMetadata);
		} catch {
			metadata = {
				title: context.lessonTitle,
				imagePrompt: `Create an educational infographic about ${context.focus}. Use a clean, modern style with clear visuals and labels.`,
				description: `An infographic about ${context.focus}`,
				caption: context.lessonTitle,
			};
		}

		// Generate the image using Gemini's image generation
		try {
			const imageResult = await context.genAI.models.generateContent({
				model: "gemini-3-pro-image-preview",
				contents: [
					{
						role: "user",
						parts: [
							{
								text: metadata.imagePrompt,
							},
						],
					},
				],
				config: {
					responseModalities: ["Text", "Image"],
				},
			});

			// Find the image part in the response
			let imageData: Uint8Array | null = null;

			if (imageResult.candidates?.[0]?.content?.parts) {
				for (const part of imageResult.candidates[0].content.parts) {
					// Check if this part has inline data (image)
					if (part.inlineData?.data) {
						// Decode base64 to bytes
						const base64 = part.inlineData.data;
						const binaryString = atob(base64);
						const bytes = new Uint8Array(binaryString.length);
						for (let i = 0; i < binaryString.length; i++) {
							bytes[i] = binaryString.charCodeAt(i);
						}
						imageData = bytes;
						break;
					}
				}
			}

			if (!imageData) {
				throw new Error("No image generated");
			}

			// Upload to Supabase Storage
			const fileName = `infographic-${crypto.randomUUID()}.png`;
			const filePath = `cards/${context.lessonId}/${fileName}`;

			const { error: uploadError } = await context.supabase.storage
				.from("documents")
				.upload(filePath, imageData, {
					contentType: "image/png",
					cacheControl: "3600",
				});

			if (uploadError) {
				throw new Error(`Upload failed: ${uploadError.message}`);
			}

			return {
				type: "infographic",
				content: {
					title: metadata.title,
					imagePath: filePath,
					description: metadata.description,
					caption: metadata.caption,
				} as InfographicCardContent,
			};
		} catch (imageError) {
			console.error("[Infographic] Image generation failed:", imageError);

			// Fallback: return a text-based card instead
			return {
				type: "text",
				content: {
					title: metadata.title,
					body: `**Visual Concept: ${metadata.title}**\n\n${metadata.description}\n\n_${metadata.caption || ""}_`,
				},
			};
		}
	},
};
