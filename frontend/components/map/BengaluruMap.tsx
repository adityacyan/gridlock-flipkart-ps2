"use client"
import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { HistoryEntry } from "@/types"
import { incidentIcon } from "@/components/map/IncidentPin"

// Fix default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick?.(e.latlng.lat, e.latlng.lng) }
  })
  return null
}

interface Props {
  entries?: HistoryEntry[]
  onMapClick?: (lat: number, lng: number) => void
  pickedLocation?: { lat: number; lng: number } | null
  height?: string
}

export default function BengaluruMap({ entries = [], onMapClick, pickedLocation, height = "400px" }: Props) {
  return (
    <div style={{ height }} className="overflow-hidden border-[2px] border-black">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        style={{ height: "100%", width: "100%", background: "#f3f3f3" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <ClickHandler onMapClick={onMapClick} />

        {pickedLocation && (
          <Marker position={[pickedLocation.lat, pickedLocation.lng]}>
            <Popup>📍 Selected location<br />{pickedLocation.lat.toFixed(4)}, {pickedLocation.lng.toFixed(4)}</Popup>
          </Marker>
        )}

        {entries.map(e => (
          <Marker
            key={e.id}
            position={[e.input.latitude, e.input.longitude]}
            icon={incidentIcon(e.severity_label)}
          >
            <Popup>
              <div className="text-sm">
                <strong>{e.severity_label}</strong> — {e.input.event_cause.replace(/_/g, " ")}<br />
                {new Date(e.timestamp).toLocaleString()}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
