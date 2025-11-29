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

// Simple logger for workflow steps
const log = {
	info: (message: string, data?: Record<string, unknown>) => {
		console.log(`[Workflow] ℹ️ ${message}`, data ? JSON.stringify(data) : "");
	},
	error: (message: string, data?: Record<string, unknown>) => {
		console.error(`[Workflow] ❌ ${message}`, data ? JSON.stringify(data) : "");
	},
	success: (message: string, data?: Record<string, unknown>) => {
		console.log(`[Workflow] ✅ ${message}`, data ? JSON.stringify(data) : "");
	},
};

/**
 * Main document processing orchestrator
 * Coordinates the entire workflow of processing a PDF document
 */
export async function processDocument(
	documentId: string,
): Promise<ProcessResult> {
	const supabase = await createClient();

	log.info("Starting document processing", { documentId });

	try {
		// Step 1: Fetch document from database
		log.info("Step 1: Fetching document from database");
		const { data: document, error: docError } = await supabase
			.from("documents")
			.select("*")
			.eq("id", documentId)
			.single();

		if (docError || !document) {
			log.error("Document not found", { documentId, error: docError?.message });
			return { success: false, error: "Document not found" };
		}
		log.info("Document found", { documentName: document.name });

		// Step 2: Update status to processing
		log.info("Step 2: Updating status to processing");
		await updateDocumentStatus(supabase, documentId, "processing");

		// Step 3 & 4: Download PDF and convert to base64
		log.info("Step 3: Downloading PDF from storage");
		const base64Data = await downloadAndConvertPdf(supabase, document.path);
		log.info("PDF downloaded and converted", {
			base64Length: base64Data.length,
		});

		// Step 5 & 6: Extract content page by page
		log.info("Step 4: Extracting content with Gemini AI");
		const pages = await extractPdfContent(base64Data);
		log.info("Content extracted", { pageCount: pages.length });

		// Step 7: Store chunks in database
		log.info("Step 5: Storing chunks in database");
		await storeChunks(supabase, documentId, pages);
		log.info("Chunks stored successfully", { chunkCount: pages.length });

		// Step 8: Generate lessons from content
		log.info("Step 6: Generating lessons with Gemini AI");
		const lessons = await generateLessons(pages);
		log.info("Lessons generated", { lessonCount: lessons.length });

		// Step 9: Store lessons in database
		log.info("Step 7: Storing lessons in database");
		await storeLessons(supabase, documentId, lessons);
		log.info("Lessons stored successfully");

		// Step 10: Update status to completed
		log.info("Step 8: Updating status to completed");
		await updateDocumentStatus(supabase, documentId, "completed");

		log.success("Document processing complete", { documentId });
		return { success: true };
	} catch (error) {
		log.error("Processing failed", {
			documentId,
			error: error instanceof Error ? error.message : "Unknown error",
		});

		// Update status to failed
		await updateDocumentStatus(supabase, documentId, "failed");

		return {
			success: false,
			error: error instanceof Error ? error.message : "Processing failed",
		};
	}
}
