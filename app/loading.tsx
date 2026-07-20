import { GridSkeleton } from "@/components/ui/Skeleton";

// Global route-loading fallback (Suspense) — luxury shimmer skeletons.
export default function Loading() {
  return (
    <div className="min-h-screen bg-ink px-5 pb-24 pt-28 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-10 w-52 animate-pulse rounded-xl bg-white/[0.05]" />
        <GridSkeleton count={8} />
      </div>
    </div>
  );
}
