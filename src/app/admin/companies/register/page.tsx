import { CompanyRegistrationForm } from "~/features/admin/companies/company-registration-form";

export default async function CompanyRegistrationPage() {
  // Authentication is required - handled by proxy.ts and form component
  return (
    <div className="container mx-auto py-8 px-4">
      <CompanyRegistrationForm />
    </div>
  );
}

