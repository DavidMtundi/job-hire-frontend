import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { BackButton } from '../components/back-button'
import { ForgotPasswordForm } from './forgot-password-form'

export default function ForgotPasswordScreen() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-700">Forgot Password</CardTitle>
          <CardDescription>
            Enter your account email and we&apos;ll guide you through resetting your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <BackButton label="Back to Login" href="/login" />
        </CardFooter>
      </Card>
    </div>
  )
}