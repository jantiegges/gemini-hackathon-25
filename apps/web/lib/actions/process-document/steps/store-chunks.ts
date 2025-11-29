"use server";

import type { createClient } from "@/lib/supabase/server";

/**
 * Store extracted pages as chunks in the database
 */
export async function storeChunks(
	supabase: Awaited<ReturnType<typeof createClient>>,
	documentId: string,
	pages: string[],
): Promise<void> {
	console.log("[Chunks] Storing chunks in database...");

	const chunkInserts = pages.map((content, index) => ({
		document_id: documentId,
		content: typeof content === "string" ? content : JSON.stringify(content),
		chunk_index: index,
	}));

	const { error: chunksError } = await supabase
		.from("chunks")
		.insert(chunkInserts);

	if (chunksError) {
		console.error("[Chunks] Failed to insert chunks:", chunksError);
		throw new Error("Failed to store document chunks");
	}

	console.log(`[Chunks] Inserted ${chunkInserts.length} chunks`);
}
