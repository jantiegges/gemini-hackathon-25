"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { InfographicCardContent } from "@/lib/cards";
import { createClient } from "@/lib/supabase/client";
import type { ActionButtonConfig } from "./card-template";

interface InfographicCardProps {
	content: InfographicCardContent;
	onContinue: () => void;
	setActionButton: (config: ActionButtonConfig | null) => void;
}

export function InfographicCard({
	content,
	onContinue,
	setActionButton,
}: InfographicCardProps) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Set up action button
	useEffect(() => {
		setActionButton({
			onClick: onContinue,
			text: "Continue",
			className:
				"w-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/25 text-sm sm:text-base",
			showArrow: true,
		});
	}, [onContinue, setActionButton]);

	useEffect(() => {
		const loadImage = async () => {
			try {
				const supabase = createClient();
				console.log("content.imagePath", content.imagePath);
				const { data, error } = await supabase.storage
					.from("documents")
					.createSignedUrl(content.imagePath, 3600);

				if (error) {
					setError("Could not load image");
					console.error("Error creating signed URL:", error);
				} else if (data?.signedUrl) {
					setImageUrl(data.signedUrl);
				} else {
					setError("Could not load image");
				}
			} catch (err) {
				setError("Failed to load image");
				console.error("Error loading infographic:", err);
			} finally {
				setIsLoading(false);
			}
		};

		loadImage();
	}, [content.imagePath]);

	console.log("imageUrl", imageUrl);

	return (
		<div className="flex flex-col h-full">
			{/* Image Container with hover overlay */}
			<div className="flex-1 flex items-center justify-center min-h-0 relative group overflow-hidden">
				{isLoading ? (
					<div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg sm:rounded-xl animate-pulse flex items-center justify-center">
						<ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-600" />
					</div>
				) : error ? (
					<div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg sm:rounded-xl flex flex-col items-center justify-center gap-2 p-4">
						<ImageIcon className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-500" />
						<p className="text-xs sm:text-sm font-light text-slate-900/95 dark:text-slate-100 text-center">
							{error}
						</p>
					</div>
				) : (
					<>
						<div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden shadow-lg relative">
							<Image
								src={imageUrl || ""}
								alt={content.description}
								fill
								className="object-contain"
								unoptimized
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
							/>
						</div>
						{/* Text overlay - appears on hover/touch */}
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 group-hover:bg-black/40 active:bg-black/40 transition-all duration-300 rounded-lg sm:rounded-xl pointer-events-none">
							<div className="opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 text-center px-3 sm:px-4">
								{/* Caption */}
								{content.caption && (
									<p className="text-xs sm:text-sm font-light text-white italic mb-1 sm:mb-2">
										{content.caption}
									</p>
								)}
								{/* Description */}
								<p className="text-sm sm:text-base font-light text-white leading-relaxed">
									{content.description}
								</p>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
