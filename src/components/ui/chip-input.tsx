"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface ChipInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function ChipInput({
  value,
  onChange,
  placeholder,
  className,
}: ChipInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const removeChip = (chip: string) => {
    onChange(value.filter((v) => v !== chip));
  };

  return (
    <div
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {value.map((chip) => (
        <span
          key={chip}
          className="bg-muted text-muted-foreground flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
        >
          {chip}
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={() => removeChip(chip)}
          />
        </span>
      ))}
      <input
        className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
