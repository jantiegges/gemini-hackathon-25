import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig = {
	transpilePackages: ["@workspace/ui"],
	experimental: {
		typedRoutes: true,
	},
} satisfies NextConfig;

export default withWorkflow(nextConfig);
