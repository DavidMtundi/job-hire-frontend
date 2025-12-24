import { AuthHeader } from "./_components/header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      <AuthHeader />
      <main className="flex-grow">{children}</main>
    </div>
  );
}

