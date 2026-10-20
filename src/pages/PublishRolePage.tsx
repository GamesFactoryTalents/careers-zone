import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, FileText, Link2, Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecruiter } from "@/context/RecruiterContext";
import { extractPdfText } from "@/lib/fileText";
import { EMPTY_DRAFT, type JobDraft } from "@/lib/recruiterJobs";
import { EXPERIENCE_LEVELS, GAME_ROLES, WORK_MODES } from "@/types/profile";

async function readFunctionError(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error as string;
    } catch {
      /* fall through */
    }
  }
  return "Something went wrong reading the vacancy. Please try again.";
}

export default function PublishRolePage() {
  const navigate = useNavigate();
  const { company, publishJob } = useRecruiter();
  const [link, setLink] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<JobDraft | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasCompany = company.name.trim() !== "";

  const runExtraction = async (body: { text?: string; url?: string }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-job", { body });
      if (error) {
        toast.error(await readFunctionError(error));
        return;
      }
      const job = data.job;
      setDraft({
        title: job.title ?? "",
        location: job.location ?? "",
        workMode: job.workMode ?? "On-site",
        category: job.category ?? EMPTY_DRAFT.category,
        experienceLevel: job.experienceLevel ?? EMPTY_DRAFT.experienceLevel,
        description: job.description ?? "",
        requirements: job.requirements ?? [],
        tags: job.tags ?? [],
        applyUrl: job.applyUrl ?? body.url ?? "",
      });
      toast.success("Role details filled in - review before publishing");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("PDF too large - max 10MB");
      return;
    }
    setFileName(file.name);
    setLoading(true);
    let text = "";
    try {
      text = await extractPdfText(file);
    } catch (err) {
      console.error("PDF read failed:", err);
      setLoading(false);
      toast.error("We couldn't read this PDF. Try another file or paste the link.");
      return;
    }
    if (text.trim().length < 50) {
      setLoading(false);
      toast.error("This PDF has no readable text (it may be a scan). Try the vacancy link instead.");
      return;
    }
    await runExtraction({ text });
  };

  const handleLink = async () => {
    const url = link.trim();
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Paste a full link starting with https://");
      return;
    }
    await runExtraction({ url });
  };

  const handlePublish = async () => {
    if (!draft) return;
    if (!hasCompany) {
      toast.error("Add your company name first");
      return;
    }
    if (!draft.title.trim() || !draft.description.trim()) {
      toast.error("A role needs at least a title and a description");
      return;
    }
    try {
      const job = await publishJob(draft);
      toast.success(`"${job.title}" is live for talents`);
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't publish this role.");
    }
  };

  const set = (updates: Partial<JobDraft>) => setDraft((d) => (d ? { ...d, ...updates } : d));

  return (
    <div className="space-y-5 pb-4">
      <Button variant="ghost" size="sm" onClick={() => (draft ? setDraft(null) : navigate("/"))} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>

      <div>
        <h1 className="font-display text-2xl font-bold">Publish a role</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {draft ? "Check the details, then publish." : "Upload the vacancy PDF or paste its link. AI fills in the details for you."}
        </p>
      </div>

      {!hasCompany && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 flex items-start gap-3">
          <Building2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-2">
            <p>Roles are published under your company. Set up your company profile first.</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/profile")} className="border-accent/40">
              Set up company
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-border bg-card p-10 text-center space-y-3"
        >
          <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
          <p className="font-display font-bold">Reading the vacancy...</p>
          <p className="text-xs text-muted-foreground">{fileName || link}</p>
        </motion.div>
      ) : !draft ? (
        <>
          <Tabs defaultValue="pdf">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="pdf" className="font-display text-xs"><FileText className="h-3.5 w-3.5 mr-1.5" />Upload PDF</TabsTrigger>
              <TabsTrigger value="link" className="font-display text-xs"><Link2 className="h-3.5 w-3.5 mr-1.5" />Vacancy link</TabsTrigger>
            </TabsList>
            <TabsContent value="pdf" className="mt-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-8 text-center space-y-2"
              >
                <Upload className="h-8 w-8 mx-auto text-primary" />
                <p className="font-display font-bold">Choose a PDF</p>
                <p className="text-xs text-muted-foreground">The job description file, up to 10MB</p>
              </button>
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
            </TabsContent>
            <TabsContent value="link" className="mt-4 space-y-3">
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLink()}
                placeholder="https://yourstudio.com/careers/senior-artist"
                className="bg-card"
              />
              <Button onClick={handleLink} disabled={!link.trim()} className="w-full gradient-primary glow-primary">
                <Sparkles className="h-4 w-4 mr-2" /> Read vacancy
              </Button>
            </TabsContent>
          </Tabs>
          <button
            onClick={() => setDraft({ ...EMPTY_DRAFT, applyUrl: company.website })}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            or fill it in manually
          </button>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs">Role title *</Label>
            <Input id="title" value={draft.title} onChange={(e) => set({ title: e.target.value })} className="bg-card" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={draft.category} onValueChange={(v) => set({ category: v })}>
                <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GAME_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Level</Label>
              <Select value={draft.experienceLevel} onValueChange={(v) => set({ experienceLevel: v })}>
                <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loc" className="text-xs">Location</Label>
              <Input id="loc" value={draft.location} onChange={(e) => set({ location: e.target.value })} className="bg-card" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Work mode</Label>
              <Select value={draft.workMode} onValueChange={(v) => set({ workMode: v as JobDraft["workMode"] })}>
                <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WORK_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-xs">Description *</Label>
            <Textarea id="desc" value={draft.description} onChange={(e) => set({ description: e.target.value })} className="bg-card min-h-[100px]" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reqs" className="text-xs">Requirements (one per line)</Label>
            <Textarea
              id="reqs"
              value={draft.requirements.join("\n")}
              onChange={(e) => set({ requirements: e.target.value.split("\n") })}
              className="bg-card min-h-[110px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-xs">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={draft.tags.join(", ")}
              onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trimStart()) })}
              className="bg-card"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="apply" className="text-xs">Apply link</Label>
            <Input id="apply" value={draft.applyUrl} onChange={(e) => set({ applyUrl: e.target.value })} placeholder="https://" className="bg-card" />
          </div>

          <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Published as <span className="text-foreground font-medium">{company.name || "your company"}</span>
          </div>

          <Button onClick={handlePublish} disabled={!hasCompany} className="w-full gradient-primary glow-primary">
            Publish role
          </Button>
        </motion.div>
      )}
    </div>
  );
}
