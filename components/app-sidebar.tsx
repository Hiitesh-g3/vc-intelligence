"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Building2,
  Search,
  ListTree,
  Bookmark,
  Sparkles,
  Settings,
  ChevronDown,
  Plus,
  Command,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type NavItem = {
  label: string
  icon: React.ElementType
  href: string
  count?: number
  shortcut?: string
}

const mainNav: NavItem[] = [
  { label: "Companies", icon: Building2, href: "/", count: 2847, shortcut: "G then C" },
  { label: "Lists", icon: ListTree, href: "/lists", count: 5, shortcut: "G then L" },
  { label: "Saved Searches", icon: Bookmark, href: "/searches", shortcut: "G then S" },
]

export function AppSidebar({
  currentPath,
  onNavigate,
}: {
  currentPath: string
  onNavigate: (path: string) => void
}) {
  // Go-to keyboard shortcuts (g then c/l/s)
  useEffect(() => {
    let gPressed = false
    let timeout: NodeJS.Timeout

    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        gPressed = true
        timeout = setTimeout(() => { gPressed = false }, 800)
        return
      }

      if (gPressed) {
        gPressed = false
        clearTimeout(timeout)
        if (e.key === "c") { e.preventDefault(); onNavigate("/") }
        if (e.key === "l") { e.preventDefault(); onNavigate("/lists") }
        if (e.key === "s") { e.preventDefault(); onNavigate("/searches") }
      }
    }
    window.addEventListener("keydown", handler)
    return () => {
      window.removeEventListener("keydown", handler)
      clearTimeout(timeout)
    }
  }, [onNavigate])

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-[var(--sidebar-bg)] text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-accent">
          <Sparkles className="size-3.5 text-sidebar-primary" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-primary">
          Meridian
        </span>
        <span className="ml-auto rounded border border-sidebar-border bg-sidebar-accent/60 px-1.5 py-0.5 text-[9px] font-medium text-sidebar-foreground/50">
          BETA
        </span>
      </div>

      {/* Quick search */}
      <div className="px-3 pb-2">
        <button className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 px-3 py-1.5 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent">
          <Search className="size-3.5 shrink-0 opacity-50" />
          <span className="opacity-50">Search companies...</span>
          <kbd className="ml-auto flex items-center gap-0.5 rounded border border-sidebar-border bg-sidebar-accent px-1.5 py-0.5 font-mono text-[10px] text-sidebar-foreground/60">
            <Command className="size-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-2">
        <div className="mb-2 px-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
          Workspace
        </div>
        {mainNav.map((item) => {
          const isActive = currentPath === item.href
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onNavigate(item.href)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-primary"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-sidebar-primary" : "opacity-60"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.count && (
                    <span
                      className={cn(
                        "ml-auto font-mono text-[11px]",
                        isActive
                          ? "text-sidebar-primary/60"
                          : "text-sidebar-foreground/30"
                      )}
                    >
                      {item.count.toLocaleString()}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {item.shortcut && (
                <TooltipContent side="right" className="flex items-center gap-2">
                  <span>{item.label}</span>
                  <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                    {item.shortcut}
                  </kbd>
                </TooltipContent>
              )}
            </Tooltip>
          )
        })}

        <div className="mb-2 mt-6 px-2 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
          Lists
        </div>
        {[
          "AI Infrastructure Thesis",
          "Series A Pipeline",
          "Climate & Energy",
        ].map((name, i) => {
          const colors = [
            "oklch(0.40 0.12 250)",
            "oklch(0.62 0.17 155)",
            "oklch(0.75 0.15 70)",
          ]
          return (
            <button
              key={name}
              onClick={() => onNavigate("/lists")}
              className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-primary"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: colors[i] }}
              />
              <span className="truncate">{name}</span>
            </button>
          )
        })}
        <button
          onClick={() => onNavigate("/lists")}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <Plus className="size-3.5" />
          <span>New list</span>
        </button>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border p-3">
        <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-primary">
          <Settings className="size-4 opacity-60" />
          <span>Settings</span>
        </button>
        <div className="mt-2 flex items-center gap-2.5 px-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-accent-foreground">
            JD
          </div>
          <div className="flex-1 truncate text-[12px] text-sidebar-foreground">
            <span className="text-sidebar-primary">Julia D.</span>
          </div>
          <ChevronDown className="size-3 opacity-40" />
        </div>
      </div>
    </aside>
  )
}
