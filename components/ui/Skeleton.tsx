// Shimmering skeleton loaders for luxurious perceived performance.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-white/[0.04] ${className}`}>
      <div className="skeleton-shine absolute inset-0 -translate-x-full animate-[skeleton-slide_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card-luxury">
      <Skeleton className="aspect-[4/5] rounded-b-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  );
}
