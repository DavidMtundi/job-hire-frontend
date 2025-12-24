"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Edit2 } from "lucide-react";
import { Label } from "~/components/ui/labels";

export default function ApplicationFormPage() {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    experience: "5",
    currentRole: "Frontend Developer",
    expectedSalary: "$140,000",
    availableDate: "2024-02-01",
    coverLetter: "I am excited to apply for this position...",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    portfolioUrl: "https://johndoe.dev",
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock submission
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/apply/${params.id}/success`);
    }, 2000);
  };

  const FormField = ({
    label,
    field,
    type = "text",
    multiline = false,
  }: {
    label: string;
    field: string;
    type?: string;
    multiline?: boolean;
  }) => {
    const isEditing = editingField === field;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field}>{label}</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditingField(isEditing ? null : field)}
            className="h-6 w-6 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>

        {isEditing ? (
          multiline ? (
            <Textarea
              id={field}
              value={formData[field as keyof typeof formData]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              onBlur={() => setEditingField(null)}
              autoFocus
              rows={4}
            />
          ) : (
            <Input
              id={field}
              type={type}
              value={formData[field as keyof typeof formData]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              onBlur={() => setEditingField(null)}
              autoFocus
            />
          )
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border min-h-[40px] flex items-center">
            <span className="text-gray-900">
              {formData[field as keyof typeof formData] || "Not specified"}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your Application
          </h1>
          <p className="text-gray-600">
            Review and edit your information before submitting
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="First Name" field="firstName" />
                  <FormField label="Last Name" field="lastName" />
                </div>
                <FormField label="Email" field="email" type="email" />
                <FormField label="Phone" field="phone" type="tel" />
                <FormField label="Location" field="location" />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingField(
                            editingField === "experience" ? null : "experience"
                          )
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {editingField === "experience" ? (
                      <Select
                        value={formData.experience}
                        onValueChange={(value) =>
                          handleInputChange("experience", value)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="2-3">2-3 years</SelectItem>
                          <SelectItem value="4-5">4-5 years</SelectItem>
                          <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md border min-h-[40px] flex items-center">
                        <span className="text-gray-900">
                          {{
                            "0-1": "0-1 years",
                            "2-3": "2-3 years",
                            "4-5": "4-5 years",
                            "5+": "5+ years",
                          }[formData.experience] || "Not specified"}
                        </span>
                      </div>
                    )}
                  </div>

                  <FormField label="Current Role" field="currentRole" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Expected Salary" field="expectedSalary" />
                  <FormField
                    label="Available Start Date"
                    field="availableDate"
                    type="date"
                  />
                </div>
                <FormField
                  label="LinkedIn URL"
                  field="linkedinUrl"
                  type="url"
                />
                <FormField
                  label="Portfolio URL"
                  field="portfolioUrl"
                  type="url"
                />
              </CardContent>
            </Card>

            {/* Cover Letter */}
            <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  label="Why are you interested in this position?"
                  field="coverLetter"
                  multiline
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/apply/${params.id}`)}
              >
                Back to Resume Upload
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-8">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
