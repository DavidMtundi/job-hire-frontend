import { Container } from "~/components/container";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-100">
      <Container>
        <div className="h-14 text-sm flex justify-center items-center">
          Copyright &copy; {year} <strong className="ml-1">Job Hire</strong>. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};
