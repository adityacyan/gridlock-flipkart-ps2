export const SEVERITY_COLORS: Record<string, string> = {
  Low:      "#2ecc71",
  Medium:   "#f39c12",
  High:     "#e67e22",
  Critical: "#e74c3c",
}

export const SEVERITY_BG: Record<string, string> = {
  Low:      "bg-green-500",
  Medium:   "bg-yellow-500",
  High:     "bg-orange-500",
  Critical: "bg-red-500",
}

export const SEVERITY_TEXT: Record<string, string> = {
  Low:      "text-green-400",
  Medium:   "text-yellow-400",
  High:     "text-orange-400",
  Critical: "text-red-400",
}

export const SEVERITY_BORDER: Record<string, string> = {
  Low:      "border-green-500",
  Medium:   "border-yellow-500",
  High:     "border-orange-500",
  Critical: "border-red-500",
}

export const SEVERITY_EMOJI: Record<string, string> = {
  Low:      "🟢",
  Medium:   "🟡",
  High:     "🟠",
  Critical: "🔴",
}

export const EVENT_CAUSES = [
  { value: "public_event",        label: "Public Event (Rally / Festival)" },
  { value: "accident",            label: "Accident" },
  { value: "vehicle_breakdown",   label: "Vehicle Breakdown" },
  { value: "water_logging",       label: "Water Logging" },
  { value: "road_work",           label: "Road Work / Construction" },
  { value: "procession",          label: "Procession / March" },
  { value: "vip_movement",        label: "VIP Movement" },
  { value: "sports_event",        label: "Sports Event" },
  { value: "fire",                label: "Fire" },
  { value: "other",               label: "Other" },
]

export const EVENT_TYPES = [
  { value: "planned",   label: "Planned" },
  { value: "unplanned", label: "Unplanned" },
]

export const VEH_TYPES = [
  { value: "",        label: "Not applicable" },
  { value: "private", label: "Private Car" },
  { value: "bus",     label: "Bus" },
  { value: "heavy",   label: "Heavy / Truck / LCV" },
  { value: "auto",    label: "Auto Rickshaw" },
  { value: "other",   label: "Other" },
]
