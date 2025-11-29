"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ImageIcon, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Lesson } from "@/lib/types";

interface LessonCardProps {
	lesson: Lesson;
	documentId: string;
	imagePath: string | null;
}

export function LessonCard({ lesson, documentId, imagePath }: LessonCardProps) {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!imagePath) {
			setIsLoading(false);
			return;
		}

		const loadImage = async () => {
			try {
				const supabase = createClient();
				const { data, error } = await supabase.storage
					.from("documents")
					.createSignedUrl(imagePath, 3600);

				if (error) {
					console.error("Error creating signed URL:", error);
				} else if (data?.signedUrl) {
					setImageUrl(data.signedUrl);
				}
			} catch (err) {
				console.error("Error loading image:", err);
			} finally {
				setIsLoading(false);
			}
		};

		loadImage();
	}, [imagePath]);

	const progress = lesson.best_score ?? 0;
	const isCompleted = lesson.is_completed;

	return (
		<Link
			href={`/${documentId}/${lesson.id}`}
			className="group block flex-shrink-0 w-[400px] h-[240px]"
		>
			<div
				className={cn(
					"relative w-full h-full rounded-2xl overflow-hidden transition-all duration-300",
					"bg-slate-100 border border-slate-200 hover:border-app-blob-purple hover:shadow-xl hover:shadow-app-blob-purple/20",
				)}
			>
				{/* Background Image */}
				{isLoading ? (
					<div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
						<ImageIcon className="w-12 h-12 text-slate-300" />
					</div>
				) : imageUrl ? (
					<Image
						src={imageUrl}
						alt={lesson.title}
						fill
						className="object-cover group-hover:scale-105 transition-transform duration-300"
						unoptimized
					/>
				) : (
					<div className="absolute inset-0 bg-gradient-to-br from-app-blob-purple/20 to-app-blob-blue/20 flex items-center justify-center">
						<ImageIcon className="w-12 h-12 text-slate-400" />
					</div>
				)}

				{/* Dark overlay gradient at bottom for text readability */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

				{/* Progress Indicator - Top Left */}
				<div className="absolute top-4 left-4">
					<div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg">
						<div className="flex items-center gap-1.5">
							<div
								className={cn(
									"w-2 h-2 rounded-full",
									isCompleted ? "bg-app-accent-cyan" : "bg-app-blob-purple",
								)}
							/>
							<span className="text-xs font-medium text-slate-700">
								{isCompleted ? "Completed" : `${progress}%`}
							</span>
						</div>
					</div>
				</div>

				{/* Play Button - Top Right */}
				<div className="absolute top-4 right-4">
					<Button
						className={cn(
							"rounded-full shadow-lg",
							isCompleted
								? "bg-app-accent-cyan hover:bg-app-accent-cyan/90"
								: "bg-app-blob-purple hover:bg-app-blob-purple/90",
						)}
						size="icon"
						onClick={(e) => {
							e.preventDefault();
							window.location.href = `/${documentId}/${lesson.id}`;
						}}
					>
						<Play className="w-5 h-5" fill="currentColor" />
					</Button>
				</div>

				{/* Title - Bottom Left */}
				<div className="absolute bottom-4 left-4 right-4">
					<h3 className="font-semibold text-white text-lg line-clamp-2 drop-shadow-lg min-h-[3rem] flex items-end">
						{lesson.title}
					</h3>
				</div>
			</div>
		</Link>
	);
}
