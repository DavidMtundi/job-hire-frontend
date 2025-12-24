import { EnvSsr } from './env-ssr'
import { EnvCsr } from './env-csr'

export default function ServerPage() {
  return (
    <div className='p-4 space-y-4'>
      <div className='space-y-4 max-w-2xl mx-auto'>
        <h1 className='text-2xl font-bold text-gray-900'>Testing Environment Variables</h1>
        <EnvSsr />
        <EnvCsr />
      </div>
    </div>
  )
}
