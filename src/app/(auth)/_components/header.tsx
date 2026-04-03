import Link from "next/link";
import { Container } from "~/components/container";
import { siteConfig } from "~/config/site";

export const AuthHeader = () => {
  return (
    <header className="w-full h-16 2xl:20">
      <Container className="h-full flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img
            src={siteConfig.brand.logo}
            alt={siteConfig.title}
            width={512}
            height={512}
            className="h-9 w-9 object-contain"
          />
        </Link>
      </Container>
    </header>
  );
};
