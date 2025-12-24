import { redirect } from "next/navigation";
import ProfileCompletionScreen from "~/features/onboarding/profile-completion";
import { authSession } from "~/lib/auth";

export default async function ProfileCompletionPage() {
  const session = await authSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.is_profile_complete) {
    redirect("/user/dashboard");
  }

  return <ProfileCompletionScreen />
}