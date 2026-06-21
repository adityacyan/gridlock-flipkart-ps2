"use client"
import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import dynamic from "next/dynamic"
import { HistoryEntry } from "@/types"
import { getHistory } from "@/lib/history"
import StatsBar from "@/components/dashboard/StatsBar"
import SeverityDonut from "@/components/dashboard/SeverityDonut"
import Link from "next/link"
import {
  IconArrowRight,
  IconAlertTriangle,
  IconChartPie,
  IconMapPin,
  IconClockHour4,
  IconBolt,
} from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item } from "@/lib/motion"
import SeverityBadge from "@/components/shared/SeverityBadge"

const BengaluruMap = dynamic(() => import("@/components/map/BengaluruMap"), { ssr: false })


export default function Dashboard() {
  const reduced = useReducedMotion()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  useEffect(() => { setHistory(getHistory()) }, [])

  const recent = history.slice(0, 6)

  const stats = [
    { label: "Total Predictions", value: history.length,                                        icon: IconBolt },
    { label: "Critical",          value: history.filter(h => h.severity_level === 3).length,    icon: IconAlertTriangle },
    { label: "High Severity",     value: history.filter(h => h.severity_level === 2).length,    icon: IconChartPie },
  ]

  const sevCounts = ["Low", "Medium", "High", "Critical"].map(label => ({
    name: label,
    value: history.filter(h => h.severity_label === label).length,
  }))

  return (
    <motion.div
      variants={reduced ? {} : container}
      initial="hidden"
      animate="show"
      className="px-6 py-6 max-w-7xl mx-auto space-y-6 pb-6"
    >
      {/* Page title */}
      <motion.div variants={reduced ? {} : item}>
        <div className="flex items-center gap-3 mb-1">
          <span className="anim-dot w-2 h-2 bg-black inline-block shrink-0" />
          <h1 className="font-display text-2xl text-black tracking-tighter">DASHBOARD</h1>
        </div>
        <p className="font-mono-noir text-xs text-[#5d5f5f] uppercase tracking-widest pl-5">Bengaluru congestion monitoring</p>
      </motion.div>

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <motion.div variants={reduced ? {} : item}
          className="lg:col-span-2 bg-[#f9f9f9] border-[3px] border-black overflow-hidden"
          style={{ boxShadow: "6px 6px 0 0 #000" }}>
          <div className="px-4 py-3 border-b-[3px] border-black flex items-center justify-between bg-black text-white">
            <div className="flex items-center gap-2">
              <IconMapPin size={13} stroke={1.5} />
              <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Incident Map</span>
            </div>
            <span className="font-mono-noir text-[10px] uppercase tracking-widest text-white/60">Bengaluru</span>
          </div>
          <div className="p-3">
            <BengaluruMap entries={history} height="370px" />
          </div>
        </motion.div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <SeverityDonut counts={sevCounts} />

          {/* Recent events */}
          <motion.div variants={reduced ? {} : item}
            className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden flex-1"
            style={{ boxShadow: "4px 4px 0 0 #000" }}>
            <div className="px-4 py-3 border-b-[3px] border-black flex items-center justify-between bg-black text-white">
              <div className="flex items-center gap-2">
                <IconClockHour4 size={13} stroke={1.5} />
                <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Recent Events</span>
              </div>
              <Link href="/history" className="font-mono-noir text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-1">
                All <IconArrowRight size={10} />
              </Link>
            </div>
            <div className="divide-y-[2px] divide-black/10">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 gap-2">
                  <IconClockHour4 size={28} stroke={1} className="text-[#c0c0c0]" />
                  <p className="font-mono-noir text-xs text-[#848484]">No data yet</p>
                  <p className="font-mono-noir text-[10px] text-[#c0c0c0]">Predictions will appear here after you run them</p>
                  <Link href="/predict" className="font-mono-noir text-[10px] uppercase tracking-widest text-black hover:underline mt-1 border-b border-black">
                    Run first prediction →
                  </Link>
                </div>
              ) : (
                recent.map(e => (
                  <div key={e.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-[#f3f3f3] transition-colors">
                    <div>
                      <p className="font-mono-noir text-xs font-bold text-black capitalize">{e.input.event_cause.replace(/_/g, " ")}</p>
                      <p className="font-mono-noir text-[10px] text-[#848484] mt-0.5">{new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <SeverityBadge label={e.severity_label} size="sm" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Empty CTA */}
      {history.length === 0 && (
        <motion.div variants={reduced ? {} : item} className="text-center pt-2">
          <Link href="/predict" className="btn-brutal">
            RUN FIRST PREDICTION <IconArrowRight size={14} />
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}
