"use client"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import SmoothScroll from "@/components/providers/SmoothScroll"
import { Brain, GitBranch, Map, Zap, Shield, TrendingUp, ArrowRight } from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d, ease: [0.22, 1, 0.36, 1] as const } }),
}

const STATS = [
  { value: "99.4%", label: "Prediction Accuracy" },
  { value: "4",     label: "Base ML Models" },
  { value: "20",    label: "Geo Clusters" },
  { value: "<120ms",label: "Inference Latency" },
]

const FEATURES = [
  { icon: Brain,      title: "Stacked Ensemble",       body: "LightGBM, XGBoost, MLP, and TabNet feed into a meta-learner — the same architecture used in top-tier production forecasting systems." },
  { icon: Map,        title: "KMeans Geo-Clustering",  body: "20 Bengaluru-specific clusters learned from real GPS corridors, police station zones, and arterial road data." },
  { icon: Zap,        title: "Sub-Second Prediction",  body: "Python FastAPI sidecar serving pre-trained .pkl models. Four severity classes with per-class probability output." },
  { icon: Shield,     title: "Resource Recommendations", body: "Every prediction includes actionable deployment advice: police posts, diversion routes, peak-hour advisories." },
  { icon: GitBranch,  title: "Event-Aware Features",   body: "Encodes event type, cause, time-of-day, day-of-week, corridor flags, and vehicle mix — 17 engineered features total." },
  { icon: TrendingUp, title: "Live History Tracking",  body: "All predictions persist in-browser. Reviewable as a time-series table with severity distribution at a glance." },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const progressScale = useTransform(scrollY, [0, 4000], [0, 1])

  return (
    <SmoothScroll>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-50 origin-left bg-black"
        style={{ scaleX: progressScale }}
      />

      {/* Top Nav — TRAFFIC.NOIR brutalist style */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-8 border-b-[3px] border-black bg-[#f9f9f9]"
      >
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="#" className="font-display text-xl tracking-tighter text-black">
              TRAFFIC.NOIR
            </a>
            {/* Desktop nav */}
            <nav className="hidden md:flex gap-1 items-center">
              {["DASHBOARD", "PREDICT", "HISTORY", "MODEL"].map((label, i) => {
                const hrefs = ["/dashboard", "/predict", "/history", "/model"]
                return (
                  <Link
                    key={label}
                    href={hrefs[i]}
                    className="px-3 py-1 text-[11px] font-mono-noir font-bold tracking-widest uppercase text-[#5d5f5f] hover:text-black hover:bg-black/5 transition-colors"
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <Link href="/predict" className="btn-brutal !text-sm !px-4 !py-2">
            ENTER SYSTEM
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-8 pt-14">
        {/* Decorative corner brackets */}
        <div className="absolute top-16 left-8 w-24 h-24 border-l-[6px] border-t-[6px] border-black opacity-15 hidden md:block" />
        <div className="absolute top-16 right-8 w-24 h-24 border-r-[6px] border-t-[6px] border-black opacity-15 hidden md:block" />
        <div className="absolute bottom-8 left-8 w-24 h-24 border-l-[6px] border-b-[6px] border-black opacity-15 hidden md:block" />
        <div className="absolute bottom-8 right-8 w-24 h-24 border-r-[6px] border-b-[6px] border-black opacity-15 hidden md:block" />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-8">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-transparent text-[11px] font-mono-noir font-bold uppercase tracking-[0.2em] text-black">
            <span className="anim-dot w-1.5 h-1.5 bg-black inline-block" />
            Bengaluru Traffic Intelligence
          </motion.div>

          <motion.h1 custom={0.08} variants={fadeUp} initial="hidden" animate="show"
            className="font-display text-[clamp(3rem,10vw,7rem)] text-black leading-[0.9] tracking-tighter">
            PREDICT THE
            <br />
            <span className="relative">
              CHAOS.
              {/* Underline accent */}
              <span className="absolute bottom-0 left-0 right-0 h-[6px] bg-black translate-y-2" />
            </span>
          </motion.h1>

          <motion.p custom={0.16} variants={fadeUp} initial="hidden" animate="show"
            className="font-mono-noir text-[clamp(0.9rem,1.5vw,1.05rem)] text-[#5d5f5f] max-w-2xl border-l-4 border-black pl-4 text-left mx-auto leading-relaxed">
            Tactical traffic forecasting for Bengaluru using a stacked ensemble of LightGBM, XGBoost, MLP, and TabNet.
            Event input to severity prediction in under 120ms.
          </motion.p>

          <motion.div custom={0.24} variants={fadeUp} initial="hidden" animate="show"
            className="flex items-center justify-center gap-6 flex-wrap">
            <Link href="/predict" className="btn-brutal !text-base !px-8 !py-3">
              RUN A PREDICTION <ArrowRight size={16} className="ml-1" />
            </Link>
            <Link href="/dashboard" className="btn-brutal-ghost !text-base !px-8 !py-3">
              VIEW DASHBOARD
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats — brutalist grid */}
      <section className="border-y-[3px] border-black">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x-[3px] divide-black">
          {STATS.map(({ value, label }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="px-8 py-10 flex flex-col gap-2 bg-[#f9f9f9] even:bg-[#f3f3f3]">
              <span className="font-display text-[clamp(2rem,5vw,3.5rem)] text-black">{value}</span>
              <span className="eyebrow">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }} className="mb-14">
            <p className="eyebrow mb-3">System Capabilities</p>
            <div className="section-rule">
              <h2 className="text-[clamp(1.8rem,4vw,3rem)]">BUILT FOR REAL-WORLD TRAFFIC</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="card-brutal p-6 flex flex-col gap-4 relative overflow-hidden group">
                {/* Background icon */}
                <div className="absolute top-2 right-2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                  <Icon size={80} />
                </div>
                <div className="flex items-center gap-2 pb-2 border-b-[2px] border-black">
                  <Icon size={16} className="shrink-0" />
                  <h3 className="font-display text-sm text-black">{title}</h3>
                </div>
                <p className="font-mono-noir text-xs text-[#5d5f5f] leading-relaxed relative z-10">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-8 border-t-[3px] border-black bg-[#f3f3f3]">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5 }} className="mb-14">
            <p className="eyebrow mb-3">Pipeline</p>
            <div className="section-rule">
              <h2 className="text-[clamp(1.8rem,4vw,3rem)]">INPUT TO INSIGHT</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black">
            {[
              { n: "01", title: "DESCRIBE THE EVENT", body: "Location, type, cause, time, corridor, police zone, vehicle mix — 17 features total." },
              { n: "02", title: "ENSEMBLE INFERENCE", body: "4 base models score independently. Meta-learner blends outputs into a calibrated severity class + probability distribution." },
              { n: "03", title: "ACT ON THE OUTPUT", body: "Severity badge, per-class probabilities, and specific resource deployment recommendations — ready to share." },
            ].map(({ n, title, body }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-[#f3f3f3] px-8 py-10 flex flex-col gap-4">
                <span className="font-display text-[3.5rem] text-black/20 leading-none">{n}</span>
                <h3 className="font-display text-base text-black border-b-[2px] border-black pb-2">{title}</h3>
                <p className="font-mono-noir text-xs text-[#5d5f5f] leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 border-t-[3px] border-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-brutal-inv px-12 py-16 relative overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-white/20" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-white/20" />

            <div className="relative z-10 text-center flex flex-col items-center gap-6">
              <p className="eyebrow !text-[#848484]">Try it now</p>
              <h2 className="font-display text-[clamp(1.6rem,4vw,3rem)] text-white">
                SEE IT PREDICT A REAL SCENARIO
              </h2>
              <p className="font-mono-noir text-sm text-[#848484] max-w-md leading-relaxed">
                Load one of four demo presets — VIP rally near MG Road, Hosur Road truck stall, procession,
                or Hebbal flyover maintenance — and get a severity prediction instantly.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/predict" className="btn-brutal-ghost !text-base !px-8 !py-3">
                  RUN A PREDICTION <ArrowRight size={15} className="ml-1" />
                </Link>
                <Link href="/model"
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white/30 text-white/60 hover:border-white/60 hover:text-white transition-colors font-mono-noir text-sm uppercase tracking-widest">
                  VIEW MODEL METRICS
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[3px] border-black py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-sm text-black">
            © 2024 TRAFFIC.NOIR — TACTICAL DATA SYSTEMS
          </div>
          <nav className="flex flex-wrap justify-center gap-6 items-center">
            <span className="eyebrow text-[#848484]">FOR HACKATHON</span>
            <a href="#"
              className="eyebrow hover:text-black hover:underline transition-all duration-200">
              API_DOCS
            </a>
            <a href="https://github.com/adityacyan/gridlock-flipkart-ps2/blob/master/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow hover:text-black hover:underline transition-all duration-200">
              GITHUB
            </a>
          </nav>
          <span className="eyebrow">FLIPKART GRID 7.0</span>
        </div>
      </footer>
    </SmoothScroll>
  )
}
