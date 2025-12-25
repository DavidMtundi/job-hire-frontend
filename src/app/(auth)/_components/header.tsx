import Image from "next/image";
import Link from "next/link";
import { Container } from "~/components/container";

export const AuthHeader = () => {
  return (
    <header className="w-full h-16 2xl:20">
      <Container className="h-full flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.svg" 
              alt="Job Hire" 
              width={32} 
              height={32} 
              className="size-8" 
            />
            <span className="text-xl font-bold text-blue-950">
              Job Hire
            </span>
          </div>
        </Link>
      </Container>
    </header>
  );
};
