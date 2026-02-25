"use client"

import { useEffect, useState } from "react"

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem(key)
      if (stored != null) {
        setValue(JSON.parse(stored) as T)
      }
    } catch {
      // Ignore malformed JSON or access errors
    }
    // We only want this to run on mount for this key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Persist whenever the value changes
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore quota / access errors
    }
  }, [key, value])

  return [value, setValue] as const
}

