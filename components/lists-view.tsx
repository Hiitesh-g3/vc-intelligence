"use client"

import { useState } from "react"
import { lists as initialLists, companies, type List } from "@/lib/data"
import { useLocalStorageState } from "@/hooks/use-local-storage"
import { Badge } from "@/components/ui/badge"
import {
  Plus, MoreHorizontal, Building2, Calendar, Pencil, Trash2, Copy, Download, Search, ListTree, ArrowRight,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ListsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userLists, setUserLists] = useLocalStorageState<List[]>("vc-scout:lists", initialLists)

  const filtered = userLists.filter(
    (l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateList = () => {
    const name = window.prompt("List name")
    if (!name) return
    const description = window.prompt("Description") ?? ""
    const palette = [
      "oklch(0.40 0.12 250)",
      "oklch(0.62 0.17 155)",
      "oklch(0.75 0.15 70)",
      "oklch(0.55 0.15 30)",
      "oklch(0.50 0.20 330)",
    ]
    const color = palette[userLists.length % palette.length]
    const next: List = {
      id: String(Date.now()),
      name: name.trim(),
      description: description.trim() || "Custom list",
      companyCount: 0,
      updatedAt: new Date().toISOString(),
      color,
    }
    setUserLists((prev) => [...prev, next])
  }

  const handleDeleteList = (id: string) => {
    setUserLists((prev) => prev.filter((list) => list.id !== id))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-base font-semibold text-foreground">Lists</h1>
          <p className="text-xs text-muted-foreground">
            Organize companies into curated collections
          </p>
        </div>
        <button
          onClick={handleCreateList}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3" />
          New List
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-border px-6 py-2.5">
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lists..."
            className="h-8 w-full rounded-md border border-input bg-card pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lists grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {/* Create new list card */}
          <button
            onClick={handleCreateList}
            className="group flex flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-border px-6 py-10 text-muted-foreground transition-all hover:border-accent/40 hover:bg-accent/2 hover:text-accent"
          >
            <div className="flex size-10 items-center justify-center rounded-full border-2 border-current transition-colors">
              <Plus className="size-4" />
            </div>
            <span className="text-xs font-medium">Create new list</span>
          </button>

          {filtered.map((list) => {
            const previewCompanies = companies.slice(0, 4)
            return (
              <div
                key={list.id}
                className="group cursor-pointer rounded-lg border border-border bg-card p-5 transition-all hover:border-accent/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-md" style={{ backgroundColor: list.color + "18" }}>
                      <ListTree className="size-3.5" style={{ color: list.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{list.name}</h3>
                      <span className="text-[11px] text-muted-foreground">{list.companyCount} companies</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Pencil className="size-3" />Edit list</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="size-3" />Duplicate</DropdownMenuItem>
                        <DropdownMenuItem><Download className="size-3" />Export CSV</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDeleteList(list.id)}
                        >
                          <Trash2 className="size-3" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                  {list.description}
                </p>

                {/* Company preview avatars */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {previewCompanies.map((c, i) => (
                      <div
                        key={c.id}
                        className="flex size-6 items-center justify-center rounded-md border-2 border-card bg-secondary text-[9px] font-bold text-foreground"
                        style={{ marginLeft: i > 0 ? "-6px" : 0, zIndex: 4 - i }}
                      >
                        {c.name.charAt(0)}
                      </div>
                    ))}
                    {list.companyCount > 4 && (
                      <span className="ml-1.5 text-[10px] text-muted-foreground">+{list.companyCount - 4}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="size-2.5" />
                    {new Date(list.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>

                {/* Hover action */}
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  Open list <ArrowRight className="size-3" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
