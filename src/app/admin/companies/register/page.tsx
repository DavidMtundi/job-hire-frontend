import { CompanyRegistrationForm } from "~/features/admin/companies/company-registration-form";

export default async function CompanyRegistrationPage() {
  // Allow public access - form will handle authenticated vs unauthenticated flows
  return (
    <div className="container mx-auto py-8 px-4">
      <CompanyRegistrationForm />
    </div>
  );
}

