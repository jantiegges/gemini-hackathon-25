"use server";

import type { createClient } from "@/lib/supabase/server";
import type { DocumentStatus } from "@/lib/types";

/**
 * Update document status in the database
 */
export async function updateDocumentStatus(
	supabase: Awaited<ReturnType<typeof createClient>>,
	documentId: string,
	status: DocumentStatus,
): Promise<void> {
	"use step";

	console.log(`[Status] Updating document status to: ${status}`);

	const { error } = await supabase
		.from("documents")
		.update({ status })
		.eq("id", documentId);

	if (error) {
		console.error("[Status] Failed to update status:", error);
		throw new Error(`Failed to update document status to ${status}`);
	}

	console.log(`[Status] Document status updated to: ${status}`);
}
