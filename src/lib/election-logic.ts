export type FallbackKey =
  | "how_to_vote"
  | "first_time_voter"
  | "required_documents"
  | "default";

export const fallbackResponses: Record<FallbackKey, string> = {
  how_to_vote: `**How to Vote in Indian Elections (Lok Sabha / Parliamentary / Tamil Nadu State)**

1. **Check your name** in the electoral roll on the ECI/ECINET portal or the Tamil Nadu CEO website.
2. **Locate your polling station** using your Voter ID (EPIC) number on ECINET.
3. **Visit your assigned polling booth** between 7:00 AM and 6:00 PM on polling day.
4. **Carry a valid photo ID** — your EPIC (Voter ID) card is preferred.
5. **Get your finger inked**, sign the register, and proceed to the EVM.
6. **Press the button** next to your candidate's name and symbol. Listen for the beep and check the VVPAT slip.

Official sources: Election Commission of India (eci.gov.in), ECINET, and the Tamil Nadu Chief Electoral Officer (elections.tn.gov.in).`,

  first_time_voter: `**First-Time Voter — Step-by-Step**

1. **Eligibility:** You must be 18 years or older on the qualifying date and an Indian citizen.
2. **Register online** via ECINET or the National Voters' Service Portal (Form 6).
3. **Upload documents:** photo, age proof, and address proof.
4. **Track your application** using the reference ID on ECINET.
5. **Receive your EPIC (Voter ID)** by post or download the e-EPIC.
6. **On polling day**, visit your booth with your EPIC and vote.

Tamil Nadu first-time voters can also use the Tamil Nadu CEO portal (elections.tn.gov.in) for state-specific guidance.`,

  required_documents: `**Required Documents at the Polling Booth**

Your **EPIC (Elector's Photo Identity Card)** is the primary document. If unavailable, the ECI accepts any **one** of the following alternative photo IDs:

- Aadhaar Card
- PAN Card
- Passport
- Driving Licence
- Service Identity Card (Central/State Govt, PSU, Public Ltd Co.)
- MNREGA Job Card
- Pension Document with photograph
- Smart Card issued by RGI under NPR
- Bank/Post Office Passbook with photograph
- Health Insurance Smart Card under Ministry of Labour
- Official ID card for MPs/MLAs/MLCs

You must already be on the electoral roll — carrying ID alone is not enough. Verify via ECINET.`,

  default: `I'm your AI Elections Assistant for Indian Lok Sabha, Parliamentary, and Tamil Nadu State Elections.

I can help with:
- How to vote and what to do at the polling booth
- First-time voter registration steps
- Required documents and accepted IDs
- Finding your polling station via ECINET
- Tamil Nadu state-specific election information

Official references: **Election Commission of India**, **ECINET**, and the **Tamil Nadu Chief Electoral Officer** website.`,
};

export function classifyQuery(query: string): FallbackKey {
  const q = query.toLowerCase().trim();
  if (!q) return "default";

  if (/\b(how.*vote|voting process|cast.*vote|polling.*procedure|at the booth)\b/.test(q)) {
    return "how_to_vote";
  }
  if (/\b(first.?time|new voter|register|registration|enroll|18 year|epic apply)\b/.test(q)) {
    return "first_time_voter";
  }
  if (/\b(document|id proof|identity|epic|aadhaar|what.*carry|what.*bring)\b/.test(q)) {
    return "required_documents";
  }
  return "default";
}

export function getFallbackResponse(query: string): string {
  return fallbackResponses[classifyQuery(query)];
}

export const SYSTEM_PROMPT = `You are an AI Elections Assistant for India, focused strictly on:
- Lok Sabha (General/Parliamentary) Elections
- Tamil Nadu State Legislative Assembly Elections

Always ground your answers in official sources:
- Election Commission of India (ECI) — eci.gov.in
- ECINET — the official ECI digital platform for voter services
- Tamil Nadu Chief Electoral Officer — elections.tn.gov.in

Rules:
1. Be concise, accurate, and neutral. Do not endorse parties or candidates.
2. For voter registration, status checks, and polling booth lookup, direct users to ECINET.
3. For Tamil Nadu state-specific queries (electoral rolls, state polling instructions), reference the Tamil Nadu CEO website.
4. If a question is outside Indian elections, politely redirect.
5. Use clear formatting with short paragraphs and bullet points where helpful.
6. Never fabricate dates, candidates, or constituency-specific results.`;