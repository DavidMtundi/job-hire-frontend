import Image from "next/image"
import Link from "next/link"
import { LoginForm } from "./login-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { BackButton } from "../components/back-button";

const LoginScreen = () => {
  return (
    <div className="grid lg:grid-cols-2 h-[calc(100vh-64px)]">
      <div className="flex items-center justify-center max-sm:px-4">
        <Card className="w-full max-w-md lg:bg-transparent lg:border-none lg:shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-700">
              Welcome back!
            </CardTitle>
            <CardDescription>
              Login to your account (Candidates, HR, or Company Owners)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-3">
            <BackButton label="Don&apos;t have an account? Signup" href="/signup" />
            <div className="text-center text-sm text-gray-600 w-full">
              <p className="mb-3">New to the platform?</p>
              <div className="space-y-3">
                <div>
                  <Link 
                    href="/signup?role=candidate" 
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Sign up as Candidate
                  </Link>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-gray-500 mb-2">Want to post jobs and manage a company?</p>
                  <Link 
                    href="/signup?role=hr&redirect=/admin/companies/register" 
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Create Company Owner Account →
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    (Step 1: Create account → Step 2: Register company)
                  </p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="bg-muted relative hidden lg:block rounded-s-lg">
        <Image
          src="/images/login-placeholder.svg"
          alt="Image"
          className="h-full w-full object-cover opacity-80 dark:brightness-[0.2] dark:grayscale"
          width={500}
          height={500}
        />
      </div>
    </div>
  )
}

export default LoginScreen;