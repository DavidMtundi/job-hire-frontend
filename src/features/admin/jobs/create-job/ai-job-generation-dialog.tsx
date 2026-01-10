"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { useGenerateJobWithAIMutation } from "~/apis/jobs/queries";

const languages = [
  { label: "English", value: "en" },
  { label: "Urdu", value: "ur" },
  { label: "Arabic", value: "ar" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Chinese", value: "zh" },
  { label: "Japanese", value: "ja" },
];

interface AIJobGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobGenerated: (jobData: any) => void;
}

export function AIJobGenerationDialog({
  open,
  onOpenChange,
  onJobGenerated,
}: AIJobGenerationDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("en");

  const { mutate: generateJob, isPending } = useGenerateJobWithAIMutation();

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a job description prompt");
      return;
    }

    generateJob(
      {
        text: prompt,
        language,
        save: false,
      },
      {
        onSuccess: (response) => {
          toast.success("Job generated successfully!");
          onJobGenerated(response.data);
          onOpenChange(false);
          setPrompt("");
          setLanguage("en");
        },
        onError: (error: any) => {
          // Extract detailed error message from API response
          const errorMessage = 
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            error?.message ||
            "Failed to generate job";
          toast.error(errorMessage);
          console.error("AI Job Generation Error:", {
            message: errorMessage,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            fullError: error
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate Job with AI</DialogTitle>
          <DialogDescription>
            Describe the job you want to create and AI will generate a complete
            job description for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Job Description Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., I want a Python developer with 3 years of experience"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isPending}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? "Generating..." : "Generate Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
