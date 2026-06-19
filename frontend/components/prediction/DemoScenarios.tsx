import { PredictRequest } from "@/types"
import { Zap } from "lucide-react"

interface Demo {
  label: string
  tag: string
  tagColor: string
  tagBg: string
  tagBorder: string
  description: string
  preset: PredictRequest
}

const DEMOS: Demo[] = [
  {
    label: "VIP Rally near MG Road",
    tag: "Critical",
    tagColor: "#7f1d1d",
    tagBg: "#fef2f2",
    tagBorder: "#f87171",
    description: "Political rally, 6 PM Saturday, MG Road corridor",
    preset: {
      latitude: 12.9788,
      longitude: 77.5996,
      event_type: "planned",
      event_cause: "public_event",
      start_hour: 18,
      day_of_week: 5,
      month: 6,
      day: 20,
      corridor: "MG Road",
      zone: "CBD 1",
      police_station: "Cubbon Park",
      duration_mins: 240,
      veh_type: undefined,
    },
  },
  {
    label: "Cargo Truck Stall on Hosur Road",
    tag: "High",
    tagColor: "#7c2d12",
    tagBg: "#fff7ed",
    tagBorder: "#fb923c",
    description: "Stalled heavy vehicle, 8 AM Tuesday, near BTM Layout",
    preset: {
      latitude: 12.9165,
      longitude: 77.6244,
      event_type: "unplanned",
      event_cause: "vehicle_breakdown",
      start_hour: 8,
      day_of_week: 1,
      month: 8,
      day: 18,
      corridor: "Hosur Rd",
      zone: "South",
      police_station: "BTM Layout",
      duration_mins: 120,
      veh_type: "heavy",
    },
  },
  {
    label: "Procession on Old Airport Road",
    tag: "Medium",
    tagColor: "#713f12",
    tagBg: "#fefce8",
    tagBorder: "#facc15",
    description: "Religious procession, 2 PM Sunday",
    preset: {
      latitude: 12.9612,
      longitude: 77.6473,
      event_type: "planned",
      event_cause: "procession",
      start_hour: 14,
      day_of_week: 6,
      month: 6,
      day: 22,
      corridor: "Old Airport Rd",
      zone: "East",
      police_station: "Indiranagar",
      duration_mins: 120,
      veh_type: undefined,
    },
  },
  {
    label: "Hebbal Flyover Maintenance",
    tag: "Low",
    tagColor: "#14532d",
    tagBg: "#dcfce7",
    tagBorder: "#4ade80",
    description: "Scheduled off-peak road repair, 1 AM Thursday",
    preset: {
      latitude: 13.0358,
      longitude: 77.5970,
      event_type: "planned",
      event_cause: "road_work",
      start_hour: 1,
      day_of_week: 3,
      month: 9,
      day: 10,
      corridor: "Bellary Rd",
      zone: "North",
      police_station: "Hebbal",
      duration_mins: 180,
      veh_type: undefined,
    },
  },
]

interface Props {
  onLoad: (preset: PredictRequest) => void
}

export default function DemoScenarios({ onLoad }: Props) {
  return (
    <div className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden" style={{ boxShadow: "4px 4px 0 0 #000" }}>
      <div className="px-4 py-3 border-b-[3px] border-black bg-black text-white flex items-center gap-2">
        <Zap size={12} className="text-white/70" strokeWidth={1.5} />
        <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Demo Scenarios</span>
        <span className="font-mono-noir text-[10px] text-white/40 ml-1">— click to load</span>
      </div>
      <div className="divide-y-[2px] divide-black/10">
        {DEMOS.map(d => (
          <button
            key={d.label}
            onClick={() => onLoad(d.preset)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f3f3f3] transition-colors text-left group"
          >
            <div>
              <p className="font-mono-noir text-xs font-bold text-black group-hover:underline transition-all">{d.label}</p>
              <p className="font-mono-noir text-[10px] text-[#848484] mt-0.5">{d.description}</p>
            </div>
            <span
              className="font-mono-noir text-[10px] font-bold uppercase tracking-wider shrink-0 ml-3 px-2 py-0.5 border-[2px]"
              style={{ color: d.tagColor, background: d.tagBg, borderColor: d.tagBorder }}>
              {d.tag}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
