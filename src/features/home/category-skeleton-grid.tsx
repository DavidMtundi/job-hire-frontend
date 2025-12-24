import { Skeleton } from '~/components/ui/skeleton'

export const CategorySkeletonGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, idx) => (
        <div
          key={idx}
          className="p-6 bg-white border border-blue-100 shadow-sm animate-pulse rounded-md space-y-4 mb-3"
        >
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-3 w-1/8" />
        </div>
      ))}
    </div>
  )
}