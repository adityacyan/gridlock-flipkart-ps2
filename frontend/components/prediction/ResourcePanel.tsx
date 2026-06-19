import { Recommendations } from "@/types"
import { Users, Navigation, Clock, AlertTriangle, Zap, Shield } from "lucide-react"

const Row = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex items-start justify-between py-2.5 border-b-[2px] border-black/10 last:border-0">
    <div className="flex items-center gap-2 text-[#5d5f5f]">
      <Icon size={12} strokeWidth={1.5} />
      <span className="font-mono-noir text-[10px] uppercase tracking-wider">{label}</span>
    </div>
    <span className="font-mono-noir text-xs text-black font-bold text-right max-w-[55%]">{value}</span>
  </div>
)

export default function ResourcePanel({ rec }: { rec: Recommendations }) {
  return (
    <div className="bg-[#f9f9f9] border-[3px] border-black anim-in" style={{ boxShadow: "4px 4px 0 0 #000" }}>
      <div className="px-4 py-3 border-b-[3px] border-black bg-black text-white">
        <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Deployment Recommendations</span>
      </div>
      <div className="px-4 pt-1 pb-2">
        <Row icon={Users}      label="Manpower"    value={`${rec.manpower_min}–${rec.manpower_max} officers`} />
        <Row icon={Clock}      label="Est. Delay"  value={`~${rec.impact_minutes} min`} />
        <Row icon={Shield}     label="Barricading" value={rec.barricading} />
        <Row icon={Navigation} label="Diversion"   value={rec.diversion} />
      </div>

      {(rec.pre_deploy || rec.peak_note || rec.special_action) && (
        <div className="border-t-[2px] border-black/10 px-4 py-3 space-y-2 bg-[#f3f3f3]">
          {rec.pre_deploy && (
            <div className="flex gap-2.5 items-start">
              <Zap size={11} className="text-[#3b82f6] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="font-mono-noir text-[11px] text-[#5d5f5f] leading-relaxed">{rec.pre_deploy}</p>
            </div>
          )}
          {rec.peak_note && (
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={11} className="text-[#d97706] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="font-mono-noir text-[11px] text-[#5d5f5f] leading-relaxed">{rec.peak_note}</p>
            </div>
          )}
          {rec.special_action && (
            <div className="flex gap-2.5 items-start">
              <AlertTriangle size={11} className="text-[#dc2626] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="font-mono-noir text-[11px] text-[#5d5f5f] leading-relaxed">{rec.special_action}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
