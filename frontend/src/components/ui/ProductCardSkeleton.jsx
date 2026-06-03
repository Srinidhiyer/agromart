export default function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex gap-1">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="skeleton w-3.5 h-3.5 rounded" />
          ))}
        </div>
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-3 w-28 rounded" />
      </div>
    </div>
  )
}
