"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { type Company, companySignals } from "@/lib/data"
import { useLocalStorageState } from "@/hooks/use-local-storage"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  ListPlus,
  Download,
  Globe,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Flame,
  Minus,
  Loader2,
  CheckCircle2,
  Linkedin,
  Twitter,
  StickyNote,
  Banknote,
  UserPlus,
  Rocket,
  Newspaper,
  Handshake,
  UserCog,
  Copy,
  MoreHorizontal,
  Check,
  Clock,
  Link2,
  ShieldCheck,
  Target,
  Cpu,
  UsersRound,
  AlertCircle,
  RotateCcw,
  Zap,
  BookOpen,
  ChevronRight,
  Tag,
  Lightbulb,
  BarChart3,
  Quote,
} from "lucide-react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SignalIcon({ type }: { type: string }) {
  const icons: Record<string, React.ElementType> = {
    funding: Banknote, hiring: UserPlus, product: Rocket,
    press: Newspaper, partnership: Handshake, executive: UserCog,
  }
  const Icon = icons[type] || Sparkles
  return <Icon className="size-4" />
}

function sentimentColor(sentiment: string) {
  if (sentiment === "positive") return "text-success"
  if (sentiment === "negative") return "text-destructive"
  return "text-muted-foreground"
}

type EnrichmentPhase = "idle" | "crawling" | "extracting" | "analyzing" | "complete"

type LiveEnrichment = {
  url: string
  fetchedAt: string
  summary: string
  whatTheyDo: string[]
  keywords: string[]
  signals: {
    type: string
    present: boolean
    evidence: string | null
  }[]
  sources: {
    type: string
    url: string
  }[]
  cached?: boolean
}

const enrichmentSteps = [
  { phase: "crawling" as const, label: "Crawling sources", detail: "Scanning 12 public data sources" },
  { phase: "extracting" as const, label: "Extracting data", detail: "Parsing articles, filings, profiles" },
  { phase: "analyzing" as const, label: "AI analysis", detail: "Generating competitive intelligence" },
]

const enrichmentSources = [
  { name: "Crunchbase", url: "crunchbase.com", type: "Funding data", scrapedAt: "2026-02-25T09:14:00Z", items: 6 },
  { name: "LinkedIn", url: "linkedin.com", type: "Team & hiring", scrapedAt: "2026-02-25T09:14:22Z", items: 18 },
  { name: "TechCrunch", url: "techcrunch.com", type: "Press coverage", scrapedAt: "2026-02-25T09:14:35Z", items: 4 },
  { name: "Product Hunt", url: "producthunt.com", type: "Product launches", scrapedAt: "2026-02-25T09:14:41Z", items: 2 },
  { name: "Glassdoor", url: "glassdoor.com", type: "Company culture", scrapedAt: "2026-02-25T09:14:50Z", items: 8 },
  { name: "GitHub", url: "github.com", type: "Open source", scrapedAt: "2026-02-25T09:15:02Z", items: 12 },
  { name: "SEC EDGAR", url: "sec.gov", type: "Regulatory filings", scrapedAt: "2026-02-25T09:15:10Z", items: 1 },
  { name: "Google News", url: "news.google.com", type: "Press mentions", scrapedAt: "2026-02-25T09:15:18Z", items: 9 },
]

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

// ─── Enrichment panel (right sidebar) ─────────────────────────────────────────

