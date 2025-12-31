import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { BackButton } from "~/features/auth/components/back-button"
import { SignupForm } from "./signup-form"
import { Building2 } from "lucide-react"

const SignupScreen = () => {
  return (
    <div className="grid lg:grid-cols-2 h-[calc(100vh-64px)]">
      <div className="flex items-center justify-center max-sm:px-4">
        <Card className="w-full max-w-md lg:bg-transparent lg:border-none lg:shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-700">
              Create Account
            </CardTitle>
            <CardDescription className="space-y-3">
              <p className="text-base">Create your account to get started</p>
              <div className="pt-3 border-t bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 mb-2 font-semibold">For Company Owners & HR:</p>
                <p className="text-xs text-gray-600 mb-2">
                  Select <strong>"HR"</strong> role below. After creating your account and logging in, you&apos;ll be able to register your company.
                </p>
                <p className="text-xs text-gray-500 italic">
                  Step 1: Create Account (this page) → Step 2: Login → Step 3: Register Company
                </p>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-2">
            <BackButton label="Already have an account? Login" href="/login" />
          </CardFooter>
        </Card>
      </div>
      <div className="bg-muted relative hidden lg:block rounded-s-lg">
        <Image
          src="/images/signup-placeholder.svg"
          alt="Image"
          className="h-full w-full object-cover opacity-80 dark:brightness-[0.2] dark:grayscale"
          width={500}
          height={500}
        />
      </div>
    </div>
  )
}

export default SignupScreen;