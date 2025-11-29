import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
	throw new Error("GEMINI_API_KEY environment variable is required");
}

const client = new GoogleGenAI({ apiKey });

/**
 * Generate an ephemeral token for client-side Live API access.
 * This prevents exposing the API key in the browser.
 *
 * Ephemeral tokens are short-lived and can only be used with the Live API.
 * They expire quickly to reduce security risks in client-side applications.
 */
export async function POST() {
	try {
		// Token expires in 30 minutes
		const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
		// New sessions can be started within 2 minutes
		const newSessionExpireTime = new Date(
			Date.now() + 2 * 60 * 1000,
		).toISOString();

		const token = await client.authTokens.create({
			config: {
				uses: 1,
				expireTime: expireTime,
				newSessionExpireTime: newSessionExpireTime,
				httpOptions: { apiVersion: "v1alpha" },
			},
		});

		// Return the token name (this is what the client uses as the API key)
		return NextResponse.json({
			token: token.name,
			expireTime: expireTime,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Token generation failed",
			},
			{ status: 500 },
		);
	}
}
