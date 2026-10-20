import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, ChevronDown, Image as ImageIcon, Crown, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import PremiumDialog from "@/components/PremiumDialog";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import aiCoachBg from "@/assets/ai-coach-bg.png";
import ScoreRing from "@/components/cv-coach/ScoreRing";
import CategoryRadarChart from "@/components/cv-coach/CategoryRadarChart";
import StrengthsImprovements from "@/components/cv-coach/StrengthsImprovements";
import CategoryCards from "@/components/cv-coach/CategoryCards";
import RewriteCards from "@/components/cv-coach/RewriteCards";
import JobMatchCard from "@/components/cv-coach/JobMatchCard";

interface CVAnalysis {
  score: number;
  categories: {
    name: string;
    score: number;
    icon: string;
    feedback: string;
    suggestions: string[];
  }[];
  summary: string;
  topStrengths: string[];
  topImprovements: string[];
  rewrittenSections?: {
    original: string;
    rewritten: string;
    reason: string;
  }[];
  jobMatch?: {
    matchPercent: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  };
}

const ACCEPTED_FILES = ".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const TIPS = [
  "Tailor your CV for each application - generic CVs get filtered out by recruiters",
  "Include shipped game titles with your specific contribution and role",
  "Quantify everything: team size, DAU, performance gains, revenue impact",
  "Add links to your portfolio, GitHub, itch.io, or demo reel",
  "Use standard section headers - ATS systems can't parse creative layouts",
  "Keep it to 1-2 pages - recruiters spend ~6 seconds on the first scan",
  "List game engines & tools you've used - Unity, Unreal, Godot, Blender etc.",
  "Mention game jams and personal projects - they show passion beyond work",
  "Include platform experience: PC, console, mobile, VR - it matters for studios",
  "Proofread twice - typos signal low attention to detail in a detail-driven industry",
];


