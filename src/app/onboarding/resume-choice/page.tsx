import ResumeChoiceScreen from "~/features/onboarding/resume-choice";
import { authSession } from "~/lib/auth";
import { RedirectHandler } from "../_components/redirect-handler";

export default async function ResumeChoicePage() {
  const session = await authSession();

  if (!session) {
    return <RedirectHandler redirectTo="/login" />;
  }

  if (session.user.is_profile_complete) {
    return <RedirectHandler redirectTo="/user/dashboard" />;
  }

  return <ResumeChoiceScreen />;
}
