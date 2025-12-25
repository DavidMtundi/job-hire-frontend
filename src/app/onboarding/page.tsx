import { authSession } from "~/lib/auth";
import OnboardingLoading from "./loading";
import { RedirectHandler } from "./_components/redirect-handler";

export default async function OnboardingPage() {
  const session = await authSession();

  if (!session) {
    return <RedirectHandler redirectTo="/login" />;
  }
  
  if (session.user.onboardingCompleted) {
    return <RedirectHandler redirectTo="/user/dashboard" />;
  }

  // Use client-side redirect to prevent performance measurement issues
  return <RedirectHandler redirectTo="/onboarding/resume-upload" />;
}