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
			{/* Image Container with hover overlay */}
			<div className="flex-1 flex items-center justify-center min-h-0 relative group">
				{isLoading ? (
					<div className="w-full h-full bg-slate-100 rounded-xl animate-pulse flex items-center justify-center">
						<ImageIcon className="w-12 h-12 text-slate-300" />
					</div>
				) : error ? (
					<div className="w-full h-full bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-2">
						<ImageIcon className="w-12 h-12 text-slate-400" />
						<p className="text-sm text-slate-500">{error}</p>
					</div>
				) : (
					<>
						<div className="w-full h-full rounded-xl overflow-hidden shadow-lg relative">
							<Image
								src={imageUrl || ""}
								alt={content.description}
								fill
								className="object-contain"
								unoptimized
							/>
						</div>
						{/* Text overlay - appears on hover */}
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-xl pointer-events-none">
							<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-4">
								{/* Caption */}
								{content.caption && (
									<p className="text-sm text-white/90 italic mb-2">
										{content.caption}
									</p>
								)}
								{/* Description */}
								<p className="text-base text-white/95 leading-relaxed">
									{content.description}
								</p>
							</div>
						</div>
					</>
				)}
			</div>

			{/* Continue button */}
			<div className="mt-auto pt-6 border-t border-slate-200">
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
