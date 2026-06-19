import { HistoryEntry, PredictRequest, PredictResponse } from "@/types"

const KEY = "gridlock_history"

export function saveEntry(input: PredictRequest, result: PredictResponse): HistoryEntry {
  const entry: HistoryEntry = {
    ...result,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    input,
  }
  const existing = getHistory()
  const updated = [entry, ...existing].slice(0, 50)
  localStorage.setItem(KEY, JSON.stringify(updated))
  return entry
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(KEY)
}
