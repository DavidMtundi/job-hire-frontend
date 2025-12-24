import { BriefcaseIcon } from "lucide-react";
import Link from "next/link";
import { Container } from "~/components/container";

export const AuthHeader = () => {
  return (
    <header className="w-full h-16 2xl:20">
      <Container className="h-full flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="size-7 text-primary/90" />
            <span className="text-xl font-bold text-blue-950">
              MustHire
            </span>
          </div>
        </Link>
      </Container>
    </header>
  );
};
