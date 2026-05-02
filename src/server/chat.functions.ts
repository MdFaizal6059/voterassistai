import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SYSTEM_PROMPT, getFallbackResponse } from "./logic.server";

const ChatInput = z.object({
  message: z.string().min(1).max(2000),
});

/**
 * POST /chat equivalent — server function that calls Google Gemini
 * via the Lovable AI Gateway (which proxies to generativelanguage.googleapis.com).
 *
 * Model: google/gemini-2.5-flash-lite
 * Endpoint: https://ai.gateway.lovable.dev/v1/chat/completions
 *   (proxies Google's generativelanguage.googleapis.com)
 *
 * The API key is read from process.env (LOVABLE_API_KEY) — never exposed to client.
 * If the upstream call fails, we fall back to the local logic.ts knowledge base.
 */
export const chat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;

    // No key configured → use local fallback so the app still works.
    if (!apiKey) {
      return {
        response: getFallbackResponse(data.message),
        source: "fallback" as const,
      };
    }

    try {
      const upstream = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: data.message },
            ],
          }),
        },
      );

      if (!upstream.ok) {
        if (upstream.status === 429) {
          return {
            response:
              "We're getting a lot of questions right now — please try again in a moment.",
            source: "rate_limited" as const,
          };
        }
        if (upstream.status === 402) {
          return {
            response: getFallbackResponse(data.message),
            source: "fallback" as const,
          };
        }
        throw new Error(`Gemini gateway error ${upstream.status}`);
      }

      const json = (await upstream.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty response from Gemini");

      return { response: text, source: "gemini" as const };
    } catch (err) {
      console.error("[chat] Gemini call failed, using fallback:", err);
      return {
        response: getFallbackResponse(data.message),
        source: "fallback" as const,
      };
    }
  });
