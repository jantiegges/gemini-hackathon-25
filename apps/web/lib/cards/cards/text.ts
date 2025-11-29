/**
 * Text Card
 *
 * A simple informational card that presents content to the user.
 * Uses Gemini's image generation (Nano Banana) to create a visual
 * that reflects the overall idea of the card.
 */

import type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
} from "../types";

export interface TextCardContent {
	title: string;
	body: string; // Markdown with LaTeX support
	/** Optional path to a generated image in Supabase Storage */
	imagePath?: string;
	/** Alt text / description of the image */
	imageDescription?: string;
}

export const textCard: CardTypeDefinition = {
	type: "text",
	name: "Text Card",
	description:
		"An informational card that presents content to the user. Displays a title, markdown-formatted body text, and an AI-generated image that reflects the concept.",
	bestUsedFor:
		"Introducing new concepts, explaining details, providing examples, or summarizing key points. Good for teaching before testing.",
	exampleOutput: {
		title: "Understanding Derivatives",
		body: "A **derivative** represents the rate of change of a function. For $f(x) = x^2$, the derivative is $f'(x) = 2x$.\n\n- Measures instantaneous rate of change\n- Fundamental to calculus",
		imagePath: "cards/lesson-123/text-abc.png",
		imageDescription: "A visual representation of the derivative concept",
	},

	generate: async (context: GeneratorContext): Promise<GeneratedCard> => {
		// Step 1: Generate the text content and image prompt
		const result = await context.genAI.models.generateContent({
			model: "gemini-3-pro-preview",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `You are creating an educational text card for a learning app.

Lesson: ${context.lessonTitle}
${context.lessonDescription ? `Description: ${context.lessonDescription}` : ""}

Content to teach from:
${context.lessonContent.slice(0, 8000)}

Your task: Create a text card that ${context.focus}

Requirements:
- Title: Short, descriptive (3-6 words)
- Body: 2-4 sentences OR 3-5 bullet points
- Use **bold** for key terms
- Use $inline$ or $$block$$ LaTeX for math
- Keep it concise but informative
- Make it engaging and easy to understand
- imagePrompt: A detailed prompt to generate a simple, elegant illustration that captures the essence of this card's concept. The image should be minimalist, modern, and educational. Avoid text in the image.
- imageDescription: A short alt text describing what the image shows

Return ONLY a JSON object with "title", "body", "imagePrompt", and "imageDescription" fields.
No markdown code blocks, just the raw JSON.`,
						},
					],
				},
			],
		});

		const text = result.text || "{}";
		const cleaned = text
			.replace(/```json\n?/g, "")
			.replace(/```\n?/g, "")
			.trim();

		let content: {
			title: string;
			body: string;
			imagePrompt?: string;
			imageDescription?: string;
		};

		try {
			content = JSON.parse(cleaned);
			// Ensure body is a string (AI sometimes returns an array)
			if (Array.isArray(content.body)) {
				content.body = content.body.join("\n\n");
			}
		} catch {
			// Fallback content
			content = {
				title: context.lessonTitle,
				body: `Let's learn about ${context.focus}.`,
				imagePrompt: `A minimalist, modern educational illustration representing ${context.focus}. Clean design, soft colors, no text.`,
				imageDescription: `Illustration of ${context.focus}`,
			};
		}

		// Step 2: Generate the image using Gemini's image generation (Nano Banana)
		let imagePath: string | undefined;
		const imageDescription: string | undefined = content.imageDescription;

		console.log("[TextCard Generator] Starting image generation...");
		console.log("[TextCard Generator] Image prompt:", content.imagePrompt);

		if (content.imagePrompt) {
			try {
				console.log("[TextCard Generator] Calling Gemini image model...");
				const imageResult = await context.genAI.models.generateContent({
					model: "gemini-3-pro-image-preview",
					contents: [
						{
							role: "user",
							parts: [
								{
									text: `Create a beautiful, minimalist educational illustration: ${content.imagePrompt}

Style guidelines:
- Clean, modern aesthetic
- Soft, harmonious color palette
- Simple shapes and clear visual hierarchy
- No text or labels in the image
- Suitable as a header image for an educational card`,
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

				if (imageData) {
					console.log(
						"[TextCard Generator] Image data received, size:",
						imageData.length,
						"bytes",
					);
					// Upload to Supabase Storage
					const fileName = `text-${crypto.randomUUID()}.png`;
					const filePath = `cards/${context.lessonId}/${fileName}`;

					console.log("[TextCard Generator] Uploading to:", filePath);
					const { error: uploadError } = await context.supabase.storage
						.from("documents")
						.upload(filePath, imageData, {
							contentType: "image/png",
							cacheControl: "3600",
						});

					if (!uploadError) {
						imagePath = filePath;
						console.log(
							"[TextCard Generator] ✅ Image uploaded successfully:",
							filePath,
						);
					} else {
						console.warn(
							"[TextCard Generator] ❌ Image upload failed:",
							uploadError.message,
						);
					}
				} else {
					console.warn(
						"[TextCard Generator] No image data in response from Gemini",
					);
				}
			} catch (imageError) {
				console.warn(
					"[TextCard Generator] ❌ Image generation failed:",
					imageError,
				);
				// Continue without image - it's optional
			}
		} else {
			console.log(
				"[TextCard Generator] No image prompt generated, skipping image",
			);
		}

		console.log("[TextCard Generator] Final content:", {
			title: content.title,
			imagePath,
			imageDescription,
		});

		return {
			type: "text",
			content: {
				title: content.title,
				body: content.body,
				imagePath,
				imageDescription,
			} as TextCardContent,
		};
	},
};
