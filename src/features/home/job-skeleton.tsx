import { Skeleton } from '~/components/ui/skeleton'

const JobSkeleton = () => {
  return (
    [...Array(3)].map((_, idx) => (
      <div
        key={idx}
        className="p-6 bg-white border border-blue-100 shadow-sm animate-pulse rounded-md space-y-4 mb-3"
      >
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/8" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="bg-blue-50 h-3 w-1/2" />
      </div>
    ))
  )
}

export default JobSkeleton