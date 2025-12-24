// components/FilterGroup.tsx
"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterItem {
  label: string;
  placeholder?: string;
  value: string;
  width?: string; // e.g. w-40, w-48
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface FilterGroupProps {
  filters: FilterItem[];
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ filters }) => {
  return (
    <div className="flex gap-4   flex-wrap">
      {filters.map((filter) => (
        <Select
          key={filter.label}
          value={filter.value}
          onValueChange={filter.onChange}
        >
          <SelectTrigger className={filter.width ?? "w-40"}>
            <SelectValue placeholder={filter.placeholder ?? filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
};
