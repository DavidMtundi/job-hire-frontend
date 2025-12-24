import { OnboardingHeader } from "./_components/header";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      <OnboardingHeader />
      <main className="flex-grow">{children}</main>
    </div>
  );
}
