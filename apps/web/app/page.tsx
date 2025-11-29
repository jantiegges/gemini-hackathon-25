import { DocumentsContainer } from "@/components/documents-container";
import { createClient } from "@/lib/supabase/server";
import type { Document } from "@/lib/types";

export default async function Page() {
	const supabase = await createClient();

	const { data: documents } = await supabase
		.from("documents")
		.select("*")
		.order("created_at", { ascending: false });

	return (
		<DocumentsContainer initialDocuments={(documents as Document[]) ?? []} />
	);
}
