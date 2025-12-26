"use client";

import { Building2, Users, Mail, Settings, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useGetMyCompanyQuery, useGetCompanyUsersQuery } from "~/apis/companies/queries";
import { Loader } from "~/components/loader";
import { useRouter } from "next/navigation";
import { CompanySettingsForm } from "./company-settings-form";
import { InviteRecruiterForm } from "./invite-recruiter-form";
import { CompanyUsersList } from "./company-users-list";

export function CompanyOverview() {
  const router = useRouter();
  const { data: companyData, isLoading, error } = useGetMyCompanyQuery();

  if (isLoading) {
    return <Loader mode="icon" />;
  }

  if (error || !companyData?.success || !companyData?.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Company Found</h3>
            <p className="text-gray-600 mb-4">
              You don't belong to any company yet. Register your company to get started.
            </p>
            <Button onClick={() => router.push("/admin/companies/register")}>
              <Building2 className="h-4 w-4 mr-2" />
              Register Company
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const company = companyData.data;

  return (
    <div className="space-y-6">
      {/* Company Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>{company.name}</CardTitle>
                <CardDescription>{company.domain}</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/companies/${company.id}/edit`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {company.website && (
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
            {company.industry && (
              <div>
                <p className="text-sm text-gray-500">Industry</p>
                <p className="text-sm font-medium">{company.industry}</p>
              </div>
            )}
            {company.size && (
              <div>
                <p className="text-sm text-gray-500">Size</p>
                <Badge variant="outline" className="mt-1">
                  {company.size}
                </Badge>
              </div>
            )}
          </div>
          {company.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700">{company.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Automation Settings */}
      <CompanySettingsForm companyId={company.id} />

      {/* Recruiter Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InviteRecruiterForm companyId={company.id} />
        <CompanyUsersList companyId={company.id} />
      </div>
    </div>
  );
}

