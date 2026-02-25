import { NextRequest, NextResponse } from "next/server"

type EnrichmentSignal =
  | "careers_page"
  | "blog_or_news"
  | "docs_or_developer_portal"
  | "pricing_page"
  | "product_or_platform"

type EnrichmentResult = {
  url: string
  fetchedAt: string
  summary: string
  whatTheyDo: string[]
  keywords: string[]
  signals: {
    type: EnrichmentSignal
    present: boolean
    evidence: string | null
  }[]
  sources: {
    type: "website"
    url: string
  }[]
}

const cache = new Map<string, EnrichmentResult>()
const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "you", "your", "are",
  "our", "their", "they", "them", "have", "has", "into", "over", "under",
  "about", "into", "through", "more", "than", "just", "will", "can", "all",
  "any", "out", "how", "why", "what", "when", "where", "which", "who",
  "company", "platform", "service", "services", "product", "products",
])

export const dynamic = "force-dynamic"

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    // Normalize hostname + pathname without trailing slash
    const pathname = u.pathname.replace(/\/+$/, "") || "/"
    return `${u.protocol}//${u.hostname}${pathname}`
  } catch {
    return url.trim()
  }
}

function stripHtml(html: string): string {
  // Drop scripts/styles
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")

  // Replace tags with spaces
  text = text.replace(/<[^>]+>/g, " ")

  // Decode a few common entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")

  // Collapse whitespace
  return text.replace(/\s+/g, " ").trim()
}

function extractSentences(text: string): string[] {
  // Simple sentence splitter – good enough for MVP
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function buildSummary(sentences: string[]): string {
  if (sentences.length === 0) return ""
  const candidates = sentences.filter((s) => s.length > 40)
  const picked = (candidates.length > 0 ? candidates : sentences).slice(0, 2)
  return picked.join(" ")
}

function buildWhatTheyDo(sentences: string[]): string[] {
  if (sentences.length === 0) return []
  const focusWords = ["platform", "solution", "product", "helps", "we ", "our ", "enables", "build", "AI", "SaaS"]
  const scored = sentences
    .slice(0, 15) // focus on early content
    .map((s) => {
      const lower = s.toLowerCase()
      const score = focusWords.reduce(
        (acc, w) => (lower.includes(w.toLowerCase()) ? acc + 1 : acc),
        0,
      )
      return { s, score }
    })
    .sort((a, b) => b.score - a.score || b.s.length - a.s.length)

  const top = scored.slice(0, 4).map((x) => x.s)
  // Deduplicate / trim
  return Array.from(new Set(top.map((s) => s.trim()))).filter(Boolean)
}

function buildKeywords(text: string, max = 10): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))

  const freq = new Map<string, number>()
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1)
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w)
}

function inferSignals(html: string, text: string): EnrichmentResult["signals"] {
  const lowerHtml = html.toLowerCase()
  const lowerText = text.toLowerCase()

  const hasCareers =
    lowerHtml.includes("href=\"/careers\"") ||
    lowerHtml.includes("href='/careers'") ||
    lowerHtml.includes("careers") ||
    lowerText.includes("we are hiring") ||
    lowerText.includes("join our team")

  const hasBlog =
    lowerHtml.includes("href=\"/blog\"") ||
    lowerHtml.includes("href='/blog'") ||
    lowerText.includes("blog") ||
    lowerText.includes("news")

  const hasDocs =
    lowerHtml.includes("href=\"/docs\"") ||
    lowerHtml.includes("href='/docs'") ||
    lowerText.includes("documentation") ||
    lowerText.includes("api reference") ||
    lowerText.includes("developer docs")

  const hasPricing =
    lowerHtml.includes("href=\"/pricing\"") ||
    lowerHtml.includes("href='/pricing'") ||
    lowerText.includes("pricing") ||
    lowerText.includes("plans")

  const hasProductLanguage =
    lowerText.includes("platform") ||
    lowerText.includes("product") ||
    lowerText.includes("solution")

  const signals: EnrichmentResult["signals"] = [
    {
      type: "careers_page",
      present: hasCareers,
      evidence: hasCareers ? "Found careers-related links or copy" : null,
    },
    {
      type: "blog_or_news",
      present: hasBlog,
      evidence: hasBlog ? "Found blog/news links or copy" : null,
    },
    {
      type: "docs_or_developer_portal",
      present: hasDocs,
      evidence: hasDocs ? "Found docs/developer-related links or copy" : null,
    },
    {
      type: "pricing_page",
      present: hasPricing,
      evidence: hasPricing ? "Found pricing/plan links or copy" : null,
    },
    {
      type: "product_or_platform",
      present: hasProductLanguage,
      evidence: hasProductLanguage ? "Website copy describes a product/platform/solution" : null,
    },
  ]

  // Only return signals that are present, but keep a small set for debugging if nothing found
  const present = signals.filter((s) => s.present)
  return present.length > 0 ? present : signals.slice(0, 2)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'url' in request body" },
        { status: 400 },
      )
    }

    let url = body.url.trim()
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`
    }

    const normalized = normalizeUrl(url)

    // Return cached result if available
    const cached = cache.get(normalized)
    if (cached) {
      return NextResponse.json(
        { ...cached, cached: true },
        { status: 200 },
      )
    }

    const resp = await fetch(url, {
      method: "GET",
      // Prevent Next.js from caching upstream responses aggressively
      cache: "no-store",
      headers: {
        "User-Agent":
          "vc-scout-enricher/0.1 (+https://example.com; bot for enrichment demo)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    })

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (status ${resp.status})` },
        { status: 502 },
      )
    }

    const html = await resp.text()
    const text = stripHtml(html)
    const sentences = extractSentences(text)

    const summary = buildSummary(sentences)
    const whatTheyDo = buildWhatTheyDo(sentences)
    const keywords = buildKeywords(text)
    const signals = inferSignals(html, text)

    const result: EnrichmentResult = {
      url: normalized,
      fetchedAt: new Date().toISOString(),
      summary,
      whatTheyDo,
      keywords,
      signals,
      sources: [
        {
          type: "website",
          url: normalized,
        },
      ],
    }

    cache.set(normalized, result)

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error("Enrichment error", err)
    return NextResponse.json(
      { error: "Internal error while enriching website" },
      { status: 500 },
    )
  }
}

