import { CheckCircle } from "lucide-react";

interface FormSuccessProps {
  message?: string;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-3 text-sm text-emerald-500">
      <CheckCircle className="size-4" />
      <p>{message}</p>
    </div>
  );
};
