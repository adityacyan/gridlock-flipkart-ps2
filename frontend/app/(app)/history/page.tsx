"use client"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { HistoryEntry } from "@/types"
import { getHistory, clearHistory } from "@/lib/history"
import SeverityBadge from "@/components/shared/SeverityBadge"
import Link from "next/link"
import {
  IconTrash,
  IconHistory,
  IconScanEye,
} from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item } from "@/lib/motion"

export default function HistoryPage() {
  const reduced  = useReducedMotion()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  useEffect(() => { setHistory(getHistory()) }, [])

  const handleClear = () => { clearHistory(); setHistory([]) }

  if (history.length === 0) {
    return (
      <motion.div
        variants={reduced ? {} : container}
        initial="hidden"
        animate="show"
        className="px-6 py-6 max-w-7xl mx-auto"
      >
        <motion.div variants={reduced ? {} : item} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="anim-dot w-2 h-2 bg-black inline-block shrink-0" />
            <h1 className="font-display text-2xl text-black tracking-tighter">HISTORY</h1>
          </div>
        </motion.div>
        <motion.div variants={reduced ? {} : item}
          className="bg-[#f9f9f9] border-[3px] border-black flex flex-col items-center justify-center px-6 py-20 gap-3 text-center"
          style={{ boxShadow: "6px 6px 0 0 #000" }}>
          <IconHistory size={40} stroke={1} className="text-black/20" />
          <p className="font-mono-noir text-sm font-bold text-black uppercase tracking-widest">No data yet</p>
          <p className="font-mono-noir text-xs text-[#848484]">Predictions will appear here after you run them</p>
          <Link href="/predict" className="btn-brutal mt-3">
            <IconScanEye size={14} /> RUN A PREDICTION
          </Link>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={reduced ? {} : container}
      initial="hidden"
      animate="show"
      className="px-6 py-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={reduced ? {} : item} className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="anim-dot w-2 h-2 bg-black inline-block shrink-0" />
            <h1 className="font-display text-2xl text-black tracking-tighter">HISTORY</h1>
          </div>
          <p className="font-mono-noir text-xs text-[#5d5f5f] uppercase tracking-widest pl-5">
            {history.length} prediction{history.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={handleClear}
          className="btn-secondary !border-[#f87171] !text-[#7f1d1d] hover:!bg-[#fef2f2] flex items-center gap-1.5">
          <IconTrash size={13} /> CLEAR ALL
        </button>
      </motion.div>

      {/* Table */}
      <motion.div variants={reduced ? {} : item}
        className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden"
        style={{ boxShadow: "6px 6px 0 0 #000" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b-[3px] border-black bg-black text-white">
                {["Time", "Event Cause", "Type", "Location", "Corridor", "Severity", "Officers"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono-noir text-[10px] uppercase tracking-widest font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-black/10">
              {history.map(e => (
                <tr key={e.id} className="hover:bg-[#f3f3f3] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-mono-noir text-xs text-black font-bold">{new Date(e.timestamp).toLocaleDateString()}</p>
                    <p className="font-mono-noir text-[10px] text-[#848484] mt-0.5">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </td>
                  <td className="px-4 py-3 font-mono-noir text-xs text-black font-bold capitalize">{e.input.event_cause.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 font-mono-noir text-xs text-[#5d5f5f] capitalize">{e.input.event_type}</td>
                  <td className="px-4 py-3 font-mono-noir text-[11px] text-[#848484]">
                    {e.input.latitude.toFixed(4)}, {e.input.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 font-mono-noir text-xs text-[#5d5f5f]">{e.input.corridor ?? <span className="text-[#c0c0c0]">—</span>}</td>
                  <td className="px-4 py-3"><SeverityBadge label={e.severity_label} size="sm" /></td>
                  <td className="px-4 py-3 font-mono-noir text-xs text-black tabular-nums">{e.recommendations.manpower_min}–{e.recommendations.manpower_max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
