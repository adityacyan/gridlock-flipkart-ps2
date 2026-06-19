import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import "leaflet/dist/leaflet.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700", "800"],
})

export const metadata: Metadata = {
  title: "TRAFFIC.NOIR — Bengaluru Traffic Intelligence",
  description: "Tactical traffic forecasting for Bengaluru. Stacked ensemble ML, real-time congestion prediction, resource deployment.",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${jetbrainsMono.variable} font-mono-noir bg-[#f9f9f9] text-[#000000] min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
