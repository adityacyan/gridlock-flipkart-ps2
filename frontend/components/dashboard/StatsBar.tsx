"use client"
import { motion, useReducedMotion } from "framer-motion"
import { fadeUp as item } from "@/lib/motion"

interface Stat {
  label: string
  value: string | number
  icon: React.ComponentType<{ size: number; stroke: number; className?: string }>
}

interface Props {
  stats: Stat[]
}

export default function StatsBar({ stats }: Props) {
  const reduced = useReducedMotion()

  return (
    <motion.div variants={reduced ? {} : item}
      className="grid grid-cols-2 lg:grid-cols-4 border-[3px] border-black divide-x-[3px] divide-black overflow-hidden"
      style={{ boxShadow: "6px 6px 0 0 #000" }}>
      {stats.map(({ label, value, icon: Icon }, i) => (
        <div key={label} className={`p-5 flex flex-col gap-3 ${i % 2 === 0 ? "bg-[#f9f9f9]" : "bg-[#f3f3f3]"}`}>
          <div className="flex items-center justify-between">
            <p className="font-mono-noir text-[10px] uppercase tracking-widest text-[#848484]">{label}</p>
            <Icon size={14} stroke={1.5} className="text-[#848484]" />
          </div>
          <p className="font-display text-3xl text-black tabular-nums">{value}</p>
        </div>
      ))}
    </motion.div>
  )
}
