"use client";

import { createClient } from "@/lib/supabase/client";
import type { DocumentStatus } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface DocumentPageClientProps {
	documentId: string;
	initialStatus: DocumentStatus;
	children: React.ReactNode;
}

export function DocumentPageClient({
	documentId,
	initialStatus,
	children,
}: DocumentPageClientProps) {
	const router = useRouter();

	useEffect(() => {
		// If already completed or failed, no need to poll
		if (initialStatus === "completed" || initialStatus === "failed") {
			return;
		}

		const supabase = createClient();

		// Poll for status updates
		const interval = setInterval(async () => {
			const { data } = await supabase
				.from("documents")
				.select("status")
				.eq("id", documentId)
				.single();

			if (data?.status === "completed" || data?.status === "failed") {
				// Refresh the page to show the updated content
				router.refresh();
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [documentId, initialStatus, router]);

	return <>{children}</>;
}

