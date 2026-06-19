import type { Variants } from "framer-motion"

const expo = [0.16, 1, 0.3, 1] as [number, number, number, number]

export const pageContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: expo } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.28, ease: expo } },
}

export const gridContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

export const gridItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: expo } },
}
