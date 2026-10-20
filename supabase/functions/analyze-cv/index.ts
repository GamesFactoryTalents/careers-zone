import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CV_RUBRIC = `You are an elite gaming industry recruiter and CV analyst with 20+ years hiring at Supercell, Riot Games, Ubisoft, Epic Games, and CD Projekt Red. You've reviewed 50,000+ CVs.

SCORING RULES — Be strict and honest. Most CVs score 35-60. A score above 80 is exceptional. Do NOT inflate.

STRUCTURE & FORMAT (0-100):
- 90+: Clean sections, consistent formatting, 1-2 pages, scannable in 6 seconds, perfect hierarchy
- 70-89: Good structure but minor issues (slightly too long, inconsistent date formats, occasional text walls)
- 40-69: Missing key sections, poor visual hierarchy, hard to scan quickly
- <40: No clear structure, essay format, >3 pages, unreadable

GAME INDUSTRY RELEVANCE (0-100):
- 90+: Shipped game titles with specific contributions listed, engine proficiency (Unity/Unreal/Godot), game jams, game-specific methodologies
- 70-89: Related tech/creative experience with some game projects mentioned
- 40-69: Generic tech/creative CV with no game-specific context or terminology
- <40: No connection to games industry whatsoever

PORTFOLIO & PROOF OF WORK (0-100):
- 90+: Links to shipped games on Steam/App Store, demo reels, GitHub with game projects, itch.io page, ArtStation
- 70-89: Some links but incomplete, or portfolio exists but poorly referenced
- 40-69: Mentions projects but provides no links, no visual proof, no verification
- <40: No portfolio, no links, no evidence of any work

QUANTIFIED ACHIEVEMENTS (0-100):
- 90+: Metrics everywhere — DAU/MAU, revenue impact, performance gains (ms/fps), team size led, retention improvements, bug reduction %
- 70-89: Some metrics but many achievements remain vague ("improved performance")
- 40-69: Mostly responsibility-based descriptions, few concrete achievements
- <40: Pure job description copy-paste, zero achievements, only lists duties

ATS KEYWORD OPTIMIZATION (0-100):
- 90+: Perfect keywords for target role, standard section headers (Experience, Education, Skills), clean formatting, no tables/columns/graphics that break ATS
- 70-89: Good keywords but some non-standard formatting or missing key terms
- 40-69: Missing critical role-specific keywords, or uses ATS-unfriendly formatting
- <40: Would likely be filtered out by most ATS systems`;

const COVER_LETTER_RUBRIC = `You are an elite gaming industry recruiter. Analyze this cover letter with brutal honesty.

SCORING CATEGORIES:

HOOK & OPENING (0-100):
- 90+: Immediately compelling, specific, shows passion and relevance in first 2 sentences
- 70-89: Decent opening but could be more specific or memorable
- 40-69: Generic opening ("I am writing to apply for...")
- <40: No hook, boring, copy-paste template obvious

COMPANY RESEARCH (0-100):
- 90+: References specific games, culture, recent news, company values with genuine insight
- 70-89: Shows some knowledge but surface-level
- 40-69: Generic — could apply to any game company
- <40: No company-specific content at all

VALUE PROPOSITION (0-100):
- 90+: Clear, specific examples of how your skills solve THEIR problems, with metrics
- 70-89: Good examples but missing specificity or metrics
- 40-69: Vague claims without evidence
- <40: Just restates the CV, no unique value shown

CALL TO ACTION (0-100):
- 90+: Confident, specific next step, memorable close
- 70-89: Standard professional close
- 40-69: Weak or missing CTA
- <40: Abrupt ending, no follow-up suggestion

TONE & VOICE (0-100):
- 90+: Authentic, passionate about games, professional but personality shines through
- 70-89: Professional but could show more personality
- 40-69: Robotic, overly formal, or too casual
- <40: Inappropriate tone, ChatGPT-obvious, or unprofessional`;

