import Image from "next/image"
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
              Login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex justify-center">
            {/* <Divider>Or continue with</Divider>
            <SocialAuth /> */}
            <BackButton label="Don&apos;t have an account? Signup" href="/signup" />
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