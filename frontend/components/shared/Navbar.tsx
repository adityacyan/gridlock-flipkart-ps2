"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconScanEye,
  IconHistory,
  IconChartBar,
} from "@tabler/icons-react"

const links = [
  { href: "/dashboard", label: "DASHBOARD", icon: IconLayoutDashboard },
  { href: "/predict",   label: "PREDICT",   icon: IconScanEye },
  { href: "/history",   label: "HISTORY",   icon: IconHistory },
  { href: "/model",     label: "MODEL",     icon: IconChartBar },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <>
      {/* Desktop header — TRAFFIC.NOIR brutalist */}
      <header className="border-b-[3px] border-black bg-[#f9f9f9] h-[52px] flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="anim-dot w-2 h-2 bg-black inline-block" />
              <span className="font-display text-base tracking-tighter text-black">TRAFFIC.NOIR</span>
            </div>
            <span className="hidden md:block text-[10px] font-mono-noir text-[#848484] uppercase tracking-[0.15em] border-l-2 border-black/20 pl-3">
              Bengaluru Traffic Intelligence
            </span>
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden md:flex items-center">
            {links.map(({ href, label, icon: Icon }) => {
              const active = path === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-4 py-[14px] text-[11px] font-mono-noir font-bold tracking-widest uppercase transition-colors
                    ${active
                      ? "text-black border-b-[3px] border-black"
                      : "text-[#5d5f5f] hover:text-black border-b-[3px] border-transparent"}`}
                >
                  <Icon size={13} stroke={active ? 2 : 1.5} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f9f9f9] border-t-[3px] border-black flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors
                ${active ? "text-black bg-black/5" : "text-[#848484] hover:text-black"}`}
            >
              <Icon size={20} stroke={active ? 2 : 1.5} />
              <span className="text-[9px] font-mono-noir font-bold uppercase tracking-widest">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile spacer */}
      <div className="md:hidden h-[60px]" aria-hidden />
    </>
  )
}
