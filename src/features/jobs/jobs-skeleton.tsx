import { Skeleton } from '~/components/ui/skeleton'

export const JobsSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-4 bg-primary/10 w-[150px] mb-4"></Skeleton>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="px-6 py-8 bg-white border border-primary/20 shadow-md animate-pulse rounded-lg space-y-4 mb-4"
        >
          <Skeleton className="h-4 bg-slate-300 rounded w-1/3"></Skeleton>
          <Skeleton className="h-3 bg-slate-200 rounded w-1/5"></Skeleton>
          <Skeleton className="h-3 bg-slate-200 rounded w-2/5"></Skeleton>
          <Skeleton className="h-6 bg-slate-100 rounded w-4/5"></Skeleton>
        </div>
      ))}
    </div>
  )
}