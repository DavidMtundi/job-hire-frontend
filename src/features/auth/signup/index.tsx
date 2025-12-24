import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { BackButton } from "~/features/auth/components/back-button"
import { SignupForm } from "./signup-form"

const SignupScreen = () => {
  return (
    <div className="grid lg:grid-cols-2 h-[calc(100vh-64px)]">
      <div className="flex items-center justify-center max-sm:px-4">
        <Card className="w-full max-w-md lg:bg-transparent lg:border-none lg:shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-700">
              Create an account
            </CardTitle>
            <CardDescription>
              Enter your email and password to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
          <CardFooter className="flex justify-center">
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