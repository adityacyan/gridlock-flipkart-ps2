"use client"
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { SEVERITY_COLORS } from "@/lib/severity"

export default function ProbabilityChart({ probs }: { probs: Record<string, number> }) {
  const data = Object.entries(probs).map(([name, value]) => ({
    name,
    value: parseFloat((value * 100).toFixed(1)),
    fill: SEVERITY_COLORS[name] ?? "#848484",
  }))

  return (
    <div className="bg-[#f9f9f9] border-[3px] border-black anim-in" style={{ boxShadow: "4px 4px 0 0 #000" }}>
      <div className="px-4 py-3 border-b-[3px] border-black bg-black text-white">
        <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Class Probabilities</span>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 10, right: 4, left: -22, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#848484", fontSize: 10, fontFamily: "JetBrains Mono" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: "#848484", fontSize: 9, fontFamily: "JetBrains Mono" }}
              axisLine={false} tickLine={false}
              domain={[0, 100]} unit="%"
            />
            <Tooltip
              contentStyle={{ background: "#f9f9f9", border: "2px solid #000", borderRadius: 0, fontSize: 11, fontFamily: "JetBrains Mono" }}
              labelStyle={{ color: "#000000", fontWeight: "bold" }}
              itemStyle={{ color: "#5d5f5f" }}
              formatter={(v: any) => [`${v}%`, "Probability"]}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />
            <Bar dataKey="value" radius={[0, 0, 0, 0]} maxBarSize={36}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
