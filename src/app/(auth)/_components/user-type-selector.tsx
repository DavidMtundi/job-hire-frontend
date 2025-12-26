"use client";

import { Building2, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export function UserTypeSelector() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {/* Candidate Card */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <Link href="/signup">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">I'm a Job Seeker</CardTitle>
            </div>
            <CardDescription>
              Looking for opportunities? Create a candidate account to browse and apply for jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Browse thousands of job opportunities
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Apply to jobs with one click
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Track your application status
              </li>
            </ul>
            <Button className="w-full group-hover:bg-blue-600" variant="default">
              Sign up as Candidate
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Link>
      </Card>

      {/* Company Card */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <Link href="/admin/companies/register">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">I'm a Company</CardTitle>
            </div>
            <CardDescription>
              Need to hire? Register your company to post jobs and manage applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Post unlimited job listings
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Manage applications with AI assistance
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Invite team members to help recruit
              </li>
            </ul>
            <Button className="w-full group-hover:bg-green-600" variant="default">
              Register Company
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}

