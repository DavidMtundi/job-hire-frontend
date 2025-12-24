import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoaderProps {
  mode?: "default" | "icon" | "icon-label";
  size?: "sm" | "md" | "lg";
}

export const Loader = ({ mode = "default", size = "md" }: LoaderProps) => {

  const iconSize = size === "sm" ? "size-4" : size === "md" ? "size-5" : "size-6";
  const labelSize = size === "sm" ? "text-sm" : size === "md" ? "text-md" : "text-lg";

  return (
    <div className="flex items-center gap-1">
      {mode === "icon" && <Loader2 className={cn("animate-spin text-gray-600", iconSize)} />}
      {mode === "icon-label" && (
        <>
          <Loader2 className={cn("animate-spin text-gray-600", iconSize)} />
          <span className={cn("text-gray-600 font-medium", labelSize)}>Loading...</span>
        </>
      )}
      {mode === "default" && <span className={cn("text-gray-600 font-medium", labelSize)}>Loading...</span>}
    </div>
  );
}
