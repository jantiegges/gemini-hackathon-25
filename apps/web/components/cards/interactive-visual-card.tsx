"use client";

import { AlertCircle, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InteractiveVisualCardContent } from "@/lib/cards";
import type { ActionButtonConfig } from "./card-template";

interface InteractiveVisualCardProps {
	content: InteractiveVisualCardContent;
	onContinue: () => void;
	setActionButton: (config: ActionButtonConfig | null) => void;
}

export function InteractiveVisualCard({
	content,
	onContinue,
	setActionButton,
}: InteractiveVisualCardProps) {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	// Set up action button
	useEffect(() => {
		setActionButton({
			onClick: onContinue,
			text: "Continue",
			className:
				"w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 text-sm sm:text-base",
			showArrow: true,
		});
	}, [onContinue, setActionButton]);

	// Create blob URL from HTML content
	useEffect(() => {
		try {
			const blob = new Blob([content.html], { type: "text/html" });
			const url = URL.createObjectURL(blob);
			setBlobUrl(url);
			setIsLoading(false);

			// Cleanup blob URL on unmount
			return () => {
				URL.revokeObjectURL(url);
			};
		} catch (err) {
			console.error("Failed to create blob URL:", err);
			setError("Failed to load visualization");
			setIsLoading(false);
		}
	}, [content.html]);

	// Handle iframe load
	const handleIframeLoad = useCallback(() => {
		setIsLoading(false);
	}, []);

	// Handle iframe error
	const handleIframeError = useCallback(() => {
		setError("Failed to render visualization");
		setIsLoading(false);
	}, []);

	// Restart the visualization by recreating the blob URL
	const handleRestart = useCallback(() => {
		if (blobUrl) {
			URL.revokeObjectURL(blobUrl);
		}
		setIsLoading(true);
		const blob = new Blob([content.html], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		setBlobUrl(url);
		setIsLoading(false);
	}, [blobUrl, content.html]);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
				<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
					<div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/30 dark:to-teal-800/30 flex-shrink-0">
						<Play className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
					</div>
					<h2 className="text-base sm:text-xl font-semibold text-slate-800/90 dark:text-white truncate">
						{content.title}
					</h2>
				</div>
				<button
					type="button"
					onClick={handleRestart}
					className="text-xs sm:text-sm font-light text-slate-900/95 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors flex-shrink-0 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
					title="Restart visualization"
				>
					↻ <span className="hidden sm:inline">Restart</span>
				</button>
			</div>

			{/* Visualization Container */}
			<div className="flex-1 flex items-center justify-center min-h-0">
				<div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-900 relative">
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-slate-900">
							<div className="flex flex-col items-center gap-2 sm:gap-3">
								<div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
								<p className="text-xs sm:text-sm font-light text-slate-300">
									Loading visualization...
								</p>
							</div>
						</div>
					)}

					{error ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-2 sm:gap-3 p-4">
							<AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
							<p className="text-xs sm:text-sm font-light text-slate-300 text-center">
								{error}
							</p>
							<p className="text-xs font-light text-slate-300 max-w-xs text-center">
								{content.description}
							</p>
						</div>
					) : (
						blobUrl && (
							<iframe
								ref={iframeRef}
								src={blobUrl}
								title={content.title}
								className="w-full h-full border-0"
								sandbox="allow-scripts"
								onLoad={handleIframeLoad}
								onError={handleIframeError}
								style={{ minHeight: "250px" }}
							/>
						)
					)}
				</div>
			</div>

			{/* Description */}
			<p className="mt-3 sm:mt-4 text-xs sm:text-sm font-light text-slate-900/95 dark:text-slate-100 text-center px-2">
				{content.description}
			</p>
		</div>
	);
}
