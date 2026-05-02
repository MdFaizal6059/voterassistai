import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SYSTEM_PROMPT, getFallbackResponse } from "@/lib/election-logic";

const ChatRequest = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let message = "";

        try {
          const parsed = ChatRequest.safeParse(await request.json());
          if (!parsed.success) {
            return Response.json(
              { error: "Please send a valid election question." },
              { status: 400 },
            );
          }

          message = parsed.data.message;
          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey || apiKey === "your_gemini_api_key_here") {
            return Response.json({
              response: getFallbackResponse(message),
              source: "fallback",
            });
          }

          const geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
              },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: SYSTEM_PROMPT }],
                },
                contents: [
                  {
                    role: "user",
                    parts: [{ text: message }],
                  },
                ],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 900,
                },
              }),
            },
          );

          if (!geminiResponse.ok) {
            console.error("[api/chat] Gemini error", geminiResponse.status);
            return Response.json({
              response: getFallbackResponse(message),
              source: "fallback",
            });
          }

          const data = (await geminiResponse.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const response = data.candidates?.[0]?.content?.parts
            ?.map((part) => part.text ?? "")
            .join("")
            .trim();

          return Response.json({
            response: response || getFallbackResponse(message),
            source: response ? "gemini" : "fallback",
          });
        } catch (error) {
          console.error("[api/chat] Request failed", error);
          return Response.json({
            response: getFallbackResponse(message),
            source: "fallback",
          });
        }
      },
    },
  },
});