import { CompanyEditForm } from "~/features/admin/companies/company-edit-form";
import { authSession } from "~/lib/auth";
import { redirect } from "next/navigation";

interface CompanyEditPageProps {
  params: Promise<{
    companyId: string;
  }>;
}

export default async function CompanyEditPage({ params }: CompanyEditPageProps) {
  const session = await authSession();

  if (!session) {
    redirect("/login");
  }

  const { companyId } = await params;

  return (
    <div className="container mx-auto py-8 px-4">
      <CompanyEditForm companyId={companyId} />
    </div>
  );
}

