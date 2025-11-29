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

export interface Lesson {
	id: string;
	document_id: string;
	title: string;
	description: string | null;
	prev_lesson_id: string | null;
	order_index: number;
	created_at: string;
	updated_at: string;
}
