"use client";

import { useCallback, useState } from "react";
import type { Document } from "@/lib/types";
import { DocumentList } from "./document-list";
import { DocumentUpload } from "./document-upload";

interface DocumentsContainerProps {
	initialDocuments: Document[];
}

export function DocumentsContainer({
	initialDocuments,
}: DocumentsContainerProps) {
	const [documents, setDocuments] = useState<Document[]>(initialDocuments);

	const handleUploadComplete = useCallback((newDocument: Document) => {
		setDocuments((prev) => [newDocument, ...prev]);
	}, []);

	const handleDocumentDeleted = useCallback((id: string) => {
		setDocuments((prev) => prev.filter((doc) => doc.id !== id));
	}, []);

	return (
		<div className="space-y-10">
			{/* Upload Section */}
			<section>
				<DocumentUpload onUploadComplete={handleUploadComplete} />
			</section>

			{/* Documents Section */}
			<section>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
						Your Documents
					</h2>
					{documents.length > 0 && (
						<span className="text-sm text-slate-500 dark:text-slate-400">
							{documents.length} {documents.length === 1 ? "file" : "files"}
						</span>
					)}
				</div>
				<DocumentList
					documents={documents}
					onDocumentDeleted={handleDocumentDeleted}
				/>
			</section>
		</div>
	);
}
