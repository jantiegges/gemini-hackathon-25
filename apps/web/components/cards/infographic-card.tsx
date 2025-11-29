"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { InfographicCardContent } from "@/lib/cards";
import { createClient } from "@/lib/supabase/client";

interface InfographicCardProps {
	content: InfographicCardContent;
	onContinue: () => void;
}

export function InfographicCard({ content, onContinue }: InfographicCardProps) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-100 to-fuchsia-200 dark:from-fuchsia-900/30 dark:to-fuchsia-800/30">
					<ImageIcon className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
				</div>
				<h2 className="text-xl font-semibold text-slate-800 dark:text-white">
					{content.title}
				</h2>
			</div>

			{/* Image */}
			<div className="flex-1 flex items-center justify-center">
				{isLoading ? (
					<div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex items-center justify-center">
						<ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
					</div>
				) : error ? (
					<div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center gap-2">
						<ImageIcon className="w-12 h-12 text-slate-400" />
						<p className="text-sm text-slate-500">{error}</p>
					</div>
				) : (
					<div className="w-full rounded-xl overflow-hidden shadow-lg relative aspect-[4/3]">
						<Image
							src={imageUrl || ""}
							alt={content.description}
							fill
							className="object-contain"
							unoptimized
						/>
					</div>
				)}
			</div>

			{/* Caption */}
			{content.caption && (
				<p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400 italic">
					{content.caption}
				</p>
			)}

			{/* Description */}
			<p className="mt-4 text-slate-600 dark:text-slate-300 text-center">
				{content.description}
			</p>

			{/* Continue button */}
			<div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
				<Button
					onClick={onContinue}
					className="w-full bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/25"
					size="lg"
				>
					Continue
					<ArrowRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);
}
