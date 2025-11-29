"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { createClient } from "@/lib/supabase/client";
import type { TextCardContent } from "@/lib/types";

interface TextCardProps {
	content: TextCardContent;
	onContinue: () => void;
}

export function TextCard({ content, onContinue }: TextCardProps) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isLoadingImage, setIsLoadingImage] = useState(!!content.imagePath);

	// Debug logging
	console.log("[TextCard] Content received:", {
		title: content.title,
		imagePath: content.imagePath,
		imageDescription: content.imageDescription,
		hasImagePath: !!content.imagePath,
	});

	useEffect(() => {
		if (!content.imagePath) {
			console.log("[TextCard] No imagePath found in content");
			setIsLoadingImage(false);
			return;
		}

		console.log("[TextCard] Loading image from path:", content.imagePath);

		const loadImage = async () => {
			try {
				const supabase = createClient();
				console.log("[TextCard] Fetching signed URL for:", content.imagePath);
				const { data, error } = await supabase.storage
					.from("documents")
					.createSignedUrl(content.imagePath!, 3600);

				if (error) {
					console.error("[TextCard] Error creating signed URL:", error);
				} else if (data?.signedUrl) {
					console.log("[TextCard] Got signed URL:", data.signedUrl);
					setImageUrl(data.signedUrl);
				} else {
					console.warn("[TextCard] No signed URL returned");
				}
			} catch (err) {
				console.error("[TextCard] Error loading text card image:", err);
			} finally {
				setIsLoadingImage(false);
			}
		};

		loadImage();
	}, [content.imagePath]);

	return (
		<div className="flex flex-col h-full">
			{/* Header Image (if available) */}
			{content.imagePath && (
				<div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shrink-0">
					{isLoadingImage ? (
						<div className="w-full h-full flex items-center justify-center animate-pulse">
							<ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
						</div>
					) : imageUrl ? (
						<Image
							src={imageUrl}
							alt={content.imageDescription || content.title}
							fill
							className="object-cover"
							unoptimized
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
						</div>
					)}
					{/* Subtle gradient overlay for better text contrast below */}
					<div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
				</div>
			)}

			{/* Content */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="text-sm sm:text-base font-light leading-relaxed text-slate-600/90 dark:text-slate-200 [&_p]:mb-3 sm:[&_p]:mb-4">
					<MarkdownContent content={content.body} />
				</div>
			</div>

			{/* Continue button */}
			<div className="mt-auto pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
				<Button
					onClick={onContinue}
					className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg shadow-sky-500/25 text-sm sm:text-base"
					size="lg"
				>
					Continue
					<ArrowRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);
}
