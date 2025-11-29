import { DocumentsContainer } from "@/components/documents-container";
import { createClient } from "@/lib/supabase/server";
import type { Document } from "@/lib/types";
import { FileUp } from "lucide-react";

export default async function Page() {
	const supabase = await createClient();

	const { data: documents } = await supabase
		.from("documents")
		.select("*")
		.order("created_at", { ascending: false });

	return (
		<div className="min-h-svh bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
			{/* Decorative background elements */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-300/20 dark:from-emerald-900/20 dark:to-teal-800/10 blur-3xl" />
				<div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-rose-200/30 to-orange-300/20 dark:from-rose-900/20 dark:to-orange-800/10 blur-3xl" />
				<div className="absolute -bottom-40 right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-violet-200/30 to-indigo-300/20 dark:from-violet-900/20 dark:to-indigo-800/10 blur-3xl" />
			</div>

			<div className="relative max-w-3xl mx-auto px-6 py-16">
				{/* Header */}
				<header className="text-center mb-12">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/10 mb-6">
						<FileUp className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
						Document Upload
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
						Upload and manage your PDF documents in one place
					</p>
				</header>

				{/* Main Content */}
				<main>
					<DocumentsContainer
						initialDocuments={(documents as Document[]) ?? []}
					/>
				</main>
			</div>
		</div>
	);
}
