import Navbar from "@/components/shared/Navbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-app className="min-h-screen bg-[#f9f9f9] text-black">
      <Navbar />
      <main className="min-h-[calc(100vh-52px)]">{children}</main>
    </div>
  )
}
