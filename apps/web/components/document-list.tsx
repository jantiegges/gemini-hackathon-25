"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	CheckCircle2,
	Clock,
	ExternalLink,
	FileText,
	Loader2,
	Trash2,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";

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
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "Just now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)}d ago`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function StatusBadge({ status }: { status: Document["status"] }) {
	const config = {
		pending: {
			icon: Clock,
			label: "Pending",
			className: "text-slate-400",
		},
		processing: {
			icon: Loader2,
			label: "Processing",
			className: "text-[#FFBC99]",
		},
		completed: {
			icon: CheckCircle2,
			label: "Ready",
			className: "text-[#58CFF5]",
		},
		failed: {
			icon: XCircle,
			label: "Failed",
			className: "text-[#F9A8C0]",
		},
	};

	const { icon: Icon, className } = config[status];

	return (
		<span className={cn("inline-flex items-center", className)}>
			<Icon
				className={cn("w-4 h-4", status === "processing" && "animate-spin")}
			/>
		</span>
	);
}

interface DocumentCardProps {
	document: Document;
	onDelete: (id: string) => void;
}

function DocumentCard({ document, onDelete }: DocumentCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDeleting(true);
			try {
				const supabase = createClient();
				const { error: storageError } = await supabase.storage
					.from("documents")
					.remove([document.path]);

				if (storageError) console.error("Storage delete error:", storageError);

				const { error: dbError } = await supabase
					.from("documents")
					.delete()
					.eq("id", document.id);

				if (dbError) throw new Error(dbError.message);

				onDelete(document.id);
			} catch (err) {
				console.error("Delete error:", err);
				setIsDeleting(false);
			}
		},
		[document, onDelete],
	);

	const handleOpenPdf = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			const supabase = createClient();
			const { data } = supabase.storage
				.from("documents")
				.getPublicUrl(document.path);

			if (data?.publicUrl) {
				window.open(data.publicUrl, "_blank");
			}
		},
		[document.path],
	);

	return (
		<Link href={`/${document.id}`} className="block group">
			<div
				className={cn(
					"relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-200",
					"bg-white/90 border border-slate-100 hover:border-[#C9B7FF] hover:shadow-md hover:shadow-[#C9B7FF]/25",
					isDeleting && "opacity-50 pointer-events-none",
				)}
			>
				{/* Icon */}
				<div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FAF6FF] border border-[#E4DEF8] flex items-center justify-center">
					<FileText className="w-6 h-6 text-[#58CFF5]" />
				</div>

				{/* Info */}
				<div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
					<div className="col-span-6">
						<h3 className="font-medium text-slate-800/90 truncate text-base">
							{document.name}
						</h3>
						<p className="text-xs text-slate-400 truncate font-normal mt-0.5">
							{formatFileSize(document.size)}
						</p>
					</div>

					<div className="col-span-3 text-xs text-slate-500 font-normal flex items-center gap-2">
						<StatusBadge status={document.status} />
						<span>
							{document.status === "completed" ? "Ready" : document.status}
						</span>
					</div>

					<div className="col-span-3 text-right text-xs text-slate-400 font-normal">
						{formatDate(document.created_at)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleOpenPdf}
						className="h-8 w-8 text-slate-400 hover:text-[#58CFF5] hover:bg-[#E9F5FF]/60"
					>
						<ExternalLink className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleDelete}
						disabled={isDeleting}
						className="h-8 w-8 text-slate-400 hover:text-[#F9A8C0] hover:bg-[#F9C6D0]/40"
					>
						<Trash2 className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</Link>
	);
}

export function DocumentList({
	documents,
	onDocumentDeleted,
}: DocumentListProps) {
	if (documents.length === 0) {
		return (
			<div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-white/70">
				<div className="mx-auto w-16 h-16 rounded-full bg-[#FAF6FF] flex items-center justify-center mb-4 shadow-sm border border-[#E4DEF8]">
					<FileText className="w-6 h-6 text-[#58CFF5]" />
				</div>
				<h3 className="text-sm font-medium text-slate-600 mb-1">
					No documents yet
				</h3>
				<p className="text-xs text-slate-400">Upload your first PDF above</p>
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
