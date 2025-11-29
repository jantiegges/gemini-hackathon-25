"use server";

import { createClient } from "@/lib/supabase/server";
import {
	downloadAndConvertPdf,
	extractPdfContent,
} from "./steps/extract-content";
import { generateLessons } from "./steps/generate-lessons";
import { storeChunks } from "./steps/store-chunks";
import { storeLessons } from "./steps/store-lessons";
import { updateDocumentStatus } from "./steps/update-status";

export interface ProcessResult {
	success: boolean;
	error?: string;
}

/**
 * Main document processing orchestrator
 * Coordinates the entire workflow of processing a PDF document
 */
export async function processDocument(
	documentId: string,
): Promise<ProcessResult> {
	const supabase = await createClient();

	console.log(`[Process] Starting processing for document: ${documentId}`);

	try {
		// Step 1: Fetch document from database
		console.log("[Process] Step 1: Fetching document from database...");
		const { data: document, error: docError } = await supabase
			.from("documents")
			.select("*")
			.eq("id", documentId)
			.single();

		if (docError || !document) {
			console.error("[Process] Document not found:", docError);
			return { success: false, error: "Document not found" };
		}
		console.log(`[Process] Found document: ${document.name}`);

		// Step 2: Update status to processing
		await updateDocumentStatus(supabase, documentId, "processing");

		// Step 3 & 4: Download PDF and convert to base64
		const base64Data = await downloadAndConvertPdf(supabase, document.path);

		// Step 5 & 6: Extract content page by page
		const pages = await extractPdfContent(base64Data);

		// Step 7: Store chunks in database
		await storeChunks(supabase, documentId, pages);

		// Step 8: Generate lessons from content
		const lessons = await generateLessons(pages);

		// Step 9: Store lessons in database
		await storeLessons(supabase, documentId, lessons);

		// Step 10: Update status to completed
		await updateDocumentStatus(supabase, documentId, "completed");

		console.log(`[Process] ✅ Processing complete for document: ${documentId}`);
		return { success: true };
	} catch (error) {
		console.error("[Process] ❌ Processing error:", error);

		// Update status to failed
		await updateDocumentStatus(supabase, documentId, "failed");

		return {
			success: false,
			error: error instanceof Error ? error.message : "Processing failed",
		};
	}
}
