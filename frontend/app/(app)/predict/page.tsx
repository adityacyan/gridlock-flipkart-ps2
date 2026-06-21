"use client"
import { useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import dynamic from "next/dynamic"
import EventForm from "@/components/prediction/EventForm"
import SeverityCard from "@/components/prediction/SeverityCard"
import PredictionSkeleton from "@/components/prediction/PredictionSkeleton"
import ResourcePanel from "@/components/prediction/ResourcePanel"
import DemoScenarios from "@/components/prediction/DemoScenarios"
import { PredictRequest, PredictResponse } from "@/types"
import { predictEvent } from "@/lib/api"
import { saveEntry } from "@/lib/history"
import { IconScanEye, IconAlertCircle, IconMapPin } from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item } from "@/lib/motion"

const BengaluruMap = dynamic(() => import("@/components/map/BengaluruMap"), { ssr: false })


export default function PredictPage() {
  const reduced = useReducedMotion()
  const [loading, setLoading]               = useState(false)
  const [result, setResult]                 = useState<PredictResponse | null>(null)
  const [error, setError]                   = useState<string | null>(null)
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [lastReq, setLastReq]               = useState<PredictRequest | null>(null)
  const [demoPreset, setDemoPreset]         = useState<PredictRequest | null>(null)

  const handleSubmit = async (req: PredictRequest) => {
    setLoading(true); setError(null); setLastReq(req)
    try {
      const res = await predictEvent(req)
      setResult(res); saveEntry(req, res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLoad = (preset: PredictRequest) => {
    setDemoPreset(preset)
    setPickedLocation({ lat: preset.latitude, lng: preset.longitude })
    setResult(null); setError(null)
  }

  return (
    <motion.div
      variants={reduced ? {} : container}
      initial="hidden"
      animate="show"
      className="px-6 py-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={reduced ? {} : item} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="anim-dot w-2 h-2 bg-black inline-block shrink-0" />
          <h1 className="font-display text-2xl text-black tracking-tighter">PREDICT CONGESTION</h1>
        </div>
        <p className="font-mono-noir text-xs text-[#5d5f5f] uppercase tracking-widest pl-5">Fill in event details or load a demo scenario</p>
      </motion.div>

      {/* 3-column grid: form left (2), map+results right (3) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT — Demo Scenarios + Event Form */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div variants={reduced ? {} : item}>
            <DemoScenarios onLoad={handleDemoLoad} />
          </motion.div>

          <motion.div variants={reduced ? {} : item}
            className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden"
            style={{ boxShadow: "4px 4px 0 0 #000" }}>
            <EventForm
              onSubmit={handleSubmit}
              loading={loading}
              pickedLocation={pickedLocation}
              externalPreset={demoPreset}
            />
          </motion.div>
        </div>

        {/* RIGHT — Map (always visible) + Results stacked below */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Map — always pinned at top of right column */}
          <motion.div variants={reduced ? {} : item}
            className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden"
            style={{ boxShadow: "4px 4px 0 0 #000" }}>
            <div className="px-4 py-3 border-b-[3px] border-black bg-black text-white flex items-center gap-2">
              <IconMapPin size={13} stroke={1.5} />
              <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Click map to pin coordinates</span>
            </div>
            <div className="p-2">
              <BengaluruMap
                onMapClick={(lat, lng) => setPickedLocation({ lat, lng })}
                pickedLocation={pickedLocation}
                entries={[]}
                height="260px"
              />
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#fef2f2] border-[3px] border-[#f87171] px-4 py-3 flex items-start gap-2"
            >
              <IconAlertCircle size={14} stroke={1.5} className="text-[#7f1d1d] mt-0.5 shrink-0" />
              <p className="font-mono-noir text-xs text-[#7f1d1d]">{error}</p>
            </motion.div>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <motion.div variants={reduced ? {} : item}
              className="bg-[#f9f9f9] border-[3px] border-black flex flex-col items-center justify-center px-6 py-12 gap-3 text-center"
              style={{ boxShadow: "4px 4px 0 0 #000" }}>
              <IconScanEye size={36} stroke={1} className="text-black/20" />
              <p className="font-mono-noir text-sm font-bold text-black uppercase tracking-widest">No prediction yet</p>
              <p className="font-mono-noir text-xs text-[#848484]">
                Load a demo scenario or configure the event, then click{" "}
                <span className="text-black font-bold">Run Prediction</span>
              </p>
            </motion.div>
          )}

          {/* Loading skeleton */}
          {loading && <PredictionSkeleton />}

          {/* Results */}
          {result && !loading && (
            <motion.div
              variants={reduced ? {} : { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              <motion.div variants={reduced ? {} : item}><SeverityCard result={result} /></motion.div>

              <motion.div variants={reduced ? {} : item}
                className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden"
                style={{ boxShadow: "4px 4px 0 0 #000" }}>
                <div className="px-4 py-3 border-b-[3px] border-black bg-black text-white">
                  <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">Event Summary</span>
                </div>
                {lastReq && (
                  <div className="px-4 py-1 divide-y-[2px] divide-black/10">
                    {[
                      { k: "Cause",   v: lastReq.event_cause.replace(/_/g, " ") },
                      { k: "Type",    v: lastReq.event_type },
                      { k: "Time",    v: `${String(lastReq.start_hour).padStart(2, "0")}:00` },
                      { k: "Cluster", v: `Zone ${result.location_cluster}` },
                      ...(lastReq.corridor ? [{ k: "Corridor", v: lastReq.corridor }] : []),
                      ...(lastReq.zone     ? [{ k: "Zone",     v: lastReq.zone }]     : []),
                    ].map(({ k, v }) => (
                      <div key={k} className="flex justify-between items-center py-2.5">
                        <span className="font-mono-noir text-[10px] uppercase tracking-widest text-[#848484]">{k}</span>
                        <span className="font-mono-noir text-xs text-black font-bold capitalize">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div variants={reduced ? {} : item}><ResourcePanel rec={result.recommendations} /></motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
