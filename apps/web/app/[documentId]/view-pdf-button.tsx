"use client";

import { FileText } from "lucide-react";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ViewPdfButtonProps {
	path: string;
}

export function ViewPdfButton({ path }: ViewPdfButtonProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleOpenPdf = useCallback(async () => {
		setIsLoading(true);
		try {
			const supabase = createClient();
			// Use signed URL for private buckets (valid for 1 hour)
			const { data, error } = await supabase.storage
				.from("documents")
				.createSignedUrl(path, 3600);

			if (error) {
				console.error("Error creating signed URL:", error);
				// Fallback to public URL
				const { data: publicData } = supabase.storage
					.from("documents")
					.getPublicUrl(path);
				if (publicData?.publicUrl) {
					window.open(publicData.publicUrl, "_blank");
				}
				return;
			}

			if (data?.signedUrl) {
				window.open(data.signedUrl, "_blank");
			}
		} finally {
			setIsLoading(false);
		}
	}, [path]);

	return (
		<button
			type="button"
			onClick={handleOpenPdf}
			disabled={isLoading}
			className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white/60 hover:bg-white text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors disabled:opacity-50"
		>
			<FileText className="w-4 h-4" />
			<span className="hidden sm:inline">
				{isLoading ? "Loading..." : "View Document"}
			</span>
		</button>
	);
}
