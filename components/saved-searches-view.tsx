"use client"

import { useState } from "react"
import { savedSearches as initialSavedSearches, type SavedSearch } from "@/lib/data"
import { useLocalStorageState } from "@/hooks/use-local-storage"
import { Badge } from "@/components/ui/badge"
import {
  Plus, MoreHorizontal, Play, Clock, Hash, Pencil, Trash2, Copy, Search, RefreshCw, Bell, BellOff, Zap, ArrowRight,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const frequencyConfig: Record<string, { color: string; icon: React.ElementType }> = {
  daily: { color: "bg-success/10 text-success", icon: Zap },
  weekly: { color: "bg-accent/10 text-accent", icon: RefreshCw },
  manual: { color: "bg-muted text-muted-foreground", icon: Clock },
}

export function SavedSearchesView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userSavedSearches, setUserSavedSearches] = useLocalStorageState<SavedSearch[]>(
    "vc-scout:saved-searches",
    initialSavedSearches,
  )

  const filtered = userSavedSearches.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.query.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateSearch = () => {
    const name = window.prompt("Search name")
    if (!name) return
    const query = window.prompt("Search query") ?? ""
    const next: SavedSearch = {
      id: String(Date.now()),
      name: name.trim(),
      query: query.trim() || "sector:AI",
      filters: [],
      resultCount: 0,
      lastRun: new Date().toISOString(),
      frequency: "manual",
    }
    setUserSavedSearches((prev) => [...prev, next])
  }

  const handleDeleteSearch = (id: string) => {
    setUserSavedSearches((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">Saved Searches</h1>
          <p className="text-xs text-muted-foreground">
            Monitor the market with automated search alerts
          </p>
        </div>
        <button
          onClick={handleCreateSearch}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3" />
          New Search
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-border px-6 py-2.5">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter saved searches..."
            className="h-8 w-full rounded-md border border-input bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex max-w-4xl flex-col gap-2.5">
          {filtered.map((search) => {
            const freq = frequencyConfig[search.frequency]
            const FreqIcon = freq.icon
            return (
              <div
                key={search.id}
                className="group cursor-pointer rounded-lg border border-border bg-card p-5 transition-all hover:border-accent/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{search.name}</h3>
                      <Badge variant="secondary" className={cn("border-0 text-[10px] font-medium capitalize", freq.color)}>
                        <FreqIcon className="mr-0.5 size-2.5" />
                        {search.frequency}
                      </Badge>
                    </div>

                    <code className="mt-2 inline-block rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {search.query}
                    </code>

                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {search.filters.map((filter) => (
                        <Badge key={filter} variant="secondary" className="border-0 text-[10px] font-normal">{filter}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button className="flex items-center gap-1.5 rounded-md border border-input bg-card px-2.5 py-1.5 text-xs font-medium text-foreground opacity-0 transition-all hover:bg-secondary group-hover:opacity-100">
                      <Play className="size-3" />
                      Run
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Pencil className="size-3" />Edit search</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="size-3" />Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><Bell className="size-3" />Set alert</DropdownMenuItem>
                        <DropdownMenuItem><BellOff className="size-3" />Mute</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteSearch(search.id)}
                        >
                          <Trash2 className="size-3" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Footer stats */}
                <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="size-3" />
                      <span className="font-medium text-foreground">{search.resultCount}</span> results
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      Last run {new Date(search.lastRun).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    View results <ArrowRight className="size-3" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
