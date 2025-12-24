import React from 'react'

export const JobsSkeleton = () => {
  return (
    [...Array(3)].map((_, i) => (
      <div
        key={i}
        className="p-6 bg-white shadow-md animate-pulse rounded-md space-y-4"
      >
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))
  )
}