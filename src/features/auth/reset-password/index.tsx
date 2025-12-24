import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { BackButton } from '../components/back-button'
import { ResetPasswordForm } from './reset-password-form'

export default function ResetPasswordScreen() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-700">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password and confirm it to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <BackButton label="Back to Login" href="/login" />
        </CardFooter>
      </Card>
    </div>
  )
}