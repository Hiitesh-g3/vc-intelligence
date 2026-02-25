export type Company = {
  id: string
  name: string
  domain: string
  description: string
  stage: "Pre-Seed" | "Seed" | "Series A" | "Series B" | "Series C" | "Growth"
  sector: string
  location: string
  founded: string
  employees: string
  funding: string
  lastRound: string
  signal: "hot" | "warm" | "neutral"
  enriched: boolean
  addedAt: string
  tags: string[]
  headcount_growth?: string
  web_traffic?: string
  founder?: string
  founderTitle?: string
  linkedin?: string
  twitter?: string
}

export type List = {
  id: string
  name: string
  description: string
  companyCount: number
  updatedAt: string
  color: string
}

export type SavedSearch = {
  id: string
  name: string
  query: string
  filters: string[]
  resultCount: number
  lastRun: string
  frequency: "daily" | "weekly" | "manual"
}

export type Signal = {
  id: string
  type: "funding" | "hiring" | "product" | "press" | "partnership" | "executive"
  title: string
  description: string
  date: string
  source: string
  sentiment: "positive" | "neutral" | "negative"
}

export const companies: Company[] = [
  {
    id: "1",
    name: "Luminary AI",
    domain: "luminary.ai",
    description: "Building next-generation foundation models for enterprise reasoning and decision-making. Their proprietary architecture achieves 3x inference speed with comparable accuracy to leading models.",
    stage: "Series A",
    sector: "AI / ML",
    location: "San Francisco, CA",
    founded: "2023",
    employees: "25-50",
    funding: "$18M",
    lastRound: "Jan 2025",
    signal: "hot",
    enriched: true,
    addedAt: "2025-12-15",
    tags: ["AI", "Enterprise", "Deep Tech"],
    headcount_growth: "+45%",
    web_traffic: "+120%",
    founder: "Dr. Sarah Chen",
    founderTitle: "CEO & Co-founder",
    linkedin: "linkedin.com/in/sarahchen",
    twitter: "@sarahchen_ai",
  },
  {
    id: "2",
    name: "Vectrix",
    domain: "vectrix.dev",
    description: "Developer infrastructure for real-time vector search at scale. Powers semantic search for 200+ production applications with sub-millisecond latency.",
    stage: "Seed",
    sector: "Developer Tools",
    location: "New York, NY",
    founded: "2024",
    employees: "10-25",
    funding: "$5.2M",
    lastRound: "Sep 2025",
    signal: "hot",
    enriched: true,
    addedAt: "2025-11-20",
    tags: ["DevTools", "Infrastructure", "Search"],
    headcount_growth: "+60%",
    web_traffic: "+85%",
    founder: "Marcus Rivera",
    founderTitle: "CEO",
  },
  {
    id: "3",
    name: "Canopy Health",
    domain: "canopyhealth.co",
    description: "AI-powered clinical decision support platform that integrates with existing EHR systems. Reduces diagnostic errors by 40% in pilot studies across 12 hospital networks.",
    stage: "Series B",
    sector: "Healthcare",
    location: "Boston, MA",
    founded: "2022",
    employees: "50-100",
    funding: "$42M",
    lastRound: "Mar 2025",
    signal: "warm",
    enriched: true,
    addedAt: "2025-10-08",
    tags: ["Healthcare", "AI", "B2B"],
    headcount_growth: "+30%",
    web_traffic: "+45%",
    founder: "Dr. James Okafor",
    founderTitle: "CEO & Co-founder",
  },
  {
    id: "4",
    name: "Terravolt",
    domain: "terravolt.energy",
    description: "Next-generation solid-state battery technology for grid-scale energy storage. 2x energy density at 60% of the cost of current lithium-ion solutions.",
    stage: "Series A",
    sector: "Climate Tech",
    location: "Austin, TX",
    founded: "2023",
    employees: "25-50",
    funding: "$22M",
    lastRound: "Nov 2025",
    signal: "hot",
    enriched: false,
    addedAt: "2026-01-05",
    tags: ["Climate", "Energy", "Deep Tech"],
    headcount_growth: "+35%",
    web_traffic: "+60%",
    founder: "Elena Vasquez",
    founderTitle: "CEO",
  },
  {
    id: "5",
    name: "Finley",
    domain: "finley.com",
    description: "Embedded lending infrastructure for SaaS platforms. Enables any B2B software company to offer working capital products to their customers.",
    stage: "Series B",
    sector: "Fintech",
    location: "San Francisco, CA",
    founded: "2021",
    employees: "50-100",
    funding: "$38M",
    lastRound: "Jun 2025",
    signal: "warm",
    enriched: true,
    addedAt: "2025-09-12",
    tags: ["Fintech", "Infrastructure", "B2B"],
    headcount_growth: "+25%",
    web_traffic: "+30%",
    founder: "Ava Patel",
    founderTitle: "CEO & Co-founder",
  },
  {
    id: "6",
    name: "Archipelago",
    domain: "archipelago.io",
    description: "Composable data platform for multi-cloud environments. Unifies data governance, lineage, and quality across AWS, GCP, and Azure with a single control plane.",
    stage: "Seed",
    sector: "Data Infrastructure",
    location: "Seattle, WA",
    founded: "2024",
    employees: "10-25",
    funding: "$8M",
    lastRound: "Dec 2025",
    signal: "neutral",
    enriched: false,
    addedAt: "2026-01-18",
    tags: ["Data", "Cloud", "Infrastructure"],
    headcount_growth: "+20%",
    web_traffic: "+40%",
    founder: "Ryan Kim",
    founderTitle: "CEO",
  },
  {
    id: "7",
    name: "Praxis Robotics",
    domain: "praxisrobotics.com",
    description: "Autonomous mobile robots for warehouse logistics. Combines computer vision with novel path-planning algorithms for 99.7% pick accuracy.",
    stage: "Series A",
    sector: "Robotics",
    location: "Pittsburgh, PA",
    founded: "2022",
    employees: "25-50",
    funding: "$15M",
    lastRound: "Aug 2025",
    signal: "warm",
    enriched: true,
    addedAt: "2025-08-22",
    tags: ["Robotics", "Logistics", "AI"],
    headcount_growth: "+50%",
    web_traffic: "+35%",
    founder: "Alex Tran",
    founderTitle: "CEO & Co-founder",
  },
  {
    id: "8",
    name: "Noma Security",
    domain: "nomasecurity.com",
    description: "AI-native application security platform that detects vulnerabilities in real-time during development. Reduces false positives by 90% compared to traditional SAST tools.",
    stage: "Seed",
    sector: "Cybersecurity",
    location: "Tel Aviv, Israel",
    founded: "2024",
    employees: "10-25",
    funding: "$6.5M",
    lastRound: "Oct 2025",
    signal: "hot",
    enriched: false,
    addedAt: "2026-02-01",
    tags: ["Security", "AI", "DevTools"],
    headcount_growth: "+70%",
    web_traffic: "+95%",
    founder: "Yael Mor",
    founderTitle: "CEO",
  },
  {
    id: "9",
    name: "Meridian Bio",
    domain: "meridianbio.com",
    description: "Computational biology platform accelerating drug discovery for rare diseases. ML models predict protein interactions with 85% accuracy, 10x faster than traditional methods.",
    stage: "Series A",
    sector: "Biotech",
    location: "Cambridge, MA",
    founded: "2023",
    employees: "25-50",
    funding: "$20M",
    lastRound: "Feb 2025",
    signal: "neutral",
    enriched: true,
    addedAt: "2025-07-10",
    tags: ["Biotech", "AI", "Healthcare"],
    headcount_growth: "+15%",
    web_traffic: "+20%",
    founder: "Dr. Kenji Watanabe",
    founderTitle: "CEO & CSO",
  },
  {
    id: "10",
    name: "Relay Commerce",
    domain: "relay.co",
    description: "Unified commerce platform for D2C brands expanding into wholesale and retail channels. Manages inventory, orders, and fulfillment across all channels from a single dashboard.",
    stage: "Series A",
    sector: "E-Commerce",
    location: "Los Angeles, CA",
    founded: "2023",
    employees: "25-50",
    funding: "$12M",
    lastRound: "Jul 2025",
    signal: "warm",
    enriched: false,
    addedAt: "2025-11-03",
    tags: ["E-Commerce", "SaaS", "B2B"],
    headcount_growth: "+40%",
    web_traffic: "+55%",
    founder: "Jordan Blake",
    founderTitle: "CEO & Co-founder",
  },
]

