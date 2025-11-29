"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
	ArrowRight,
	Loader2,
	PauseCircle,
	PlayCircle,
	RefreshCw,
	Video,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoLearningCardContent } from "@/lib/cards";
import { createClient } from "@/lib/supabase/client";

interface VideoLearningCardProps {
	content: VideoLearningCardContent;
	onContinue: () => void;
}

type VideoState = "loading" | "ready" | "playing" | "paused" | "error";

export function VideoLearningCard({
	content,
	onContinue,
}: VideoLearningCardProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [videoState, setVideoState] = useState<VideoState>("loading");
	const [error, setError] = useState<string | null>(null);
	const [isMuted, setIsMuted] = useState(false);
	const [progress, setProgress] = useState(0);
	const [hasWatched, setHasWatched] = useState(false);

	// Load video URL from Supabase storage
	useEffect(() => {
		const loadVideo = async () => {
			try {
				const supabase = createClient();
				const { data, error } = await supabase.storage
					.from("documents")
					.createSignedUrl(content.videoPath, 3600); // 1 hour expiry

				if (error) {
					setError("Could not load video");
					setVideoState("error");
					console.error("Error creating signed URL:", error);
				} else if (data?.signedUrl) {
					setVideoUrl(data.signedUrl);
					setVideoState("ready");
				} else {
					setError("Could not load video");
					setVideoState("error");
				}
			} catch (err) {
				setError("Failed to load video");
				setVideoState("error");
				console.error("Error loading video:", err);
			}
		};

		loadVideo();
	}, [content.videoPath]);

	// Handle video events
	const handlePlay = useCallback(() => {
		setVideoState("playing");
	}, []);

	const handlePause = useCallback(() => {
		setVideoState("paused");
	}, []);

	const handleEnded = useCallback(() => {
		setVideoState("paused");
		setHasWatched(true);
		setProgress(100);
	}, []);

	const handleTimeUpdate = useCallback(() => {
		if (videoRef.current) {
			const currentProgress =
				(videoRef.current.currentTime / videoRef.current.duration) * 100;
			setProgress(currentProgress);

			// Mark as watched if user has seen at least 80%
			if (currentProgress >= 80) {
				setHasWatched(true);
			}
		}
	}, []);

	const handleError = useCallback(() => {
		setError("Failed to play video");
		setVideoState("error");
	}, []);

	// Control functions
	const togglePlay = useCallback(() => {
		if (videoRef.current) {
			if (videoState === "playing") {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
		}
	}, [videoState]);

	const toggleMute = useCallback(() => {
		if (videoRef.current) {
			videoRef.current.muted = !videoRef.current.muted;
			setIsMuted(!isMuted);
		}
	}, [isMuted]);

	const handleRetry = useCallback(() => {
		if (videoRef.current) {
			setError(null);
			setVideoState("ready");
			videoRef.current.load();
		}
	}, []);

	const handleSeek = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
		if (videoRef.current) {
			const rect = e.currentTarget.getBoundingClientRect();
			const clickPosition = (e.clientX - rect.left) / rect.width;
			videoRef.current.currentTime = clickPosition * videoRef.current.duration;
		}
	}, []);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<div className="p-2 rounded-lg bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30">
					<Video className="w-5 h-5 text-rose-600 dark:text-rose-400" />
				</div>
				<div className="flex-1">
					<h2 className="text-xl font-semibold text-slate-800 dark:text-white">
						{content.topic}
					</h2>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						{content.duration}s video
					</p>
				</div>
			</div>

			{/* Video Player */}
			<div className="flex-1 flex flex-col">
				<div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg">
					{/* Loading state */}
					{videoState === "loading" && (
						<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
							<div className="flex flex-col items-center gap-4">
								<div className="relative">
									<div className="w-16 h-16 rounded-full border-4 border-rose-500/20" />
									<Loader2 className="absolute inset-0 w-16 h-16 text-rose-500 animate-spin" />
								</div>
								<span className="text-sm text-slate-400">Loading video...</span>
							</div>
						</div>
					)}

					{/* Error state */}
					{videoState === "error" && (
						<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
							<div className="flex flex-col items-center gap-4 text-center px-6">
								<Video className="w-16 h-16 text-slate-600" />
								<p className="text-slate-400">{error}</p>
								<Button
									variant="outline"
									size="sm"
									onClick={handleRetry}
									className="gap-2"
								>
									<RefreshCw className="w-4 h-4" />
									Retry
								</Button>
							</div>
						</div>
					)}

					{/* Video element */}
					{videoUrl && (
						<video
							ref={videoRef}
							src={videoUrl}
							className={cn(
								"w-full h-full object-contain transition-opacity",
								videoState === "loading" || videoState === "error"
									? "opacity-0"
									: "opacity-100",
							)}
							onPlay={handlePlay}
							onPause={handlePause}
							onEnded={handleEnded}
							onTimeUpdate={handleTimeUpdate}
							onError={handleError}
							onLoadedData={() => setVideoState("ready")}
							playsInline
							preload="metadata"
						>
							{/* Captions track for accessibility */}
							<track kind="captions" label="English" srcLang="en" default />
						</video>
					)}

					{/* Play/Pause overlay (shown when ready or paused) */}
					{(videoState === "ready" || videoState === "paused") && videoUrl && (
						<button
							type="button"
							onClick={togglePlay}
							className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
							aria-label="Play video"
						>
							<div className="w-20 h-20 rounded-full bg-white/90 dark:bg-slate-800/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
								<PlayCircle className="w-12 h-12 text-rose-600 dark:text-rose-400 ml-1" />
							</div>
						</button>
					)}

					{/* Controls bar (shown when playing) */}
					{videoState === "playing" && (
						<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
							<div className="flex items-center gap-4">
								{/* Play/Pause button */}
								<button
									type="button"
									onClick={togglePlay}
									className="text-white hover:text-rose-400 transition-colors"
									aria-label="Pause"
								>
									<PauseCircle className="w-8 h-8" />
								</button>

								{/* Progress bar */}
								<button
									type="button"
									className="flex-1 h-2 bg-white/30 rounded-full cursor-pointer group"
									onClick={handleSeek}
									aria-label="Seek video"
								>
									<div
										className="h-full bg-rose-500 rounded-full transition-all relative"
										style={{ width: `${progress}%` }}
									>
										<div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
									</div>
								</button>

								{/* Mute button */}
								<button
									type="button"
									onClick={toggleMute}
									className="text-white hover:text-rose-400 transition-colors"
									aria-label={isMuted ? "Unmute" : "Mute"}
								>
									{isMuted ? (
										<VolumeX className="w-6 h-6" />
									) : (
										<Volume2 className="w-6 h-6" />
									)}
								</button>
							</div>
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
				<p className="mt-3 text-slate-600 dark:text-slate-300 text-center">
					{content.description}
				</p>
			</div>

			{/* Watch indicator */}
			{hasWatched && (
				<div className="mt-4 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
					<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
					<span className="text-sm font-medium">Video watched</span>
				</div>
			)}

			{/* Continue button */}
			<div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
				<Button
					onClick={onContinue}
					className={cn(
						"w-full shadow-lg",
						hasWatched
							? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-rose-500/25"
							: "bg-gradient-to-r from-slate-400 to-slate-500 hover:from-rose-500 hover:to-rose-600 text-white",
					)}
					size="lg"
				>
					{hasWatched ? "Continue" : "Skip Video"}
					<ArrowRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);
}
