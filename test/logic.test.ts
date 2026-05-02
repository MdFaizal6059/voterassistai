import { describe, it, expect } from "vitest";
import {
  classifyQuery,
  getFallbackResponse,
  fallbackResponses,
} from "../src/server/logic.server";

describe("Elections Assistant logic", () => {
  it("classifies 'How to vote?' as how_to_vote", () => {
    expect(classifyQuery("How to vote?")).toBe("how_to_vote");
  });

  it("classifies 'First-time voter steps' as first_time_voter", () => {
    expect(classifyQuery("First-time voter steps")).toBe("first_time_voter");
  });

  it("classifies a documents question as required_documents", () => {
    expect(classifyQuery("What documents do I need to carry?")).toBe(
      "required_documents",
    );
  });

  it("falls back to default for unrelated queries", () => {
    expect(classifyQuery("Tell me a joke")).toBe("default");
  });

  it("returns a non-empty response for 'How to vote'", () => {
    const r = getFallbackResponse("How to vote");
    expect(r.length).toBeGreaterThan(50);
    expect(r.toLowerCase()).toContain("polling");
  });

  it("returns a non-empty response for 'First-time voter'", () => {
    const r = getFallbackResponse("First-time voter");
    expect(r.length).toBeGreaterThan(50);
    expect(r.toLowerCase()).toContain("epic");
  });

  it("mentions ECINET in the default response", () => {
    expect(fallbackResponses.default).toContain("ECINET");
  });
});
