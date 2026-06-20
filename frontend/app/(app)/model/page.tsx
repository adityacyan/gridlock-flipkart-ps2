"use client"
import { useState } from "react"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  IconX,
  IconZoomIn,
  IconBrain,
  IconStack2,
  IconCategory,
  IconMapPin,
} from "@tabler/icons-react"
import { pageContainer as container, fadeUp as item, gridItem } from "@/lib/motion"

const CHARTS = [
  { file: "model_comparison.png",          title: "Model Comparison",            description: "Accuracy and F1-score across all base learners and the meta-learner ensemble. The stacked ensemble outperforms every individual model.",                       section: "Performance" },
  { file: "confusion_matrices.png",         title: "Confusion Matrices",          description: "Per-class prediction accuracy for all four severity levels (Low / Medium / High / Critical) on the held-out test set.",                                         section: "Performance" },
  { file: "lgbm_feature_importance.png",    title: "LightGBM Feature Importance", description: "Top features by split gain in the LightGBM base learner. Hour, location cluster, and corridor status dominate.",                                               section: "Performance" },
  { file: "mlp_learning_curve.png",         title: "MLP Learning Curve",          description: "Training vs. validation loss across epochs for the MLP base learner. Early stopping prevents overfitting.",                                                       section: "Performance" },
  { file: "target_distribution.png",        title: "Target Class Distribution",   description: "Distribution of severity labels in the training dataset. Class imbalance informed the use of balanced class weights.",                                            section: "Data" },
  { file: "distributions.png",              title: "Feature Distributions",       description: "Distribution of key numerical features — hour, duration, and location coordinates — across the full dataset.",                                                     section: "Data" },
  { file: "feature_target_correlation.png", title: "Feature–Target Correlation",  description: "Correlation between engineered features and the severity target. Rush-hour flags and corridor status show the strongest signal.",                                  section: "Data" },
  { file: "geo_clusters.png",               title: "Geo Clusters (KMeans k=20)",  description: "20 geographic clusters over Bengaluru derived from KMeans on incident coordinates. Cluster ID is fed as a feature to all models.",                               section: "Data" },
  { file: "temporal_overview.png",          title: "Temporal Overview",           description: "Incident frequency by hour of day and day of week. Morning and evening rush hours show clear peaks.",                                                              section: "Data" },
  { file: "missing_values.png",             title: "Missing Value Analysis",      description: "Heatmap of missing values across all raw features. Guided imputation strategy and optional field design.",                                                         section: "Data" },
]

const SECTIONS = ["Performance", "Data"]

const SUMMARY = [
  { label: "Ensemble Type",    value: "Stacked (4 models)",        icon: IconStack2 },
  { label: "Base Learners",    value: "LGBM · XGB · MLP · TabNet", icon: IconBrain },
  { label: "Severity Classes", value: "4  (Low → Critical)",        icon: IconCategory },
  { label: "Geo Clusters",     value: "20 (KMeans, Bengaluru)",     icon: IconMapPin },
]


export default function ModelPage() {
  const reduced = useReducedMotion()
  const [active, setActive] = useState("Performance")
  const [zoom, setZoom]     = useState<typeof CHARTS[number] | null>(null)

  const visible = CHARTS.filter(c => c.section === active)

  return (
    <motion.div
      variants={reduced ? {} : container}
      initial="hidden"
      animate="show"
      className="px-6 py-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={reduced ? {} : item}>
        <div className="flex items-center gap-3 mb-1">
          <span className="anim-dot w-2 h-2 bg-black inline-block shrink-0" />
          <h1 className="font-display text-2xl text-black tracking-tighter">MODEL PERFORMANCE</h1>
        </div>
        <p className="font-mono-noir text-xs text-[#5d5f5f] uppercase tracking-widest pl-5">
          Stacked ensemble — LightGBM + XGBoost + MLP + TabNet → meta-learner
        </p>
      </motion.div>

      {/* Summary strip */}
      <motion.div variants={reduced ? {} : item}
        className="grid grid-cols-2 lg:grid-cols-4 border-[3px] border-black divide-x-[3px] divide-black overflow-hidden"
        style={{ boxShadow: "6px 6px 0 0 #000" }}>
        {SUMMARY.map(({ label, value, icon: Icon }, i) => (
          <div key={label} className={`p-5 flex flex-col gap-3 ${i % 2 === 0 ? "bg-[#f9f9f9]" : "bg-[#f3f3f3]"}`}>
            <div className="flex items-center justify-between">
              <p className="font-mono-noir text-[10px] uppercase tracking-widest text-[#848484]">{label}</p>
              <Icon size={14} stroke={1.5} className="text-[#848484]" />
            </div>
            <p className="font-display text-sm text-black">{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Section tabs */}
      <motion.div variants={reduced ? {} : item} className="flex gap-0 border-[2px] border-black w-fit">
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`px-6 py-2 font-mono-noir text-[10px] font-bold uppercase tracking-widest transition-colors
              ${active === s
                ? "bg-black text-white"
                : "bg-[#f9f9f9] text-[#5d5f5f] hover:bg-[#f3f3f3] hover:text-black"}`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* Chart grid */}
      <motion.div
        key={active}
        variants={reduced ? {} : { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {visible.map(c => (
          <motion.div
            key={c.file}
            variants={reduced ? {} : gridItem}
            whileHover={reduced ? {} : { y: -4, transition: { duration: 0.15 } }}
            className="bg-[#f9f9f9] border-[3px] border-black overflow-hidden cursor-pointer group transition-shadow hover:shadow-[6px_6px_0_0_#000]"
            onClick={() => setZoom(c)}
          >
            <div className="px-4 py-3 border-b-[3px] border-black flex items-center justify-between bg-black text-white">
              <span className="font-mono-noir text-[10px] font-bold uppercase tracking-widest">{c.title}</span>
              <IconZoomIn size={13} stroke={1.5} className="text-white/60 group-hover:text-white transition-colors" />
            </div>
            <div className="relative w-full bg-[#f3f3f3]" style={{ aspectRatio: "16/9" }}>
              <Image src={`/model-charts/${c.file}`} alt={c.title} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div className="px-4 py-3 border-t-[2px] border-black/10">
              <p className="font-mono-noir text-[11px] text-[#5d5f5f] leading-relaxed">{c.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
            onClick={() => setZoom(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-5xl w-full bg-[#f9f9f9] border-[3px] border-black overflow-hidden"
              style={{ boxShadow: "8px 8px 0 0 #000" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-3 border-b-[3px] border-black bg-black text-white flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-sm text-white">{zoom.title}</p>
                  <p className="font-mono-noir text-[10px] text-white/60 mt-0.5">{zoom.description}</p>
                </div>
                <button onClick={() => setZoom(null)} className="text-white/60 hover:text-white transition-colors p-1 shrink-0">
                  <IconX size={16} stroke={1.5} />
                </button>
              </div>
              <div className="relative w-full bg-[#f3f3f3]" style={{ aspectRatio: "16/9" }}>
                <Image src={`/model-charts/${zoom.file}`} alt={zoom.title} fill className="object-contain p-4" sizes="100vw" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
