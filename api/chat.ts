import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SYSTEM_PROMPT, getFallbackResponse } from "../src/lib/election-logic";

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawMessage = typeof req.body?.message === "string" ? req.body.message : "";
  const message = rawMessage.trim();

  if (!message || message.length > 2000) {
    return res.status(400).json({ error: "Please send a valid election question." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return res.status(200).json({ response: getFallbackResponse(message), source: "fallback" });
  }

  try {
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: message }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 900 },
        }),
      },
    );

    if (!geminiResponse.ok) {
      return res.status(200).json({ response: getFallbackResponse(message), source: "fallback" });
    }

    const data = (await geminiResponse.json()) as GeminiResponse;
    const response = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    return res.status(200).json({
      response: response || getFallbackResponse(message),
      source: response ? "gemini" : "fallback",
    });
  } catch (error) {
    console.error("[vercel/api/chat] Request failed", error);
    return res.status(200).json({ response: getFallbackResponse(message), source: "fallback" });
  }
}