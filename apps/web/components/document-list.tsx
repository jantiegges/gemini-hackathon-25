"use client";

import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

interface DocumentListProps {
	documents: Document[];
	onDocumentDeleted: (id: string) => void;
}

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

interface DocumentCardProps {
	document: Document;
	onDelete: (id: string) => void;
}

function DocumentCard({ document, onDelete }: DocumentCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = useCallback(async () => {
		setIsDeleting(true);
		try {
			const supabase = createClient();

			// Delete from storage first
			const { error: storageError } = await supabase.storage
				.from("documents")
				.remove([document.path]);

			if (storageError) {
				console.error("Storage delete error:", storageError);
			}

			// Delete from database
			const { error: dbError } = await supabase
				.from("documents")
				.delete()
				.eq("id", document.id);

			if (dbError) {
				throw new Error(dbError.message);
			}

			onDelete(document.id);
		} catch (err) {
			console.error("Delete error:", err);
			setIsDeleting(false);
		}
	}, [document, onDelete]);

	const handleOpen = useCallback(async () => {
		const supabase = createClient();
		const { data } = supabase.storage
			.from("documents")
			.getPublicUrl(document.path);

		if (data?.publicUrl) {
			window.open(data.publicUrl, "_blank");
		}
	}, [document.path]);

	return (
		<div
			className={cn(
				"group relative p-5 rounded-xl border transition-all duration-300",
				"bg-white dark:bg-slate-800/50",
				"border-slate-200 dark:border-slate-700",
				"hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50",
				"hover:border-slate-300 dark:hover:border-slate-600",
				isDeleting && "opacity-50 pointer-events-none",
			)}
		>
			<div className="flex items-start gap-4">
				{/* PDF Icon */}
				<div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30">
					<FileText className="w-6 h-6 text-rose-600 dark:text-rose-400" />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<h3 className="font-medium text-slate-800 dark:text-slate-100 truncate pr-2">
						{document.name}
					</h3>
					<div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
						<span>{formatFileSize(document.size)}</span>
						<span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
						<span>{formatDate(document.created_at)}</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleOpen}
						className="h-8 w-8 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
					>
						<ExternalLink className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleDelete}
						disabled={isDeleting}
						className="h-8 w-8 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

export function DocumentList({ documents, onDocumentDeleted }: DocumentListProps) {
	if (documents.length === 0) {
		return (
			<div className="text-center py-12">
				<div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
					<FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
				</div>
				<h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
					No documents yet
				</h3>
				<p className="text-sm text-slate-500 dark:text-slate-400">
					Upload your first PDF to get started
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{documents.map((document) => (
				<DocumentCard
					key={document.id}
					document={document}
					onDelete={onDocumentDeleted}
				/>
			))}
		</div>
	);
}

