/**
 * Interactive Visual Card
 *
 * Generates complete HTML/CSS/JS code to create dynamic,
 * interactive visualizations of concepts.
 */

import type {
	CardTypeDefinition,
	GeneratedCard,
	GeneratorContext,
} from "../types";

export interface InteractiveVisualCardContent {
	/** Title of the visualization */
	title: string;
	/** Complete HTML document with embedded CSS and JS */
	html: string;
	/** Description for accessibility and fallback */
	description: string;
}

export const interactiveVisualCard: CardTypeDefinition = {
	type: "interactive_visual",
	name: "Interactive Visual",
	description:
		"A dynamic, interactive visualization created with HTML, CSS, and JavaScript. The AI generates complete browser code to demonstrate concepts through animations and interactivity.",
	bestUsedFor:
		"Demonstrating processes, algorithms, physics concepts, mathematical relationships, state machines, or any concept that benefits from dynamic visualization. Great for showing how things work step-by-step.",
	exampleOutput: {
		title: "Bubble Sort Visualization",
		html: "<!DOCTYPE html><html>...</html>",
		description:
			"An interactive animation showing how bubble sort compares and swaps adjacent elements",
	},

	generate: async (context: GeneratorContext): Promise<GeneratedCard> => {
		const result = await context.genAI.models.generateContent({
			model: "gemini-3-pro-preview",
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `You are creating an interactive visualization for an educational learning app.

Lesson: ${context.lessonTitle}
${context.lessonDescription ? `Description: ${context.lessonDescription}` : ""}

Content to visualize:
${context.lessonContent.slice(0, 8000)}

Your task: Create an interactive visualization that ${context.focus}

## Requirements

Create a COMPLETE, self-contained HTML document that:
1. Demonstrates the concept through animation or interactivity
2. Is visually engaging and educational
3. Works in a 400x300px viewport (but should be responsive)
4. Uses NO external dependencies (no CDN links, no imports)

## Technical Guidelines

- Include ALL CSS in a <style> tag in the <head>
- Include ALL JavaScript in a <script> tag before </body>
- Use modern CSS (flexbox, grid, CSS animations, transitions)
- Use vanilla JavaScript only
- Make it interactive where appropriate (click handlers, hover effects)
- Use smooth animations (CSS transitions or requestAnimationFrame)
- Choose a cohesive color scheme that fits the concept
- Add clear labels and visual indicators

## Visual Style

- Dark background with vibrant accent colors works well
- Use gradients and shadows for depth
- Add subtle animations to draw attention
- Include a title/header within the visualization
- Consider adding a "Play/Restart" button if it's an animation

## Examples of Good Visualizations

- Sorting algorithm: Show bars being compared and swapped
- Binary search: Highlight the search range narrowing
- Physics: Bouncing balls, pendulum, gravity simulation
- Math: Interactive graphs, geometric transformations
- Data structures: Tree traversal, linked list operations
- State machines: Nodes lighting up as states change

## Output Format

Return ONLY a JSON object with these fields:
{
  "title": "Short descriptive title",
  "html": "<!DOCTYPE html><html>..complete HTML document..</html>",
  "description": "Brief description of what the visualization shows"
}

IMPORTANT:
- The HTML must be a complete document starting with <!DOCTYPE html>
- Escape any quotes in the HTML properly for JSON
- No markdown code blocks, just the raw JSON
- Keep the code concise but functional`,
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

		// Fix common JSON escaping issues that the AI produces
		const fixJsonEscaping = (str: string): string => {
			// Fix unescaped control characters inside JSON string values
			// This handles cases where AI puts literal newlines/tabs in the HTML string
			return str.replace(
				/"html"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"description"|"\s*})/,
				(match) => {
					// Within the html value, escape any unescaped control characters
					return match
						.replace(/(?<!\\)\t/g, "\\t")
						.replace(/\r\n/g, "\\n")
						.replace(/(?<!\\)\r/g, "\\n")
						.replace(/(?<!\\)\n/g, "\\n");
				},
			);
		};

		let jsonStr = cleaned;
		try {
			const content = JSON.parse(jsonStr) as InteractiveVisualCardContent;

			// Validate that we have the required fields
			if (!content.html || !content.title) {
				throw new Error("Missing required fields");
			}

			// Ensure html is a complete document
			if (!content.html.includes("<!DOCTYPE html>")) {
				content.html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:system-ui,sans-serif;background:#1a1a2e;color:#fff;min-height:100vh;box-sizing:border-box;}</style></head><body>${content.html}</body></html>`;
			}

			return { type: "interactive_visual", content };
		} catch (firstError) {
			// First parse failed - try with escape fixing
			try {
				jsonStr = fixJsonEscaping(cleaned);
				const content = JSON.parse(jsonStr) as InteractiveVisualCardContent;

				if (!content.html || !content.title) {
					throw new Error("Missing required fields");
				}

				if (!content.html.includes("<!DOCTYPE html>")) {
					content.html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:system-ui,sans-serif;background:#1a1a2e;color:#fff;min-height:100vh;box-sizing:border-box;}</style></head><body>${content.html}</body></html>`;
				}

				console.log("[InteractiveVisual] Parsed after fixing escaping");
				return { type: "interactive_visual", content };
			} catch (secondError) {
				console.error(
					"[InteractiveVisual] Failed to parse response:",
					firstError,
				);
				console.error(
					"[InteractiveVisual] Also failed after escape fix:",
					secondError,
				);
			}

			// Fallback: create a simple placeholder visualization
			const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
  margin: 0;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}
p {
  color: #a0a0a0;
  text-align: center;
  max-width: 300px;
}
.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>
</head>
<body>
<div class="icon">🎨</div>
<h1>${context.lessonTitle}</h1>
<p>Interactive visualization about: ${context.focus}</p>
</body>
</html>`;

			return {
				type: "interactive_visual",
				content: {
					title: context.lessonTitle,
					html: fallbackHtml,
					description: `Visualization about ${context.focus}`,
				},
			};
		}
	},
};
