'use client';

export const EnvCsr = () => {
  return (
    <div className='bg-gray-50 border rounded-md p-4 mt-4'>
      <p className='font-bold text-gray-900'>Environment Variables (CSR)</p>
      <div className='text-gray-900'>
        <p><span className='font-medium text-sm'>APP URL (Public):</span> <code>{process.env.NEXT_PUBLIC_APP_URL}</code></p>
        <p><span className='font-medium text-sm'>Nextauth URL:</span> <code>{process.env.AUTH_URL}</code></p>
        <p><span className='font-medium text-sm'>Nextauth Secret:</span> <code>{process.env.AUTH_SECRET}</code></p>
      </div>
    </div>
  )
}