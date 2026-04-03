import Link from "next/link";
import { Container } from "~/components/container";

export const AuthHeader = () => {
  return (
    <header className="w-full h-16 2xl:20">
      <Container className="h-full flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-3">
            <img 
              src="/riara-logo.jpg" 
              alt="Riara University" 
              width={32} 
              height={32} 
              className="size-8"
            />
            <span className="text-xl font-bold text-primary">
              Riara University
            </span>
          </div>
        </Link>
      </Container>
    </header>
  );
};
