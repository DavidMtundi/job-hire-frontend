import { CompanyOverview } from "~/features/admin/companies/company-overview";
import { authSession } from "~/lib/auth";
import { redirect } from "next/navigation";

export default async function CompaniesPage() {
  const session = await authSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your company profile, settings, and team members
        </p>
      </div>
      <CompanyOverview />
    </div>
  );
}

