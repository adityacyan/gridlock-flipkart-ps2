"use client"
import { PredictResponse } from "@/types"

const SEV_COLOR: Record<string, string> = {
  Low:      "#4ade80",
  Medium:   "#facc15",
  High:     "#fb923c",
  Critical: "#f87171",
}

const SEV_BG: Record<string, string> = {
  Low:      "#dcfce7",
  Medium:   "#fefce8",
  High:     "#fff7ed",
  Critical: "#fef2f2",
}

const SEV_TEXT: Record<string, string> = {
  Low:      "#14532d",
  Medium:   "#713f12",
  High:     "#7c2d12",
  Critical: "#7f1d1d",
}

export default function SeverityCard({ result }: { result: PredictResponse }) {
  const { severity_label, severity_level, recommendations } = result

  const accentColor  = SEV_COLOR[severity_label]  ?? "#848484"
  const accentBg     = SEV_BG[severity_label]     ?? "#f3f3f3"
  const accentText   = SEV_TEXT[severity_label]   ?? "#000"

  return (
    <div className="bg-[#f9f9f9] border-[3px] border-black anim-in" style={{ boxShadow: "6px 6px 0 0 #000" }}>
      {/* Header — inverted with severity color accent */}
      <div className="px-5 py-4 flex items-start justify-between border-b-[3px] border-black"
        style={{ background: accentBg, borderLeftWidth: 6, borderLeftColor: accentColor }}>
        <div>
          <p className="font-mono-noir text-[10px] uppercase tracking-widest text-[#848484] mb-2">Congestion Severity</p>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl" style={{ color: accentText }}>
              {severity_label.toUpperCase()}
            </span>
            <span className="font-mono-noir text-xs text-[#848484]">Level {severity_level} / 3</span>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3">
        <div className="bg-[#f3f3f3] border-[2px] border-black px-4 py-3">
          <p className="font-mono-noir text-[10px] uppercase tracking-widest text-[#848484] mb-1">Officers</p>
          <p className="font-display text-2xl text-black tabular-nums">
            {recommendations.manpower_min}–{recommendations.manpower_max}
          </p>
        </div>
        <div className="bg-[#f3f3f3] border-[2px] border-black px-4 py-3">
          <p className="font-mono-noir text-[10px] uppercase tracking-widest text-[#848484] mb-1">Est. Delay</p>
          <p className="font-display text-2xl text-black tabular-nums">
            ~{recommendations.impact_minutes}<span className="font-mono-noir text-sm ml-1">min</span>
          </p>
        </div>
      </div>
    </div>
  )
}