export const lists: List[] = [
  { id: "1", name: "AI Infrastructure Thesis", description: "Companies building foundational AI infrastructure", companyCount: 14, updatedAt: "2026-02-20", color: "oklch(0.40 0.12 250)" },
  { id: "2", name: "Series A Pipeline", description: "Active Series A opportunities to evaluate", companyCount: 8, updatedAt: "2026-02-18", color: "oklch(0.62 0.17 155)" },
  { id: "3", name: "Climate & Energy", description: "Climate tech and clean energy portfolio candidates", companyCount: 6, updatedAt: "2026-02-15", color: "oklch(0.75 0.15 70)" },
  { id: "4", name: "Developer Tools Watch", description: "Emerging developer tooling companies", companyCount: 11, updatedAt: "2026-02-12", color: "oklch(0.55 0.15 30)" },
  { id: "5", name: "Healthcare AI", description: "AI applications in healthcare and biotech", companyCount: 5, updatedAt: "2026-02-10", color: "oklch(0.50 0.20 330)" },
]

export const savedSearches: SavedSearch[] = [
  { id: "1", name: "AI Seed Rounds - SF", query: "AI AND stage:Seed AND location:SF", filters: ["Stage: Seed", "Sector: AI/ML", "Location: San Francisco"], resultCount: 23, lastRun: "2026-02-24", frequency: "daily" },
  { id: "2", name: "Series A DevTools", query: "Developer Tools AND stage:Series A", filters: ["Stage: Series A", "Sector: Developer Tools"], resultCount: 12, lastRun: "2026-02-23", frequency: "weekly" },
  { id: "3", name: "Hiring Surge Startups", query: "headcount_growth:>50%", filters: ["Headcount Growth: >50%", "Founded: 2023+"], resultCount: 31, lastRun: "2026-02-22", frequency: "daily" },
  { id: "4", name: "Fintech Infrastructure", query: "Fintech AND (infrastructure OR platform)", filters: ["Sector: Fintech", "Type: Infrastructure"], resultCount: 18, lastRun: "2026-02-20", frequency: "weekly" },
  { id: "5", name: "Climate Series B+", query: "Climate AND (stage:Series B OR stage:Series C)", filters: ["Stage: Series B+", "Sector: Climate Tech"], resultCount: 7, lastRun: "2026-02-19", frequency: "manual" },
]

