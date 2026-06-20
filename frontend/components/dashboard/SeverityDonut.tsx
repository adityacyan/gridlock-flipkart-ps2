"use client"
import { motion, useReducedMotion } from "framer-motion"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { SEVERITY_COLORS } from "@/lib/severity"
import SeverityBadge from "@/components/shared/SeverityBadge"
import { IconChartPie } from "@tabler/icons-react"
import { fadeUp as item } from "@/lib/motion"

interface Props {
  counts: { name: string; value: number }[]
}

export default function SeverityDonut({ counts }: Props) {
  const reduced = useReducedMotion()
  const data = counts
    .map(d => ({ ...d, fill: SEVERITY_COLORS[d.name] ?? "#666" }))
    .filter(d => d.value > 0)

  if (data.length === 0) {
    return (
      <motion.div variants={reduced ? {} : item}
        className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden"
        style={{ boxShadow: "4px 4px 0 0 #000" }}>
        <div className="px-4 py-3 border-b-[3px] border-black bg-black text-white flex items-center gap-2">
          <IconChartPie size={13} stroke={1.5} />
          <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Severity Distribution</span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <IconChartPie size={28} stroke={1} className="text-black/20" />
          <p className="font-mono-noir text-xs text-[#848484]">No data yet</p>
          <p className="font-mono-noir text-[10px] text-[#c0c0c0]">Predictions will appear here after you run them</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={reduced ? {} : item}
      className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden"
      style={{ boxShadow: "4px 4px 0 0 #000" }}>
      <div className="px-4 py-3 border-b-[3px] border-black bg-black text-white flex items-center gap-2">
        <IconChartPie size={13} stroke={1.5} />
        <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Severity Distribution</span>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" paddingAngle={3}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} stroke="transparent" />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#f9f9f9", border: "2px solid #000", borderRadius: 0, fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              itemStyle={{ color: "#000000" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {data.map(d => (
            <div key={d.name} className="flex items-center justify-between py-1">
              <SeverityBadge label={d.name} size="sm" />
              <span className="font-mono-noir text-xs text-black tabular-nums font-bold">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
