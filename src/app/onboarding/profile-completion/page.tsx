import ProfileCompletionScreen from "~/features/onboarding/profile-completion";
import { authSession } from "~/lib/auth";
import { RedirectHandler } from "../_components/redirect-handler";

export default async function ProfileCompletionPage() {
  const session = await authSession();

  if (!session) {
    return <RedirectHandler redirectTo="/login" />;
  }

  if (session.user.is_profile_complete) {
    return <RedirectHandler redirectTo="/user/dashboard" />;
  }

  return <ProfileCompletionScreen />
}