export const companySignals: Signal[] = [
  { id: "1", type: "funding", title: "Closed $18M Series A", description: "Led by Sequoia Capital with participation from YC and existing angels. Valued at $90M post-money.", date: "2025-01-15", source: "Crunchbase", sentiment: "positive" },
  { id: "2", type: "hiring", title: "Engineering team grew 45% in 6 months", description: "Added 12 new engineers including VP of Engineering from Google DeepMind and 3 senior ML researchers.", date: "2025-06-20", source: "LinkedIn", sentiment: "positive" },
  { id: "3", type: "product", title: "Launched Enterprise API v2.0", description: "New API supports custom fine-tuning, multi-modal inputs, and real-time streaming with 3x throughput improvement.", date: "2025-09-10", source: "Product Hunt", sentiment: "positive" },
  { id: "4", type: "press", title: "Featured in TechCrunch AI50 List", description: "Named one of the top 50 most promising AI startups by TechCrunch editorial team.", date: "2025-11-01", source: "TechCrunch", sentiment: "positive" },
  { id: "5", type: "partnership", title: "Strategic partnership with Snowflake", description: "Integration enables Snowflake customers to run Luminary models directly on their data warehouse.", date: "2025-12-05", source: "Press Release", sentiment: "positive" },
  { id: "6", type: "executive", title: "Appointed new CTO", description: "Dr. Michael Torres joined as CTO from Meta AI Research, bringing 15 years of ML infrastructure experience.", date: "2026-01-20", source: "LinkedIn", sentiment: "positive" },
  { id: "7", type: "hiring", title: "Opened new office in London", description: "Expanding European presence with a new engineering hub. Planning to hire 20+ in Q1 2026.", date: "2026-02-01", source: "Company Blog", sentiment: "neutral" },
]
