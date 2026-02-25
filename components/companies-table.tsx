"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { companies, type Company } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search, SlidersHorizontal, ChevronDown, Flame, TrendingUp, Minus,
  ExternalLink, ListPlus, Sparkles, MoreHorizontal, Download, Check,
  X, Trash2, Tags, ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight,
} from "lucide-react"

const PAGE_SIZE = 8

const stageColors: Record<string, string> = {
  "Pre-Seed": "bg-muted text-muted-foreground",
  Seed: "bg-chart-2/10 text-chart-2",
  "Series A": "bg-accent/10 text-accent",
  "Series B": "bg-chart-5/10 text-chart-5",
  "Series C": "bg-warning/20 text-warning-foreground",
  Growth: "bg-success/10 text-success",
}

function SignalIndicator({ signal }: { signal: Company["signal"] }) {
  if (signal === "hot")
    return <span className="flex items-center gap-1 text-[11px] font-medium text-chart-3"><Flame className="size-3" />Hot</span>
  if (signal === "warm")
    return <span className="flex items-center gap-1 text-[11px] font-medium text-warning"><TrendingUp className="size-3" />Warm</span>
  return <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Minus className="size-3" />Neutral</span>
}

export function CompaniesTable({ onSelectCompany }: { onSelectCompany: (company: Company) => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStage, setSelectedStage] = useState("All")
  const [selectedSector, setSelectedSector] = useState("All")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [focusedRow, setFocusedRow] = useState(-1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const searchRef = useRef<HTMLInputElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  const stages = ["All", "Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth"]
  const sectors = ["All", ...Array.from(new Set(companies.map((c) => c.sector)))]

  const filtered = companies
    .filter((c) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      const matchesStage = selectedStage === "All" || c.stage === selectedStage
      const matchesSector = selectedSector === "All" || c.sector === selectedSector
      return matchesSearch && matchesStage && matchesSector
    })
    .sort((a, b) => {
      if (!sortField) return 0
      const dir = sortDir === "asc" ? 1 : -1
      if (sortField === "name") return a.name.localeCompare(b.name) * dir
      if (sortField === "funding") {
        const parseNum = (s: string) => parseFloat(s.replace(/[$M,]/g, "")) || 0
        return (parseNum(a.funding) - parseNum(b.funding)) * dir
      }
      if (sortField === "stage") return (stages.indexOf(a.stage) - stages.indexOf(b.stage)) * dir
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedStage, selectedSector])

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("asc") }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 opacity-30" />
    return sortDir === "asc" ? <ArrowUp className="size-3 text-accent" /> : <ArrowDown className="size-3 text-accent" />
  }

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") { (e.target as HTMLElement).blur(); e.preventDefault() }
        return
      }
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); searchRef.current?.focus(); return }
      if (e.key === "Escape" && selectedRows.size > 0) { e.preventDefault(); setSelectedRows(new Set()); return }
      if (e.key === "j" || e.key === "ArrowDown") { e.preventDefault(); setFocusedRow((p) => Math.min(p + 1, paginated.length - 1)) }
      if (e.key === "k" || e.key === "ArrowUp") { e.preventDefault(); setFocusedRow((p) => Math.max(p - 1, 0)) }
      if (e.key === "Enter" && focusedRow >= 0 && focusedRow < paginated.length) { e.preventDefault(); onSelectCompany(paginated[focusedRow]) }
      if (e.key === "x" && focusedRow >= 0 && focusedRow < paginated.length) { e.preventDefault(); toggleRow(paginated[focusedRow].id) }
      if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (selectedRows.size === filtered.length) setSelectedRows(new Set())
        else setSelectedRows(new Set(filtered.map((c) => c.id)))
      }
    },
    [filtered, paginated, focusedRow, onSelectCompany, selectedRows.size]
  )

  useEffect(() => { window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown) }, [handleKeyDown])
  useEffect(() => { if (focusedRow >= 0 && tableRef.current) { tableRef.current.querySelectorAll("tbody tr")[focusedRow]?.scrollIntoView({ block: "nearest" }) } }, [focusedRow])

  const activeFilterCount = (selectedStage !== "All" ? 1 : 0) + (selectedSector !== "All" ? 1 : 0)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">Companies</h1>
          <p className="text-xs text-muted-foreground">
            {filtered.length} companies {activeFilterCount > 0 && <span className="text-accent">(filtered)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Download className="size-3" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      <div
        className={cn(
          "flex items-center gap-3 overflow-hidden border-b border-accent/20 bg-accent/[0.04] px-6 transition-all duration-200",
          selectedRows.size > 0 ? "h-11 opacity-100" : "h-0 border-0 opacity-0"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded bg-accent text-[10px] font-bold text-accent-foreground">{selectedRows.size}</span>
          <span className="text-xs font-medium text-foreground">selected</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent/10"><ListPlus className="size-3.5" />Add to list</button>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent/10"><Sparkles className="size-3.5" />Bulk enrich</button>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent/10"><Tags className="size-3.5" />Tag</button>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent/10"><Download className="size-3.5" />Export</button>
        <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"><Trash2 className="size-3.5" />Remove</button>
        <div className="ml-auto">
          <button onClick={() => setSelectedRows(new Set())} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
            Clear <kbd className="rounded border border-border bg-secondary px-1 font-mono text-[9px]">Esc</kbd>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2.5 border-b border-border px-6 py-2.5">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search companies..."
            className="h-8 w-full rounded-md border border-input bg-card pl-8 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
            )}
            <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50">/</kbd>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
              <SlidersHorizontal className="size-3" />Stage
              {selectedStage !== "All" && <Badge variant="secondary" className="ml-0.5 px-1 py-0 text-[10px]">{selectedStage}</Badge>}
              <ChevronDown className="size-3 opacity-40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {stages.map((s) => (
              <DropdownMenuItem key={s} onClick={() => setSelectedStage(s)}><span className="flex-1">{s}</span>{selectedStage === s && <Check className="size-3" />}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-input bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
              Sector
              {selectedSector !== "All" && <Badge variant="secondary" className="ml-0.5 px-1 py-0 text-[10px]">{selectedSector}</Badge>}
              <ChevronDown className="size-3 opacity-40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {sectors.map((s) => (
              <DropdownMenuItem key={s} onClick={() => setSelectedSector(s)}><span className="flex-1">{s}</span>{selectedSector === s && <Check className="size-3" />}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilterCount > 0 && (
          <button onClick={() => { setSelectedStage("All"); setSelectedSector("All") }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="size-3" /> Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 px-4">
                <input
                  type="checkbox"
                  className="size-3.5 rounded border-input accent-accent"
                  checked={selectedRows.size === filtered.length && filtered.length > 0}
                  onChange={(e) => { if (e.target.checked) setSelectedRows(new Set(filtered.map((c) => c.id))); else setSelectedRows(new Set()) }}
                />
              </TableHead>
              <TableHead className="min-w-[200px]"><button className="flex items-center gap-1 text-xs" onClick={() => handleSort("name")}>Company <SortIcon field="name" /></button></TableHead>
              <TableHead><button className="flex items-center gap-1 text-xs" onClick={() => handleSort("stage")}>Stage <SortIcon field="stage" /></button></TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right"><button className="ml-auto flex items-center gap-1 text-xs" onClick={() => handleSort("funding")}>Funding <SortIcon field="funding" /></button></TableHead>
              <TableHead>Signal</TableHead>
              <TableHead>Growth</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((company, index) => (
              <TableRow
                key={company.id}
                className={cn(
                  "cursor-pointer transition-colors",
                  selectedRows.has(company.id) && "bg-accent/5",
                  focusedRow === index && "bg-accent/[0.03] ring-1 ring-inset ring-accent/20"
                )}
                onClick={() => onSelectCompany(company)}
                onMouseEnter={() => setFocusedRow(index)}
              >
                <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="size-3.5 rounded border-input accent-accent" checked={selectedRows.has(company.id)} onChange={() => toggleRow(company.id)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-xs font-bold text-foreground">{company.name.charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">{company.name}</span>
                        {company.enriched && <Sparkles className="size-3 text-accent" />}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{company.domain}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("border-0 text-[11px] font-medium", stageColors[company.stage])}>{company.stage}</Badge>
                </TableCell>
                <TableCell><span className="text-sm text-foreground">{company.sector}</span></TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{company.location}</span></TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm text-foreground">{company.funding}</span>
                  <div className="text-[11px] text-muted-foreground">{company.lastRound}</div>
                </TableCell>
                <TableCell><SignalIndicator signal={company.signal} /></TableCell>
                <TableCell>
                  {company.headcount_growth && (
                    <span className={cn("font-mono text-xs font-medium", company.headcount_growth.startsWith("+") ? "text-success" : "text-muted-foreground")}>{company.headcount_growth}</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground [tr:hover_&]:opacity-100">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectCompany(company)}><ExternalLink className="size-3" />Open profile</DropdownMenuItem>
                      <DropdownMenuItem><Sparkles className="size-3" />Enrich with AI</DropdownMenuItem>
                      <DropdownMenuItem><ListPlus className="size-3" />Add to list</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><Download className="size-3" />Export</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer with pagination */}
      <div className="flex items-center justify-between border-t border-border px-6 py-2.5">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            {(currentPage - 1) * PAGE_SIZE + 1}--{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground/40 lg:flex">
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">j</kbd>
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">k</kbd>
            <span>navigate</span>
            <span className="opacity-20">|</span>
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">x</kbd>
            <span>select</span>
            <span className="opacity-20">|</span>
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">/</kbd>
            <span>search</span>
            <span className="opacity-20">|</span>
            <kbd className="rounded border border-border bg-secondary px-1 py-0.5 font-mono">Enter</kbd>
            <span>open</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="flex size-7 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors",
                page === currentPage
                  ? "border border-accent bg-accent/10 text-accent"
                  : "border border-input text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="flex size-7 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
