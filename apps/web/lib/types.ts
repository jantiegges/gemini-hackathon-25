export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
	id: string;
	name: string;
	path: string;
	size: number;
	mime_type: string;
	status: DocumentStatus;
	created_at: string;
	updated_at: string;
}

export interface Chunk {
	id: string;
	document_id: string;
	content: string;
	chunk_index: number;
	created_at: string;
}

export type LessonStatus = "pending" | "generating" | "ready";

export interface Lesson {
	id: string;
	document_id: string;
	title: string;
	description: string | null;
	prev_lesson_id: string | null;
	order_index: number;
	start_chunk_index: number;
	end_chunk_index: number;
	status: LessonStatus;
	is_completed: boolean;
	best_score: number | null;
	created_at: string;
	updated_at: string;
}

// Card types
export type CardType =
	| "text"
	| "mc_question"
	| "fill_in_blank"
	| "infographic"
	| "video_learning";

export interface TextCardContent {
	title: string;
	body: string; // Markdown with LaTeX
	/** Optional path to a generated image in Supabase Storage */
	imagePath?: string;
	/** Alt text / description of the image */
	imageDescription?: string;
}

export interface McQuestionCardContent {
	question: string;
	options: string[];
	correct_index: number;
	explanation: string;
}

export interface FillInBlankCardContent {
	text: string;
	blanks: Record<string, Array<{ text: string; isCorrect: boolean }>>;
	explanation: string;
}

export interface InfographicCardContent {
	title: string;
	imagePath: string;
	description: string;
	caption?: string;
}

export interface VideoLearningCardContent {
	/** Topic of the video */
	topic: string;
	/** Path to the generated video in Supabase Storage */
	videoPath: string;
	/** Description/alt text for the video */
	description: string;
	/** The prompt used to generate the video */
	promptContext: string;
	/** Duration of the video in seconds */
	duration: number;
	/** Optional caption shown below the video */
	caption?: string;
	/** Thumbnail image path */
	thumbnailPath?: string;
}

export interface BaseCard {
	id: string;
	lesson_id: string;
	order_index: number;
	created_at: string;
}

export interface TextCard extends BaseCard {
	type: "text";
	content: TextCardContent;
}

export interface McQuestionCard extends BaseCard {
	type: "mc_question";
	content: McQuestionCardContent;
}

export interface FillInBlankCard extends BaseCard {
	type: "fill_in_blank";
	content: FillInBlankCardContent;
}

export interface InfographicCard extends BaseCard {
	type: "infographic";
	content: InfographicCardContent;
}

export interface VideoLearningCard extends BaseCard {
	type: "video_learning";
	content: VideoLearningCardContent;
}

export type Card =
	| TextCard
	| McQuestionCard
	| FillInBlankCard
	| InfographicCard
	| VideoLearningCard;

// For API responses where content is raw JSON
export interface RawCard {
	id: string;
	lesson_id: string;
	type: CardType;
	order_index: number;
	content:
		| TextCardContent
		| McQuestionCardContent
		| FillInBlankCardContent
		| InfographicCardContent
		| VideoLearningCardContent;
	created_at: string;
}