async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: any) => item.str).join(" "));
  }
  return pages.join("\n\n");
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AICoachPage() {
  const { profile, updateProfile } = useProfile();
  const [cvText, setCvText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mode, setMode] = useState<"cv" | "cover">("cv");
  const [tipIndex, setTipIndex] = useState(0);
  const [showPremium, setShowPremium] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldAutoAnalyze = useRef(false);

  // Rotate tips while analyzing
  useEffect(() => {
    if (!analyzing) return;
    setTipIndex(0);
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [analyzing]);

  const runAnalysis = useCallback(async (textOverride?: string, imageOverride?: string | null) => {
    const text = textOverride ?? cvText;
    const image = imageOverride !== undefined ? imageOverride : imageBase64;
    if (!text.trim() && !image) {
      toast.error("Upload a file or paste text first");
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-cv", {
        body: {
          cvText: text.trim() || undefined,
          imageBase64: image || undefined,
          role: profile.role || "",
          mode,
          jobDescription: jobDescription.trim() || undefined,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Analysis failed. Please try again.");
        return;
      }

      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Too many requests - please wait a moment and try again.");
        } else if (data.error.includes("credits")) {
          toast.error("AI credits exhausted. Add credits in workspace settings.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      setAnalysis(data as CVAnalysis);
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error("Could not connect to AI. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [cvText, imageBase64, profile.role, mode, jobDescription]);

  // Auto-analyze after file upload sets state
  useEffect(() => {
    if (shouldAutoAnalyze.current) {
      shouldAutoAnalyze.current = false;
      runAnalysis(cvText, imageBase64);
    }
  }, [cvText, imageBase64, runAnalysis]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large - max 20MB");
      return;
    }

    updateProfile({ cvFileName: file.name });

    try {
      if (IMAGE_TYPES.includes(file.type)) {
        const base64 = await fileToBase64(file);
        setCvText("");
        shouldAutoAnalyze.current = true;
        setImageBase64(base64);
        toast.success(`Image loaded: ${file.name}`);
      } else if (file.name.endsWith(".txt")) {
        const text = await file.text();
        setImageBase64(null);
        shouldAutoAnalyze.current = true;
        setCvText(text);
        toast.success(`Loaded: ${file.name}`);
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        toast.info("Extracting PDF text...");
        const text = await extractPdfText(file);
        if (text.trim().length < 20) {
          toast.info("Scanned PDF detected - sending as image to AI");
          const base64 = await fileToBase64(file);
          setCvText("");
          shouldAutoAnalyze.current = true;
          setImageBase64(base64);
        } else {
          setImageBase64(null);
          shouldAutoAnalyze.current = true;
          setCvText(text);
          toast.success(`PDF extracted: ${file.name}`);
        }
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx") ||
        file.name.endsWith(".doc")
      ) {
        toast.info("Extracting DOCX text...");
        const text = await extractDocxText(file);
        setImageBase64(null);
        shouldAutoAnalyze.current = true;
        setCvText(text);
        toast.success(`DOCX extracted: ${file.name}`);
      } else {
        toast.error("Unsupported file type");
      }
    } catch (err) {
      console.error("File parse error:", err);
      toast.error("Could not parse file. Try pasting text instead.");
    }
  };

  const clearAttachment = () => {
    setCvText("");
    setImageBase64(null);
    updateProfile({ cvFileName: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasInput = cvText.trim().length > 0 || !!imageBase64;

  return (
    <div className="relative space-y-5 pb-4">
      {/* Background coach image */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center items-end overflow-hidden">
        <div className="relative h-[80vh] w-auto">
          <img
            src={aiCoachBg}
            alt=""
            className="h-full w-auto object-contain object-bottom opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
      </div>

      <div className="relative z-10 space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold">AI Career Coach</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Game industry CV & cover letter analyzer - powered by AI
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["cv", "cover"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              clearAttachment();
              setAnalysis(null);
            }}
            className={`font-display text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {m === "cv" ? "CV Analysis" : "Cover Letter"}
          </button>
        ))}
      </div>

      {/* Analyzing — tips card */}
      {analyzing ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="font-display text-sm font-bold">Analyzing your {mode === "cv" ? "CV" : "cover letter"}...</span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {TIPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i <= tipIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Tip */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3 items-start"
            >
              <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{TIPS[tipIndex]}</p>
            </motion.div>
          </AnimatePresence>

          <p className="text-[10px] text-muted-foreground/60 text-center">This usually takes 15-30 seconds</p>
        </motion.div>
      ) : (
        <>
          {/* Upload area */}
          <div
            className="relative rounded-xl border-2 border-dashed border-border bg-card/50 p-5 text-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILES}
              onChange={handleFileUpload}
              className="hidden"
            />
            {profile.cvFileName && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAttachment();
                  setAnalysis(null);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-muted/80 hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            {imageBase64 ? (
              <ImageIcon className="h-8 w-8 mx-auto text-accent mb-2" />
            ) : (
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            )}
            <p className="text-sm font-display font-bold">
              {profile.cvFileName || "Upload your CV"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOCX, TXT, JPG, PNG • Max 20MB
            </p>
          </div>

          {/* Collapsible text input */}
          {!imageBase64 && (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center">
                <span>{mode === "cv" ? "Or paste your CV text" : "Or paste your cover letter"}</span>
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Textarea
                  placeholder={
                    mode === "cv"
                      ? "Paste your CV content here for AI analysis..."
                      : "Paste your cover letter here for AI feedback..."
                  }
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  className="bg-card min-h-[120px]"
                />
              </CollapsibleContent>
            </Collapsible>
          )}




          {/* Analyze button — only for paste flow */}
          <Button
            onClick={() => runAnalysis()}
            disabled={!hasInput}
            className="w-full gradient-primary glow-primary"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Analyze with AI
          </Button>
        </>
      )}

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center space-y-3">
              <ScoreRing score={analysis.score} />
              <p className="text-sm text-muted-foreground text-center max-w-xs">{analysis.summary}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-display text-sm font-bold mb-1">Skills Radar</h3>
              <CategoryRadarChart categories={analysis.categories} />
            </div>

            <StrengthsImprovements
              strengths={analysis.topStrengths}
              improvements={analysis.topImprovements}
            />

            <CategoryCards categories={analysis.categories} />

            {analysis.rewrittenSections && analysis.rewrittenSections.length > 0 && (
              <RewriteCards rewrites={analysis.rewrittenSections} />
            )}

            {analysis.jobMatch && <JobMatchCard jobMatch={analysis.jobMatch} />}

            {/* RECREATE MY CV button */}
            <Button
              onClick={() => setShowPremium(true)}
              className="w-full h-12 text-sm font-display font-bold gradient-primary glow-primary"
            >
              <Crown className="h-4 w-4 mr-2" />
              RECREATE MY CV
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <PremiumDialog open={showPremium} onOpenChange={setShowPremium} />
      </div>
    </div>
  );
}
