"use client";

import { cn } from "@workspace/ui/lib/utils";
import { FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
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

				// Generate a unique file path
				const fileExt = file.name.split(".").pop();
				const fileName = `${crypto.randomUUID()}.${fileExt}`;
				const filePath = `documents/${fileName}`;

				// Upload to Supabase Storage
				const { error: uploadError } = await supabase.storage
					.from("documents")
					.upload(filePath, file, {
						cacheControl: "3600",
						upsert: false,
					});

				if (uploadError) {
					throw new Error(uploadError.message);
				}

				// Insert record into database
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

				if (dbError) {
					throw new Error(dbError.message);
				}

				onUploadComplete(document);

				// Trigger processing in the background (don't await)
				fetch(`/api/process/${document.id}`, { method: "POST" }).catch(
					console.error,
				);

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

			const files = Array.from(e.dataTransfer.files);
			console.error("files", files);
			const file = files[0];
			if (file) {
				uploadFile(file);
			}
		},
		[uploadFile],
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				uploadFile(file);
			}
			// Reset input so the same file can be selected again
			e.target.value = "";
		},
		[uploadFile],
	);

	return (
		<div className="w-full">
			<label
				htmlFor="file-upload"
				className={cn(
					"relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300",
					"bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
					isDragOver
						? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 scale-[1.02]"
						: "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
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

				<div className="flex flex-col items-center gap-4 p-8 text-center">
					{isUploading ? (
						<>
							<div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
								<Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
							</div>
							<div className="space-y-1">
								<p className="text-lg font-medium text-slate-700 dark:text-slate-200">
									Uploading...
								</p>
								<p className="text-sm text-slate-500 dark:text-slate-400">
									Please wait while your file is being uploaded
								</p>
							</div>
						</>
					) : (
						<>
							<div
								className={cn(
									"p-4 rounded-full transition-colors duration-300",
									isDragOver
										? "bg-emerald-100 dark:bg-emerald-900/50"
										: "bg-slate-200 dark:bg-slate-700",
								)}
							>
								<FileUp
									className={cn(
										"w-8 h-8 transition-colors duration-300",
										isDragOver
											? "text-emerald-600 dark:text-emerald-400"
											: "text-slate-500 dark:text-slate-400",
									)}
								/>
							</div>
							<div className="space-y-1">
								<p className="text-lg font-medium text-slate-700 dark:text-slate-200">
									{isDragOver ? "Drop your PDF here" : "Drag & drop your PDF"}
								</p>
								<p className="text-sm text-slate-500 dark:text-slate-400">
									or click to browse from your computer
								</p>
							</div>
						</>
					)}
				</div>
			</label>

			{error && (
				<div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
					<p className="text-sm text-red-600 dark:text-red-400 text-center">
						{error}
					</p>
				</div>
			)}
		</div>
	);
}
