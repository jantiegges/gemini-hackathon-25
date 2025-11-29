"use client";

import { Button } from "@workspace/ui/components/button";
import { AlertCircle, ArrowRight, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InteractiveVisualCardContent } from "@/lib/cards";

interface InteractiveVisualCardProps {
	content: InteractiveVisualCardContent;
	onContinue: () => void;
}

export function InteractiveVisualCard({
	content,
	onContinue,
}: InteractiveVisualCardProps) {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const iframeRef = useRef<HTMLIFrameElement>(null);

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
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/30 dark:to-teal-800/30">
						<Play className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
					</div>
					<h2 className="text-xl font-semibold text-slate-800 dark:text-white">
						{content.title}
					</h2>
				</div>
				<button
					type="button"
					onClick={handleRestart}
					className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
					title="Restart visualization"
				>
					↻ Restart
				</button>
			</div>

			{/* Visualization Container */}
			<div className="flex-1 flex items-center justify-center min-h-0">
				<div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-slate-900 relative">
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-slate-900">
							<div className="flex flex-col items-center gap-3">
								<div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
								<p className="text-sm text-slate-400">
									Loading visualization...
								</p>
							</div>
						</div>
					)}

					{error ? (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-3">
							<AlertCircle className="w-10 h-10 text-red-400" />
							<p className="text-sm text-slate-400">{error}</p>
							<p className="text-xs text-slate-500 max-w-xs text-center">
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
								style={{ minHeight: "300px" }}
							/>
						)
					)}
				</div>
			</div>

			{/* Description */}
			<p className="mt-4 text-sm text-slate-500 dark:text-slate-400 text-center">
				{content.description}
			</p>

			{/* Continue button */}
			<div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
				<Button
					onClick={onContinue}
					className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
					size="lg"
				>
					Continue
					<ArrowRight className="w-4 h-4 ml-2" />
				</Button>
			</div>
		</div>
	);
}