function EnrichmentPanel({
  company,
  enrichPhase,
  enriched,
  enrichProgress,
  onEnrich,
}: {
  company: Company
  enrichPhase: EnrichmentPhase
  enriched: boolean
  enrichProgress: number
  onEnrich: (forceRefresh?: boolean) => void
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedSources, setExpandedSources] = useState(false)
  const currentPhaseIndex = enrichmentSteps.findIndex((s) => s.phase === enrichPhase)

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const enrichmentInsights = [
    {
      id: "summary",
      icon: Target,
      title: "Executive Summary",
      summary: `${company.name} is a high-momentum startup showing strong product-market fit with enterprise customers. Revenue estimated at $3-5M ARR with 150% net revenue retention.`,
      bullets: [
        "3x inference speed vs. leading foundation models",
        "Enterprise-grade security and compliance (SOC 2, HIPAA)",
        "150% net revenue retention signals strong product stickiness",
        "12 hospital networks in clinical pilot (healthcare vertical)",
      ],
      confidence: "High" as const,
      sources: ["Crunchbase", "LinkedIn", "TechCrunch"],
    },
    {
      id: "competitive",
      icon: ShieldCheck,
      title: "Competitive Landscape",
      summary: "Positioned in the enterprise AI reasoning segment with differentiated architecture. Key competitors include Anthropic, Cohere, and AI21 Labs.",
      bullets: [
        "Unique moat in regulated-industry reasoning use cases",
        "3x speed advantage creates strong switching costs",
        "Weaker brand recognition vs. Anthropic, OpenAI in broader market",
        "Snowflake partnership gives distribution edge in data-heavy enterprises",
      ],
      confidence: "High" as const,
      sources: ["TechCrunch", "Google News", "Product Hunt"],
    },
    {
      id: "market",
      icon: BarChart3,
      title: "Market Opportunity",
      summary: "Enterprise AI infrastructure TAM estimated at $150B+ by 2028. Current market penetration under 1% of addressable market.",
      bullets: [
        "TAM: $150B+ by 2028 (enterprise AI infrastructure)",
        "ACV range: $100K - $1M per enterprise contract",
        "Sub-1% market penetration signals massive growth runway",
        "Mid-market and enterprise segments both show strong pull",
      ],
      confidence: "Medium" as const,
      sources: ["SEC EDGAR", "Crunchbase", "Google News"],
    },
    {
      id: "tech",
      icon: Cpu,
      title: "Technology & IP",
      summary: "Proprietary transformer architecture with 4 patent applications filed. Team has 12 publications in top ML conferences.",
      bullets: [
        "4 patent applications: attention mechanisms, quantization",
        "12 peer-reviewed papers (NeurIPS, ICML, ICLR)",
        "Novel inference optimization reduces GPU cost by ~60%",
        "Open-source contributions signal strong engineering culture",
      ],
      confidence: "High" as const,
      sources: ["GitHub", "Google News", "LinkedIn"],
    },
  ]

  const keywords = [
    "foundation model", "enterprise AI", "inference optimization", "SOC 2",
    "HIPAA", "regulated industries", "reasoning engine", "fine-tuning",
    "multi-modal", "real-time streaming",
  ]

  // ── Idle state ──
  if (enrichPhase === "idle" && !enriched) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <Sparkles className="size-6 text-muted-foreground" />
          </div>
          <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground">
            <AlertCircle className="size-2.5" />
          </div>
        </div>
        <h3 className="text-sm font-semibold text-foreground">Not yet enriched</h3>
        <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
          Extract insights from public websites, news, job postings, and filings using AI.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-1">
          {["Crunchbase", "LinkedIn", "TechCrunch", "GitHub", "+4"].map((s) => (
            <Badge key={s} variant="secondary" className="border-0 text-[10px]">{s}</Badge>
          ))}
        </div>
        <button
          onClick={() => onEnrich(false)}
          className="group mt-5 flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20"
        >
          <Sparkles className="size-3.5 transition-transform group-hover:rotate-12" />
          Enrich with AI
          <kbd className="ml-1 rounded border border-accent-foreground/20 bg-accent-foreground/10 px-1 py-0.5 font-mono text-[9px]">E</kbd>
        </button>
      </div>
    )
  }

  // ── Loading state ──
  if (enrichPhase !== "idle" && enrichPhase !== "complete") {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-accent/20 bg-accent/3 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-8 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <div className="relative flex size-8 items-center justify-center rounded-full bg-accent/10">
                <Sparkles className="size-4 text-accent" />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">Enrichment in Progress</div>
              <div className="text-[11px] text-muted-foreground">Analyzing {company.name}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {/* Progress bar */}
          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground">
                {enrichmentSteps.find((s) => s.phase === enrichPhase)?.detail}
              </span>
              <span className="font-mono text-[11px] text-accent">{enrichProgress}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                style={{ width: `${enrichProgress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="mb-5 flex flex-col gap-2">
            {enrichmentSteps.map((step, i) => {
              const isActive = enrichPhase === step.phase
              const isDone = currentPhaseIndex > i
              return (
                <div
                  key={step.phase}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border p-2.5 transition-all",
                    isActive ? "border-accent/40 bg-accent/5" : isDone ? "border-success/20 bg-success/3" : "border-border"
                  )}
                >
                  <div className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    isActive ? "bg-accent/15 text-accent" : isDone ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {isActive ? <Loader2 className="size-3 animate-spin" /> : isDone ? <Check className="size-3" /> : <span className="text-[9px] font-bold">{i + 1}</span>}
                  </div>
                  <div>
                    <div className={cn("text-[11px] font-medium", isActive ? "text-accent" : isDone ? "text-success" : "text-muted-foreground")}>
                      {step.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live feed */}
          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Zap className="size-2.5" />
              Live Activity
            </div>
            <div className="flex flex-col gap-1.5">
              {enrichmentSources.slice(0, enrichPhase === "extracting" ? 6 : enrichPhase === "analyzing" ? 8 : 3).map((source, i) => (
                <div
                  key={source.name}
                  className="flex items-center gap-2 text-[11px]"
                  style={{ animation: `fade-in 300ms ease-out ${i * 120}ms both` }}
                >
                  <span className="flex size-1.5 shrink-0 rounded-full bg-success animate-pulse" />
                  <span className="text-muted-foreground">
                    {enrichPhase === "analyzing" ? "Analyzed" : "Scanning"}{" "}
                    <span className="font-medium text-foreground">{source.name}</span>
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground/40">{source.items}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Complete state ──
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-accent" />
          <span className="text-xs font-semibold text-foreground">AI Intelligence</span>
          <Badge variant="secondary" className="border-0 bg-success/10 text-[10px] text-success">
            <CheckCircle2 className="mr-0.5 size-2.5" />
            Complete
          </Badge>
        </div>
        <button 
          onClick={() => onEnrich(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="size-3" />
          Re-run
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Sources strip */}
        <div className="border-b border-border px-5 py-3">
          <button
            onClick={() => setExpandedSources(!expandedSources)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-foreground">{enrichmentSources.length} sources</span>
              <span className="text-[10px] text-muted-foreground">60 items extracted</span>
            </div>
            <ChevronRight className={cn("size-3 text-muted-foreground transition-transform", expandedSources && "rotate-90")} />
          </button>
          {expandedSources && (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {enrichmentSources.map((source) => (
                <div key={source.name} className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <Globe className="size-3 text-muted-foreground" />
                    <div>
                      <span className="text-[11px] font-medium text-foreground">{source.name}</span>
                      <span className="ml-1.5 text-[10px] text-muted-foreground">{source.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">{source.items}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/50">
                      <Clock className="size-2.5" />
                      {formatTimestamp(source.scrapedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keywords */}
        <div className="border-b border-border px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Tag className="size-3 text-muted-foreground" />
            <span className="text-[11px] font-medium text-foreground">Keywords</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="border-0 text-[10px] font-normal">{kw}</Badge>
            ))}
          </div>
        </div>

        {/* Insight sections */}
        <div className="flex flex-col gap-0 divide-y divide-border">
          {enrichmentInsights.map((section) => (
            <div key={section.id} className="group px-5 py-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-accent/8 text-accent">
                    <section.icon className="size-3" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">{section.title}</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border-0 text-[9px]",
                      section.confidence === "High" ? "bg-success/10 text-success" : "bg-warning/10 text-warning-foreground"
                    )}
                  >
                    {section.confidence}
                  </Badge>
                  <button
                    onClick={() => handleCopy(section.id, section.summary + "\n" + section.bullets.join("\n"))}
                    className="flex size-5 items-center justify-center rounded text-muted-foreground opacity-0 transition-all hover:bg-secondary group-hover:opacity-100"
                  >
                    {copiedId === section.id ? <Check className="size-2.5 text-success" /> : <Copy className="size-2.5" />}
                  </button>
                </div>
              </div>

              {/* Summary paragraph */}
              <p className="mb-2.5 text-[11px] leading-relaxed text-muted-foreground">{section.summary}</p>

              {/* Bullet points */}
              <ul className="mb-2.5 flex flex-col gap-1">
                {section.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-foreground/80">
                    <span className="mt-1.5 flex size-1 shrink-0 rounded-full bg-accent/50" />
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* Source attribution */}
              <div className="flex items-center gap-1">
                {section.sources.map((src) => (
                  <span key={src} className="flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    <Link2 className="size-2" />
                    {src}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Key People */}
        <div className="border-t border-border px-5 py-4">
          <div className="mb-3 flex items-center gap-1.5">
            <UsersRound className="size-3 text-muted-foreground" />
            <span className="text-[11px] font-medium text-foreground">Key People</span>
            <Badge variant="secondary" className="border-0 text-[9px]">via LinkedIn</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { name: "Dr. Sarah Chen", role: "CEO & Co-founder", bg: "Stanford CS PhD, ex-Google Brain" },
              { name: "Dr. Michael Torres", role: "CTO", bg: "ex-Meta AI Research" },
              { name: "Priya Sharma", role: "VP Engineering", bg: "ex-Google DeepMind" },
              { name: "David Park", role: "VP Sales", bg: "ex-Databricks" },
            ].map((person) => (
              <div key={person.name} className="flex items-center gap-2.5 rounded-md border border-border p-2 transition-colors hover:border-accent/20">
                <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                  {person.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-medium text-foreground">{person.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{person.role} -- {person.bg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last run timestamp */}
        <div className="border-t border-border px-5 py-3">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="size-2.5" />
            Last enriched Feb 25, 2026 at 9:15 AM -- 60 data points
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CompanyProfile({
  company,
  onBack,
}: {
  company: Company
  onBack: () => void
}) {
  const [enrichPhase, setEnrichPhase] = useState<EnrichmentPhase>(company.enriched ? "complete" : "idle")
  const [enrichProgress, setEnrichProgress] = useState(company.enriched ? 100 : 0)
  const [enriched, setEnriched] = useState(company.enriched)
  const [enrichmentByCompany, setEnrichmentByCompany] = useLocalStorageState<Record<string, LiveEnrichment | null>>(
    "vc-scout:live-enrichment",
    {},
  )
  const [enrichLoading, setEnrichLoading] = useState(false)
  const [enrichError, setEnrichError] = useState<string | null>(null)
  const [notesByCompany, setNotesByCompany] = useLocalStorageState<Record<string, string>>(
    "vc-scout:company-notes",
    {},
  )
  const [activeTab, setActiveTab] = useState<"overview" | "signals">("overview")
  const [savedToList, setSavedToList] = useState(false)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  const notes = notesByCompany[company.id] ?? ""
  const liveEnrichment = enrichmentByCompany[company.id] ?? null

  const handleNotesChange = (value: string) => {
    setNotesByCompany((prev) => ({
      ...prev,
      [company.id]: value,
    }))
  }

  const handleEnrich = useCallback((forceRefresh = false) => {
    if (enrichLoading) return

    // If we already have enrichment cached locally AND we aren't forcing a refresh, just reflect that in UI
    if (liveEnrichment && !forceRefresh) {
      setEnriched(true)
      setEnrichPhase("complete")
      setEnrichProgress(100)
      setEnrichError(null)
      return
    }

    setEnrichLoading(true)
    setEnrichError(null)
    setEnrichPhase("crawling")
    setEnrichProgress(10)

    if (!company.domain) {
      setEnrichError("No company website URL available to enrich.")
      setEnrichLoading(false)
      setEnrichPhase("idle")
      setEnrichProgress(0)
      return
    }

    let url = company.domain
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }

    ;(async () => {
      try {
        const res = await fetch("/api/enrich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, forceRefresh }),
        })

        const data = (await res.json()) as any
        if (!res.ok) {
          const message = typeof data?.error === "string" ? data.error : `Request failed with status ${res.status}`
          throw new Error(message)
        }

        setEnrichPhase("analyzing")
        setEnrichProgress(70)

        const result = data as LiveEnrichment
        setEnrichmentByCompany((prev) => ({
          ...prev,
          [company.id]: result,
        }))

        setEnriched(true)
        setEnrichPhase("complete")
        setEnrichProgress(100)
      } catch (err: any) {
        setEnrichError(err?.message ?? "Failed to enrich company")
        setEnriched(false)
        setEnrichPhase("idle")
        setEnrichProgress(0)
      } finally {
        setEnrichLoading(false)
      }
    })()
  }, [company.domain, company.id, enrichLoading, liveEnrichment, setEnrichmentByCompany])

  // If we already have live enrichment cached for this company when the profile opens,
  // reflect that in the local UI state.
  useEffect(() => {
    if (liveEnrichment) {
      setEnriched(true)
      setEnrichPhase("complete")
      setEnrichProgress(100)
    }
  }, [liveEnrichment])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return

      if (e.key === "Escape") { e.preventDefault(); onBack() }
      if (e.key === "e" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); handleEnrich() }
      if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setSavedToList(true)
        setTimeout(() => setSavedToList(false), 2000)
      }
      if (e.key === "1") { e.preventDefault(); setActiveTab("overview") }
      if (e.key === "2") { e.preventDefault(); setActiveTab("signals") }
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) { e.preventDefault(); notesRef.current?.focus() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onBack, enriched, handleEnrich])

  return (
    <div className="flex h-full flex-col">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Back (Esc)"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-sm font-bold text-foreground">
              {company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-foreground">{company.name}</h1>
                {enriched && (
                  <Badge variant="secondary" className="gap-1 border-0 bg-accent/10 text-[10px] text-accent">
                    <Sparkles className="size-2.5" />
                    Enriched
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] border-0",
                    company.signal === "hot" ? "bg-chart-3/10 text-chart-3" :
                      company.signal === "warm" ? "bg-warning/20 text-warning-foreground" :
                        "bg-muted text-muted-foreground"
                  )}
                >
                  {company.signal === "hot" && <Flame className="size-2.5" />}
                  {company.signal === "warm" && <TrendingUp className="size-2.5" />}
                  {company.signal === "neutral" && <Minus className="size-2.5" />}
                  {company.signal}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{company.domain}</span>
                <span className="opacity-20">|</span>
                <span>{company.sector}</span>
                <span className="opacity-20">|</span>
                <span>{company.stage}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!enriched && enrichPhase === "idle" && (
            <button
              onClick={() => handleEnrich(false)}
              className="group flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-all hover:bg-accent/90"
            >
              <Sparkles className="size-3 transition-transform group-hover:rotate-12" />
              {enrichLoading ? "Enriching..." : "Enrich"}
              <kbd className="ml-0.5 rounded border border-accent-foreground/20 bg-accent-foreground/10 px-1 py-0.5 font-mono text-[9px]">E</kbd>
            </button>
          )}
          {enrichPhase !== "idle" && enrichPhase !== "complete" && (
            <div className="flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/5 px-2.5 py-1.5">
              <Loader2 className="size-3 animate-spin text-accent" />
              <span className="text-[11px] font-medium text-accent">{enrichmentSteps.find((s) => s.phase === enrichPhase)?.label}</span>
              <span className="font-mono text-[10px] text-accent/60">{enrichProgress}%</span>
            </div>
          )}
          <button
            onClick={() => { setSavedToList(true); setTimeout(() => setSavedToList(false), 2000) }}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
              savedToList ? "border-success/40 bg-success/10 text-success" : "border-input bg-card text-foreground hover:bg-secondary"
            )}
          >
            {savedToList ? <Check className="size-3" /> : <ListPlus className="size-3" />}
            {savedToList ? "Saved" : "Save"}
            {!savedToList && <kbd className="ml-0.5 rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[9px] text-muted-foreground">S</kbd>}
          </button>
          <button className="flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
            <Download className="size-3" />
            Export
          </button>
          <button className="flex size-7 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <MoreHorizontal className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column: Overview / Signals */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
          {/* Tabs */}
          <div className="border-b border-border px-6">
            <div className="flex gap-0">
              {[
                { value: "overview" as const, label: "Overview", shortcut: "1" },
                { value: "signals" as const, label: "Signals", shortcut: "2", count: companySignals.length },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "relative flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
                    activeTab === tab.value
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{tab.count}</span>
                  )}
                  <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[9px] text-muted-foreground/40">{tab.shortcut}</kbd>
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-3 gap-5">
                {/* Main content */}
                <div className="col-span-2 flex flex-col gap-5">
                  {/* About */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h3>
                    <p className="text-sm leading-relaxed text-foreground/80">{company.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {company.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="border-0 text-[11px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Funding", value: company.funding, icon: DollarSign, sub: `Last round: ${company.lastRound}` },
                      { label: "Employees", value: company.employees, icon: Users, sub: `Growth: ${company.headcount_growth || "N/A"}` },
                      { label: "Web Traffic", value: company.web_traffic || "N/A", icon: TrendingUp, sub: "6-month trend" },
                      { label: "Founded", value: company.founded, icon: Calendar, sub: company.location },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <m.icon className="size-3" />
                          {m.label}
                        </div>
                        <div className="mt-1 text-lg font-semibold text-foreground">{m.value}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{m.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Live enrichment (from /api/enrich) */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="size-3 text-accent" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Live Enrichment
                        </h3>
                      </div>
                      {liveEnrichment && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(liveEnrichment.fetchedAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    {!liveEnrichment && !enrichLoading && (
                      <p className="text-[11px] text-muted-foreground">
                        Run enrichment to pull a summary, what they do, keywords, and derived signals from the public
                        website.
                      </p>
                    )}

                    {enrichLoading && (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Loader2 className="size-3 animate-spin text-accent" />
                        Fetching live enrichment from {company.domain}...
                      </div>
                    )}

                    {enrichError && (
                      <p className="mt-2 text-[11px] text-destructive">
                        {enrichError}
                      </p>
                    )}

                    {liveEnrichment && (
                      <div className="mt-3 space-y-3">
                        {liveEnrichment.summary && (
                          <p className="text-sm leading-relaxed text-foreground/80">
                            {liveEnrichment.summary}
                          </p>
                        )}

                        {liveEnrichment.whatTheyDo.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              What they do
                            </h4>
                            <ul className="flex list-disc flex-col gap-1 pl-4 text-[12px] text-foreground/80">
                              {liveEnrichment.whatTheyDo.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {liveEnrichment.keywords.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Keywords
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {liveEnrichment.keywords.map((kw) => (
                                <Badge key={kw} variant="secondary" className="border-0 text-[10px] font-normal">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {liveEnrichment.signals.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Derived signals
                            </h4>
                            <div className="flex flex-col gap-1">
                              {liveEnrichment.signals.map((sig) => (
                                <div
                                  key={sig.type}
                                  className="flex items-center justify-between rounded-md border border-border/60 bg-muted/40 px-2 py-1.5"
                                >
                                  <span className="text-[11px] font-medium text-foreground">
                                    {sig.type.replace(/_/g, " ")}
                                  </span>
                                  {sig.evidence && (
                                    <span className="ml-2 max-w-xs truncate text-[10px] text-muted-foreground">
                                      {sig.evidence}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recent signals preview */}
                  <div className="rounded-lg border border-border bg-card p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Signals</h3>
                      <button onClick={() => setActiveTab("signals")} className="text-[11px] text-accent hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {companySignals.slice(0, 3).map((signal) => (
                        <div key={signal.id} className="flex items-start gap-2.5">
                    <div className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-md",
                            signal.type === "funding" ? "bg-success/10 text-success" :
                              signal.type === "hiring" ? "bg-accent/10 text-accent" :
                                signal.type === "product" ? "bg-chart-4/10 text-chart-4" :
                                  "bg-muted text-muted-foreground"
                            )}>
                            <SignalIcon type={signal.type} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">{signal.title}</div>
                            <div className="text-[11px] text-muted-foreground">{signal.date} via {signal.source}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right sidebar: Details + Founder + Notes */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { icon: Globe, label: "Website", value: company.domain, isLink: true },
                        { icon: MapPin, label: "Location", value: company.location },
                        { icon: Calendar, label: "Founded", value: company.founded },
                        { icon: Users, label: "Team Size", value: company.employees },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <item.icon className="size-3" />
                            {item.label}
                          </div>
                          {item.isLink ? (
                            <a href="#" className="flex items-center gap-1 text-[11px] text-accent hover:underline">
                              {item.value}
                              <ExternalLink className="size-2.5" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-foreground">{item.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {company.founder && (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Founder</h3>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                          {company.founder.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{company.founder}</div>
                          <div className="text-[11px] text-muted-foreground">{company.founderTitle}</div>
                        </div>
                      </div>
                      <div className="mt-2.5 flex gap-1.5">
                        {company.linkedin && (
                          <a href="#" className="flex items-center gap-1 rounded-md border border-input px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                            <Linkedin className="size-2.5" /> LinkedIn
                          </a>
                        )}
                        {company.twitter && (
                          <a href="#" className="flex items-center gap-1 rounded-md border border-input px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                            <Twitter className="size-2.5" /> Twitter
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <StickyNote className="size-3 text-muted-foreground" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
                      </div>
                      <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[9px] text-muted-foreground/40">N</kbd>
                    </div>
                    <textarea
                      ref={notesRef}
                      value={notes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Add investment notes..."
                      className="min-h-[80px] w-full resize-none rounded-md border border-input bg-background p-2.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    {notes && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Notes are saved automatically for this company.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "signals" && (
              <div className="max-w-3xl">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signals Timeline</h3>
                <p className="mb-5 text-[11px] text-muted-foreground">
                  Activity tracked across funding, hiring, product, press, and partnerships.
                </p>
                <div className="relative">
                  <div className="absolute bottom-2 left-[13px] top-2 w-px bg-border" />
                  <div className="flex flex-col gap-5">
                    {companySignals.map((signal) => (
                      <div key={signal.id} className="relative flex gap-3 pl-9">
                        <div className={cn(
                          "absolute left-0 flex size-7 items-center justify-center rounded-full border-2 border-card",
                          signal.type === "funding" ? "bg-success/15 text-success" :
                            signal.type === "hiring" ? "bg-accent/15 text-accent" :
                              signal.type === "product" ? "bg-chart-4/15 text-chart-4" :
                                signal.type === "press" ? "bg-chart-1/15 text-chart-1" :
                                  signal.type === "partnership" ? "bg-chart-2/15 text-chart-2" :
                                    "bg-muted text-muted-foreground"
                        )}>
                          <SignalIcon type={signal.type} />
                        </div>
                        <div className="flex-1 rounded-lg border border-border bg-card p-4 transition-colors hover:border-accent/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{signal.title}</span>
                              <Badge variant="secondary" className="border-0 text-[10px] capitalize">{signal.type}</Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground">{signal.date}</span>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{signal.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Link2 className="size-2.5" />
                              {signal.source}
                            </span>
                            <span className={sentimentColor(signal.sentiment)}>{signal.sentiment}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom keyboard hints */}
          <div className="flex items-center gap-3 border-t border-border px-6 py-2 text-[10px] text-muted-foreground/40">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">Esc</kbd> back
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">E</kbd> enrich
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">S</kbd> save
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">N</kbd> notes
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">1</kbd>
              <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">2</kbd> tabs
            </span>
          </div>
        </div>

        {/* ── Right column: Enrichment Panel ── */}
        <div className="w-[380px] shrink-0 bg-card">
          <EnrichmentPanel
            company={company}
            enrichPhase={enrichPhase}
            enriched={enriched}
            enrichProgress={enrichProgress}
            onEnrich={handleEnrich}
          />
        </div>
      </div>
    </div>
  )
}