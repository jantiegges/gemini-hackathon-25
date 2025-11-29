"use client";

import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

interface MarkdownContentProps {
	content: string;
	className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
	return (
		<div
			className={`prose prose-slate max-w-none
				prose-headings:text-slate-900
				prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
				prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6
				prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
				prose-p:text-slate-900 prose-p:mb-3 prose-p:leading-relaxed
				prose-strong:text-slate-900 prose-strong:font-semibold
				prose-ul:text-slate-900 prose-ul:my-2
				prose-ol:text-slate-900 prose-ol:my-2
				prose-li:my-1 prose-li:marker:text-slate-700
				prose-code:text-violet-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
				${className || ""}`}
		>
			<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
				{content}
			</ReactMarkdown>
		</div>
	);
}
