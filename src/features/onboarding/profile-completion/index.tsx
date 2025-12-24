import { Container } from '~/components/container'
import { CreateCandidateForm } from './create-candidate-form'

export default function ProfileCompletionScreen() {
  return (
    <div className='bg-gray-50 py-3'>
      <Container className="max-w-4xl flex flex-col gap-5 mb-3">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Review and edit your details extracted from your resume
          </p>
        </div>
        <CreateCandidateForm />
      </Container>
    </div>
  )
}
