import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { NoObjectGeneratedError, Output, streamText } from "npm:ai@6";
import { z } from "npm:zod@4";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "../_shared/run-id.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";
const MAX_TEXT = 15000;

const CATEGORIES = [
  "Game Designer", "Level Designer", "Narrative Designer", "2D Artist", "3D Artist", "Technical Artist",
  "Animator", "Art Director", "Gameplay Programmer", "Engine Programmer", "Tools Programmer",
  "Backend Programmer", "Frontend Programmer", "Producer", "Project Manager", "QA Tester", "QA Lead",
  "Sound Designer", "Composer", "Community Manager", "Marketing Manager", "UA Manager", "Data Analyst",
  "DevOps Engineer",
] as const;

const JobSchema = z.object({
  isJobPosting: z.boolean(),
  title: z.string(),
  company: z.string().nullable(),
  location: z.string(),
  workMode: z.enum(["Remote", "On-site", "Hybrid"]),
  category: z.enum(CATEGORIES),
  experienceLevel: z.enum(["Junior", "Mid", "Senior", "Lead", "Director"]),
  description: z.string(),
  requirements: z.array(z.string()),
  tags: z.array(z.string()),
  applyUrl: z.string().nullable(),
});

const INSTRUCTIONS = `You extract structured job postings for a game-industry job board.
Read the vacancy text and fill every field:
- isJobPosting: false if the text is clearly not a job vacancy.
- title: the role title as written.
- company: the hiring studio if named, else null.
- location: city and/or country, or "Europe"/"Worldwide" for broad remote roles.
- workMode: Remote, On-site or Hybrid (default On-site if unclear).
- category: the closest matching category from the allowed list.
- experienceLevel: best guess from years/seniority wording.
- description: 2-4 sentence engaging summary of the role, in English.
- requirements: 3-8 short bullet points (no leading dashes).
- tags: 3-6 short keywords (engines, tools, genres, platforms).
- applyUrl: an application link if present in the text, else null.
Never invent facts that are not supported by the text, except the summary wording.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function htmlToText(html: string) {
  // Job pages often embed a JobPosting in JSON-LD — keep it, it is the richest source.
  const ld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .filter((s) => /JobPosting/i.test(s))
    .join("\n");
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const metaDesc =
    html.match(/<meta[^>]+(?:name|property)=["'](?:og:)?description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? "";
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h\d)[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ");
  const text = decodeEntities(`${title}\n${metaDesc}\n${ld ? `Structured data: ${ld}\n` : ""}${body}`)
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
  return text;
}

async function fetchVacancyText(url: string): Promise<{ text: string } | { error: string; status: number }> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GameTalentsBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) {
    console.error("Vacancy fetch failed:", e);
    return { error: "We couldn't open that link. Check the address, or upload the PDF instead.", status: 422 };
  }
  if (!res.ok) {
    return { error: `That page returned an error (${res.status}). Try uploading the PDF instead.`, status: 422 };
  }
  const html = await res.text();
  const text = htmlToText(html);
  if (text.length < 200) {
    return {
      error: "That page didn't show the vacancy details to us. Try uploading the PDF instead.",
      status: 422,
    };
  }
  return { text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI is not configured" }, 500);

  let body: { text?: unknown; url?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  let sourceText = "";
  let sourceUrl: string | null = null;

  if (typeof body.url === "string" && body.url.trim()) {
    let parsed: URL;
    try {
      parsed = new URL(body.url.trim());
    } catch {
      return json({ error: "That doesn't look like a valid link." }, 400);
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return json({ error: "Links must start with http:// or https://" }, 400);
    }
    sourceUrl = parsed.toString();
    const fetched = await fetchVacancyText(sourceUrl);
    if ("error" in fetched) return json({ error: fetched.error }, fetched.status);
    sourceText = fetched.text;
  } else if (typeof body.text === "string" && body.text.trim()) {
    sourceText = body.text.trim();
  } else {
    return json({ error: "Provide a vacancy PDF or link." }, 400);
  }

  sourceText = sourceText.slice(0, MAX_TEXT);

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey: LOVABLE_API_KEY,
    headers: { "Lovable-API-Key": LOVABLE_API_KEY, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      system: INSTRUCTIONS,
      messages: [
        {
          role: "user",
          content: `${sourceUrl ? `Source link: ${sourceUrl}\n\n` : ""}Vacancy text:\n${sourceText}`,
        },
      ],
      output: Output.object({ schema: JobSchema }),
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    // Drain the stream so errors surface, then read the typed object.
    let streamError: unknown = null;
    for await (const part of result.fullStream) {
      if (part.type === "error") streamError = part.error;
    }
    if (streamError) throw streamError;

    const job = await result.output;
    if (!job.isJobPosting) {
      return json({ error: "This doesn't look like a job vacancy. Please check the file or link." }, 422);
    }
    return json({ job: { ...job, applyUrl: job.applyUrl ?? sourceUrl } });
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("No object generated:", error.text);
      return json({ error: "AI couldn't read this vacancy. Try again or fill it in manually." }, 502);
    }
    const status = (error as { statusCode?: number })?.statusCode;
    const responseBody = (error as { responseBody?: string })?.responseBody;
    console.error("AI extraction failed:", status, responseBody ?? error);
    if (status === 429) return json({ error: "Too many requests right now. Please wait a moment and try again." }, 429);
    if (status === 402) return json({ error: "AI credits have run out. Add credits in your workspace to keep using this." }, 402);
    if (status === 403) return json({ error: "AI access is blocked for this workspace.", details: responseBody }, 403);
    return json({ error: "AI couldn't read this vacancy. Try again or fill it in manually." }, status && status >= 400 ? status : 500);
  }
});
