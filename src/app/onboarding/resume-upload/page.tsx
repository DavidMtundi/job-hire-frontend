import { redirect } from 'next/navigation';
import ResumeUploadScreen from '~/features/onboarding/resume-uplaod'
import { authSession } from '~/lib/auth';

export default async function ResumeUploadPage() {
  const session = await authSession();

  if (!session) {
    redirect("/login");
  }
  
  if (session.user.is_profile_complete) {
    redirect("/user/dashboard");
  }

  return <ResumeUploadScreen />
}