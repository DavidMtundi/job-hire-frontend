import React from 'react'

export const AdminHeading = ({ title, description }: { title: string, description: string }) => {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-bold text-gray-700">{title}</h1>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  )
}