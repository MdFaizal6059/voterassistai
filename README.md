# 🗳️ AI Elections Assistant — India

A production-ready AI assistant for **Indian Lok Sabha Elections, Parliamentary Elections, and Tamil Nadu State Elections**.

> **This application integrates the Google Gemini API for AI-powered responses and Google Maps for location-based services.**

## 🎯 Vertical

Elections Assistant — scoped to Indian Lok Sabha / Parliamentary Elections and the Tamil Nadu State Legislative Assembly Elections.

## 🧱 Approach & Architecture

- **Frontend:** React 19 + TanStack Router + Tailwind CSS v4. Fully responsive, accessible (semantic HTML, `aria-label`s).
- **Backend:** TanStack Start server function (`src/server/chat.functions.ts`) — same Node-style RPC as an Express `POST /chat`, automatically deployed.
- **AI:** **Google Gemini** (`google/gemini-2.5-flash-lite`) called server-side via the Lovable AI Gateway, which proxies `https://generativelanguage.googleapis.com`.
- **Fallback:** If the Gemini call fails (rate limit, network, missing key), the server falls back to the local `src/server/logic.ts` knowledge base so the app keeps working.
- **Maps:** Google Maps **iframe embed** (no API key, no billing required).
- **Tests:** Vitest — `test/logic.test.ts` covers classification + fallback responses.

## 🌐 Google Services Usage

| Where | Service |
|---|---|
| Backend API call | **Google Gemini API** via `generativelanguage.googleapis.com` (proxied by the AI Gateway) |
| UI map widget | **Google Maps iframe embed** — `https://www.google.com/maps?q=...&output=embed` |
| UI footer | "Powered by Google Gemini AI" |

## 🏛️ Official Data Sources

The assistant's system prompt and fallback responses are grounded in:
- **Election Commission of India (ECI)** — https://eci.gov.in
- **ECINET** — official ECI digital platform for voter registration, status checks, and polling booth lookup
- **Tamil Nadu Chief Electoral Officer** — https://elections.tn.gov.in (electoral rolls, state polling instructions)

These are surfaced in-app under the **Official Resources** section.

## 🔐 Security

- The Gemini API key (`LOVABLE_API_KEY`) is read **only** server-side from `process.env`.
- It is never bundled into the frontend, never stored in code, and never persisted in a database.
- All user input is validated with Zod (`min(1).max(2000)`).

## 🧪 Testing

Run the test suite locally:

```bash
bunx vitest run
```

Covered cases:
- "How to vote" → classified and answered correctly
- "First-time voter" → classified and answered correctly
- Documents query → classified correctly
- Out-of-scope query → graceful default

## 🚀 Deployment

This app is built on the Lovable stack and **deploys with one click** via the Publish button — no `vercel.json`, no Express boot script, no manual config required. Server functions and static assets are bundled and deployed automatically.

## 📝 Assumptions

- The application is informational; it does not transact with ECI systems or cast votes.
- "Polling station" map is a generic Tamil Nadu lookup — for an exact booth, users are directed to ECINET (which authenticates them with their EPIC number).
- Gemini responses can occasionally vary — for legally-binding actions, users are always pointed to official ECI / Tamil Nadu CEO sources.
