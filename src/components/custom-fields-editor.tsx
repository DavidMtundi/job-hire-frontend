"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { DatePicker } from "~/components/date-picker";
import { CustomFieldType, TCustomField } from "~/apis/jobs/schemas";

interface CustomFieldsEditorProps {
  value: TCustomField[];
  onChange: (fields: TCustomField[]) => void;
  disabled?: boolean;
}

const fieldTypeOptions = [
  { label: "Text", value: CustomFieldType.TEXT },
  { label: "Number", value: CustomFieldType.NUMBER },
  { label: "Boolean", value: CustomFieldType.BOOLEAN },
  { label: "Date", value: CustomFieldType.DATE },
  { label: "Select", value: CustomFieldType.SELECT },
  { label: "Multiline Text", value: CustomFieldType.MULTILINE_TEXT },
];

// Helper function to generate field_key from field_name
const generateFieldKey = (fieldName: string): string => {
  return fieldName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

export function CustomFieldsEditor({
  value = [],
  onChange,
  disabled = false,
}: CustomFieldsEditorProps) {
  const handleAddField = () => {
    const newField: TCustomField = {
      field_name: "",
      field_key: "",
      type: CustomFieldType.TEXT,
      value: null,
      required: false,
    };
    onChange([...value, newField]);
  };

  const handleRemoveField = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    updates: Partial<TCustomField>
  ) => {
    const newFields = [...value];
    const field = { ...newFields[index], ...updates };

    // Auto-generate field_key when field_name changes
    if (updates.field_name !== undefined) {
      field.field_key = generateFieldKey(updates.field_name);
    }

    newFields[index] = field;
    onChange(newFields);
  };

  const renderValueInput = (field: TCustomField, index: number) => {
    const fieldId = `custom-field-value-${index}`;

    switch (field.type) {
      case CustomFieldType.TEXT:
        return (
          <Input
            id={fieldId}
            value={(field.value as string) || ""}
            onChange={(e) =>
              handleFieldChange(index, { value: e.target.value })
            }
            placeholder="Enter text value"
            disabled={disabled}
            className="h-8"
          />
        );

      case CustomFieldType.NUMBER:
        return (
          <Input
            id={fieldId}
            type="number"
            value={(field.value as number) ?? ""}
            onChange={(e) => {
              const numValue = e.target.value === "" ? null : Number(e.target.value);
              handleFieldChange(index, { value: numValue });
            }}
            placeholder="Enter number value"
            disabled={disabled}
            className="h-8"
          />
        );

      case CustomFieldType.BOOLEAN:
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={fieldId}
              checked={field.value === true}
              onCheckedChange={(checked) =>
                handleFieldChange(index, { value: checked === true })
              }
              disabled={disabled}
            />
            <Label htmlFor={fieldId} className="text-sm font-normal cursor-pointer">
              {field.value === true ? "Yes" : "No"}
            </Label>
          </div>
        );

      case CustomFieldType.DATE:
        return (
          <DatePicker
            value={field.value ? new Date(field.value as string) : undefined}
            onChange={(date) =>
              handleFieldChange(index, {
                value: date ? date.toISOString().split("T")[0] : null,
              })
            }
            placeholder="Select date"
            disabled={disabled}
            dateFormat="PPP"
          />
        );

      case CustomFieldType.SELECT:
        // For select, we'll use a simple text input for now
        // In a more advanced version, you could add options management
        return (
          <Input
            id={fieldId}
            value={(field.value as string) || ""}
            onChange={(e) =>
              handleFieldChange(index, { value: e.target.value })
            }
            placeholder="Enter selected value"
            disabled={disabled}
            className="h-8"
          />
        );

      case CustomFieldType.MULTILINE_TEXT:
        return (
          <Textarea
            id={fieldId}
            value={(field.value as string) || ""}
            onChange={(e) =>
              handleFieldChange(index, { value: e.target.value })
            }
            placeholder="Enter multiline text"
            disabled={disabled}
            rows={3}
          />
        );

      default:
        return (
          <Input
            id={fieldId}
            value={(field.value as string) || ""}
            onChange={(e) =>
              handleFieldChange(index, { value: e.target.value })
            }
            placeholder="Enter value"
            disabled={disabled}
            className="h-8"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {value.map((field, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 space-y-4 bg-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`custom-field-name-${index}`}>
                    Field Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`custom-field-name-${index}`}
                    value={field.field_name}
                    onChange={(e) =>
                      handleFieldChange(index, { field_name: e.target.value })
                    }
                    placeholder="e.g., Security Clearance"
                    disabled={disabled}
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`custom-field-type-${index}`}>
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={field.type}
                    onValueChange={(value) =>
                      handleFieldChange(index, {
                        type: value as CustomFieldType,
                        // Reset value when type changes
                        value: null,
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger id={`custom-field-type-${index}`} className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`custom-field-value-${index}`}>
                  Value {field.required && <span className="text-red-500">*</span>}
                </Label>
                {renderValueInput(field, index)}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`custom-field-required-${index}`}
                  checked={field.required || false}
                  onCheckedChange={(checked) =>
                    handleFieldChange(index, { required: checked === true })
                  }
                  disabled={disabled}
                />
                <Label
                  htmlFor={`custom-field-required-${index}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  Required field
                </Label>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="iconSm"
              onClick={() => handleRemoveField(index)}
              disabled={disabled}
              className="mt-8"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleAddField}
        disabled={disabled}
      >
        <PlusIcon className="size-4 mr-2" />
        Add Custom Field
      </Button>
    </div>
  );
}
