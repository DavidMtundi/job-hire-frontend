"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function Success() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <Card className="text-center bg-white shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Application Submitted!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-gray-600">
                Thank you for your application. We have received your
                information and resume.
              </p>
              <p className="text-sm text-gray-500">
                You will receive a confirmation email shortly with next steps.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Our team will review your application</li>
                <li>• You&apos;ll hear back within 3-5 business days</li>
                <li>• Check your email for updates</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href={"/"}>
                <Button onClick={() => router.push("/")} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Browse More Jobs
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={() => router.push("/user/dashboard")}
                className="w-full mt-[10px]"
              >
                View My Applications
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
