"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  allowCustom?: boolean
  className?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  disabled = false,
  allowCustom = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = options.find((option) => option.value === value)
  
  // Filter options based on search value (for custom option display logic)
  const filteredOptions = React.useMemo(() => {
    if (!searchValue.trim()) return options
    const searchLower = searchValue.trim().toLowerCase()
    return options.filter(
      opt =>
        opt.value.toLowerCase().includes(searchLower) ||
        opt.label.toLowerCase().includes(searchLower)
    )
  }, [options, searchValue])
  
  // Show custom option when allowCustom is true, searchValue exists, and no matches found
  const showCustomOption = allowCustom && searchValue.trim() && filteredOptions.length === 0

  // If allowCustom is true and the value doesn't match any option, treat it as custom
  const isCustomValue = allowCustom && value && !selectedOption

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value && (selectedOption || isCustomValue)
            ? (selectedOption?.label ?? value)
            : placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={!showCustomOption}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {showCustomOption ? (
              <CommandGroup>
                <div
                  className="flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onChange(searchValue.toUpperCase().trim())
                    setOpen(false)
                    setSearchValue("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onChange(searchValue.toUpperCase().trim())
                      setOpen(false)
                      setSearchValue("")
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  Use &quot;{searchValue.toUpperCase().trim()}&quot;
                </div>
              </CommandGroup>
            ) : (
              <>
                <CommandEmpty>
                  <div className="py-6 text-center text-sm">{emptyText}</div>
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        onChange(option.value === value ? undefined : option.value)
                        setOpen(false)
                        setSearchValue("")
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

