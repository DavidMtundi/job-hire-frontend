import { Loader2 } from "lucide-react";
import { Container } from "~/components/container";

export default function OnboardingLoading() {
  return (
    <Container className="p-10 flex justify-center items-center h-full">
      <Loader2 className="size-10 animate-spin" />
    </Container>
  );
}