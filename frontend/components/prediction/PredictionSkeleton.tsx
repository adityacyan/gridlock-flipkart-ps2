export default function PredictionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-36 bg-black/10 border-[3px] border-black/20" style={{ boxShadow: "4px 4px 0 0 rgba(0,0,0,0.1)" }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-52 bg-black/10 border-[3px] border-black/20" />
        <div className="h-52 bg-black/10 border-[3px] border-black/20" />
      </div>
      <div className="h-40 bg-black/10 border-[3px] border-black/20" />
    </div>
  )
}
