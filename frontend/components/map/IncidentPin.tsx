import L from "leaflet"
import { SEVERITY_COLORS } from "@/lib/severity"

export function incidentIcon(label: string) {
  const color = SEVERITY_COLORS[label] ?? "#888"
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 0 6px ${color}88;"></div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}
