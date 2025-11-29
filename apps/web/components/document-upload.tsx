"use client";

import { cn } from "@workspace/ui/lib/utils";
import { Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { processDocument } from "@/lib/actions/process-document";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";

interface DocumentUploadProps {
	onUploadComplete: (document: Document) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
	const router = useRouter();
	const [isDragOver, setIsDragOver] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const uploadFile = useCallback(
		async (file: File) => {
			if (file.type !== "application/pdf") {
				setError("Only PDF files are allowed");
				return;
			}

			setIsUploading(true);
			setError(null);

			try {
				const supabase = createClient();
				const fileExt = file.name.split(".").pop();
				const fileName = `${crypto.randomUUID()}.${fileExt}`;
				const filePath = `documents/${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from("documents")
					.upload(filePath, file, {
						cacheControl: "3600",
						upsert: false,
					});

				if (uploadError) throw new Error(uploadError.message);

				const { data: document, error: dbError } = await supabase
					.from("documents")
					.insert({
						name: file.name,
						path: filePath,
						size: file.size,
						mime_type: file.type,
					})
					.select()
					.single();

				if (dbError) throw new Error(dbError.message);

				onUploadComplete(document);
				processDocument(document.id).catch(console.error);
				router.push(`/${document.id}`);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Upload failed");
			} finally {
				setIsUploading(false);
			}
		},
		[onUploadComplete, router],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragOver(false);
			const file = e.dataTransfer.files[0];
			if (file) uploadFile(file);
		},
		[uploadFile],
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) uploadFile(file);
			e.target.value = "";
		},
		[uploadFile],
	);

	return (
		<div className="w-full">
			<label
				htmlFor="file-upload"
				className={cn(
					"group relative flex flex-col items-center justify-center w-full h-[220px] rounded-[28px] transition-all duration-300 cursor-pointer",
					"bg-white/70 hover:bg-white border-2 border-dashed border-app-border-light hover:border-app-blob-blue backdrop-blur-sm shadow-lg shadow-app-blob-purple/15",
					isDragOver &&
						"ring-4 ring-app-blob-purple/50 bg-white border-app-blob-blue scale-[1.015]",
					isUploading && "pointer-events-none opacity-70",
				)}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<input
					id="file-upload"
					type="file"
					accept="application/pdf"
					onChange={handleFileSelect}
					className="sr-only"
					disabled={isUploading}
				/>

				{/* Dropzone Content */}
				<div className="flex flex-col items-center gap-4 p-6 text-center">
					{isUploading ? (
						<div className="flex flex-col items-center gap-3 text-slate-600">
							<div className="p-4 rounded-full bg-app-bg-variant-1/30">
								<Loader2 className="w-8 h-8 animate-spin text-app-accent-light-cyan" />
							</div>
							<span className="text-lg font-medium">Uploading document...</span>
						</div>
					) : (
						<div className="flex flex-col items-center gap-4 group-hover:translate-y-[-2px] transition-transform duration-300">
							<div
								className={cn(
									"p-5 rounded-full transition-colors duration-300",
									isDragOver
										? "bg-app-blob-light-blue/60 text-app-accent-cyan"
										: "bg-app-bg-variant-2 text-slate-400 group-hover:bg-app-blob-light-blue/50 group-hover:text-app-accent-cyan",
								)}
							>
								<UploadCloud className="w-10 h-10" strokeWidth={1.5} />
							</div>

							<div className="space-y-1">
								<p className="text-xl  text-slate-600">
									{isDragOver
										? "Drop file here"
										: "Click to upload or drag and drop"}
								</p>
								<p className="text-sm text-slate-400 font-normal">
									PDF files up to 50MB
								</p>
							</div>
						</div>
					)}
				</div>
			</label>

			{error && (
				<div className="mt-4 p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm text-center shadow-sm">
					{error}
				</div>
			)}
		</div>
	);
}
