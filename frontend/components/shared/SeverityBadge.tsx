const BADGE: Record<string, { bg: string; text: string; border: string }> = {
  Low:      { bg: "#dcfce7", text: "#14532d", border: "#4ade80" },
  Medium:   { bg: "#fefce8", text: "#713f12", border: "#facc15" },
  High:     { bg: "#fff7ed", text: "#7c2d12", border: "#fb923c" },
  Critical: { bg: "#fef2f2", text: "#7f1d1d", border: "#f87171" },
}

const DOT: Record<string, string> = {
  Low:      "#4ade80",
  Medium:   "#facc15",
  High:     "#fb923c",
  Critical: "#f87171",
}

interface Props {
  label: string
  size?: "sm" | "md" | "lg"
}

export default function SeverityBadge({ label, size = "md" }: Props) {
  const badge = BADGE[label]
  const dotSize  = size === "lg" ? "w-2 h-2"   : "w-1.5 h-1.5"
  const textSize = size === "sm" ? "text-[10px]" : size === "lg" ? "text-xs" : "text-[11px]"
  const px = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1"

  if (!badge) {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono-noir font-bold uppercase tracking-wider ${textSize} text-[#848484]`}>
        <span className={`${dotSize} shrink-0 bg-[#848484]`} />
        {label}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono-noir font-bold uppercase tracking-wider ${textSize} ${px} border-2`}
      style={{
        background: badge.bg,
        color: badge.text,
        borderColor: badge.border,
      }}
    >
      <span
        className={`${dotSize} shrink-0`}
        style={{ background: DOT[label] }}
      />
      {label}
    </span>
  )
}
