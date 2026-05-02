import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Vote, UserPlus, FileText, MapPin, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImg from "@/assets/hero-elections.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AI Elections Assistant — Lok Sabha & Tamil Nadu | Official Voter Help" },
      {
        name: "description",
        content:
          "AI assistant for Indian Lok Sabha, Parliamentary, and Tamil Nadu State Elections. Powered by Google Gemini. Grounded in ECI, ECINET & Tamil Nadu CEO data.",
      },
      { property: "og:title", content: "AI Elections Assistant — India" },
      {
        property: "og:description",
        content:
          "Voter guidance for Lok Sabha and Tamil Nadu Elections, powered by Google Gemini and official ECI / ECINET data.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
});

type Message = { role: "user" | "assistant"; content: string };

const QUICK_ACTIONS = [
  { label: "How to Vote", query: "How do I vote in the Lok Sabha elections?", Icon: Vote },
  { label: "First-Time Voter", query: "First-time voter steps", Icon: UserPlus },
  { label: "Required Documents", query: "What documents do I need to carry to the polling booth?", Icon: FileText },
] as const;

function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste 🙏 I'm your AI Elections Assistant for **Indian Lok Sabha**, **Parliamentary**, and **Tamil Nadu State** Elections. Ask me anything, or tap a quick action below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setMessages((m) => [...m, { role: "user", content: trimmed }]);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        const data = (await res.json()) as { response?: string; error?: string };
        const response = data.response;
        if (!res.ok || !response) {
          throw new Error(data.error || "Chat request failed");
        }

        setMessages((m) => [...m, { role: "assistant", content: response }]);
      } catch (err) {
        console.error(err);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't reach the AI service. Please try again, or visit ECINET / the Tamil Nadu CEO website for official guidance.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="Indian flag representing democratic elections"
            width={1536}
            height={768}
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        </div>
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-card)]">
            <Sparkles className="h-3.5 w-3.5 text-saffron" aria-hidden />
            Powered by Google Gemini AI
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            AI Elections Assistant
            <span className="block bg-gradient-to-r from-saffron via-foreground to-india-green bg-clip-text text-transparent">
              for Indian Voters
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Guidance for <strong>Lok Sabha</strong>, <strong>Parliamentary</strong>, and{" "}
            <strong>Tamil Nadu State</strong> Elections — grounded in official{" "}
            <strong>ECI</strong>, <strong>ECINET</strong>, and{" "}
            <strong>Tamil Nadu CEO</strong> sources.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
        {/* Chat */}
        <section aria-label="Chat with the Elections Assistant" className="flex flex-col">
          <Card className="flex h-[600px] flex-col overflow-hidden p-0 shadow-[var(--shadow-soft)]">
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
              aria-live="polite"
            >
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {loading && <TypingIndicator />}
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 border-t border-border bg-secondary/40 p-3">
              {QUICK_ACTIONS.map(({ label, query, Icon }) => (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => send(query)}
                  aria-label={`Quick action: ${label}`}
                  className="gap-1.5"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </Button>
              ))}
            </div>

            {/* Input */}
            <form
              className="flex gap-2 border-t border-border bg-card p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <label htmlFor="chat-input" className="sr-only">
                Ask a question about Indian elections
              </label>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about voting, registration, documents…"
                aria-label="Type your election question"
                disabled={loading}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                maxLength={2000}
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="gap-1.5"
              >
                <Send className="h-4 w-4" aria-hidden />
                Send
              </Button>
            </form>
          </Card>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Map */}
          <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
            <div className="border-b border-border bg-secondary/40 p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-saffron" aria-hidden />
                Find your nearest polling station
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Powered by Google Maps. For your exact booth, use ECINET with your EPIC number.
              </p>
            </div>
            <iframe
              title="Google Maps — Tamil Nadu polling stations"
              src="https://www.google.com/maps?q=Tamil%20Nadu%20polling%20station&output=embed"
              loading="lazy"
              className="h-56 w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>

          {/* Official Resources */}
          <Card className="p-4 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold text-foreground">Official Resources</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <ResourceLink
                href="https://ecinet.eci.gov.in/"
                title="ECINET"
                desc="Voter registration, status check & booth details"
              />
              <ResourceLink
                href="https://eci.gov.in/"
                title="Election Commission of India"
                desc="Official ECI guidelines and notifications"
              />
              <ResourceLink
                href="https://elections.tn.gov.in/"
                title="Tamil Nadu CEO"
                desc="State electoral rolls & polling instructions"
              />
            </ul>
          </Card>
        </aside>
      </div>

      <footer className="border-t border-border bg-secondary/30 py-6 text-center text-xs text-muted-foreground">
        <p>
          Powered by <strong>Google Gemini AI</strong> · Grounded in ECI, ECINET & Tamil Nadu CEO ·
          Maps by Google
        </p>
      </footer>
    </main>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-[var(--shadow-card)] ${
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-card text-card-foreground border border-border"
        }`}
      >
        {renderMarkdownLite(message.content)}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourceLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-2 rounded-md p-2 transition-colors hover:bg-accent"
      >
        <ExternalLink
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-accent-foreground"
          aria-hidden
        />
        <div>
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </a>
    </li>
  );
}

// Tiny inline markdown: **bold** + line breaks. Avoids a heavy markdown dep.
function renderMarkdownLite(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
    return (
      <div key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </div>
    );
  });
}
