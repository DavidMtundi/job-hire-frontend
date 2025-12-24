import { redirect } from "next/navigation";
import OnboardingScreen from "~/features/onboarding";
import { authSession } from "~/lib/auth";

export default async function OnboardingPage() {
  const session = await authSession();

  if (!session) {
    redirect("/login");
  }
  
  if (session.user.onboardingCompleted) {
    redirect("/user/dashboard");
  }

  redirect("/onboarding/resume-upload");

  // return <OnboardingScreen />;
};