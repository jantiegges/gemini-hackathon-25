"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButtonLink() {
	const router = useRouter();

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		router.push("/");
	};

	return (
		<button
			onClick={handleClick}
			type="button"
			className="fixed top-6 left-6 z-50 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm pointer-events-auto"
			aria-label="Go back to home page"
		>
			<ArrowLeft className="w-5 h-5" />
		</button>
	);
}