function buildCVTools() {
  return [
    {
      type: "function",
      function: {
        name: "analyze_cv",
        description: "Return structured CV analysis for gaming industry",
        parameters: {
          type: "object",
          properties: {
            score: { type: "number", description: "Overall score 0-100 (be strict, most CVs are 35-60)" },
            summary: { type: "string", description: "2-3 sentence brutally honest assessment" },
            topStrengths: {
              type: "array",
              items: { type: "string" },
              description: "Top 3 strengths (short, specific phrases)",
            },
            topImprovements: {
              type: "array",
              items: { type: "string" },
              description: "Top 3 most critical areas to improve (short, specific phrases)",
            },
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Category name" },
                  score: { type: "number", description: "Score 0-100" },
                  icon: { type: "string", description: "Single emoji" },
                  feedback: { type: "string", description: "2-3 sentence specific feedback" },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 specific, actionable suggestions",
                  },
                },
                required: ["name", "score", "icon", "feedback", "suggestions"],
                additionalProperties: false,
              },
              description: "Exactly 5 categories: Structure & Format, Game Industry Relevance, Portfolio & Proof, Quantified Achievements, ATS Keywords",
            },
            rewrittenSections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string", description: "The weak original bullet point or section from the CV" },
                  rewritten: { type: "string", description: "The improved, game-industry-optimized version with metrics and specifics" },
                  reason: { type: "string", description: "Brief explanation of why this rewrite is better" },
                },
                required: ["original", "rewritten", "reason"],
                additionalProperties: false,
              },
              description: "3-5 of the weakest bullet points/sections rewritten to be powerful and game-industry-optimized",
            },
            jobMatch: {
              type: "object",
              properties: {
                matchPercent: { type: "number", description: "0-100 match percentage" },
                matchedKeywords: { type: "array", items: { type: "string" }, description: "Keywords found in both CV and JD" },
                missingKeywords: { type: "array", items: { type: "string" }, description: "Keywords in JD but missing from CV" },
                suggestions: { type: "array", items: { type: "string" }, description: "2-3 tailored suggestions to improve match" },
              },
              required: ["matchPercent", "matchedKeywords", "missingKeywords", "suggestions"],
              additionalProperties: false,
            },
          },
          required: ["score", "summary", "topStrengths", "topImprovements", "categories", "rewrittenSections"],
          additionalProperties: false,
        },
      },
    },
  ];
}

function buildCoverLetterTools() {
  return [
    {
      type: "function",
      function: {
        name: "analyze_cv",
        description: "Return structured cover letter analysis",
        parameters: {
          type: "object",
          properties: {
            score: { type: "number", description: "Overall score 0-100" },
            summary: { type: "string", description: "2-3 sentence assessment" },
            topStrengths: { type: "array", items: { type: "string" }, description: "Top 3 strengths" },
            topImprovements: { type: "array", items: { type: "string" }, description: "Top 3 improvements" },
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  score: { type: "number" },
                  icon: { type: "string" },
                  feedback: { type: "string" },
                  suggestions: { type: "array", items: { type: "string" } },
                },
                required: ["name", "score", "icon", "feedback", "suggestions"],
                additionalProperties: false,
              },
              description: "Exactly 5 categories: Hook & Opening, Company Research, Value Proposition, Call to Action, Tone & Voice",
            },
            rewrittenSections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  rewritten: { type: "string" },
                  reason: { type: "string" },
                },
                required: ["original", "rewritten", "reason"],
                additionalProperties: false,
              },
              description: "2-4 weak sections rewritten",
            },
          },
          required: ["score", "summary", "topStrengths", "topImprovements", "categories", "rewrittenSections"],
          additionalProperties: false,
        },
      },
    },
  ];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { cvText, role, mode, jobDescription, imageBase64 } = await req.json();

    // Either text or image required
    if (!imageBase64 && (!cvText || typeof cvText !== "string" || cvText.trim().length < 20)) {
      return new Response(JSON.stringify({ error: "CV text too short or no image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isCoverLetter = mode === "cover";
    const rubric = isCoverLetter ? COVER_LETTER_RUBRIC : CV_RUBRIC;
    const docType = isCoverLetter ? "cover letter" : "CV/resume";
    const targetRole = role ? ` targeting a "${role}" role` : "";

    let systemPrompt = `${rubric}\n\nAnalyze the provided ${docType} for a candidate${targetRole} in the gaming industry. Be specific, actionable, and brutally honest. Do NOT inflate scores.\n\nYou MUST call the "analyze_cv" function with your structured analysis.`;

    if (jobDescription && !isCoverLetter) {
      systemPrompt += `\n\nALSO compare the CV against this job description and fill in the jobMatch field:\n---JOB DESCRIPTION---\n${jobDescription.slice(0, 4000)}\n---END JOB DESCRIPTION---`;
    }

    // Build messages - support multimodal (image) input
    const messages: any[] = [{ role: "system", content: systemPrompt }];

    if (imageBase64) {
      // Multimodal: send image for Gemini vision
      messages.push({
        role: "user",
        content: [
          { type: "text", text: `Read and analyze this ${docType} image:` },
          { type: "image_url", image_url: { url: imageBase64 } },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Analyze this ${docType}:\n\n${cvText!.slice(0, 12000)}`,
      });
    }

    const tools = isCoverLetter ? buildCoverLetterTools() : buildCVTools();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools,
        tool_choice: { type: "function", function: { name: "analyze_cv" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured analysis" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-cv error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
