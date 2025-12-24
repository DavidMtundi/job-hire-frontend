import React from 'react'
import { Skeleton } from '~/components/ui/skeleton'

export const JobDetailsSkeleton = () => {
  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center gap-3'>
        <div className='space-y-3'>
          <Skeleton className="h-6 w-[300px]" />
          <Skeleton className="h-4 w-[450px]" />
        </div>
        <div className='flex items-center space-x-3'>
          <Skeleton className="h-9 w-[130px]" />
          <Skeleton className="h-9 w-[130px]" />
        </div>
      </div>
      <div className='space-y-4'>
        <div className='flex gap-4'>
          <Skeleton className="h-56 w-3/3" />
          <Skeleton className="h-56 w-1/3" />
        </div>
        <div className='flex gap-4'>
          <Skeleton className="h-36 w-1/2" />
          <Skeleton className="h-36 w-1/2" />
        </div>
      </div>
    </div>
  )
}