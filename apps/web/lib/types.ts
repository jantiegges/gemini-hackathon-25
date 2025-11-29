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
export type CardType = "text" | "mc_question";

export interface TextCardContent {
	title: string;
	body: string; // Markdown with LaTeX
}

export interface McQuestionCardContent {
	question: string;
	options: string[];
	correct_index: number;
	explanation: string;
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

export type Card = TextCard | McQuestionCard;

// For API responses where content is raw JSON
export interface RawCard {
	id: string;
	lesson_id: string;
	type: CardType;
	order_index: number;
	content: TextCardContent | McQuestionCardContent;
	created_at: string;
}
