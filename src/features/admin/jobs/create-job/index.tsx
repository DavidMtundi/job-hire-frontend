"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { AdminHeading } from "~/features/admin/_components/heading";
import { CreateJobForm } from "./create-job-form";
import { AIJobGenerationDialog } from "./ai-job-generation-dialog";
import { IAIGeneratedJobData } from "~/apis/jobs/dto";

export default function CreateJobScreen() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] =
    useState<IAIGeneratedJobData | null>(null);

  const handleJobGenerated = (data: IAIGeneratedJobData) => {
    console.log("[CreateJobScreen] AI job generated successfully:", data);
    setAiGeneratedData(data);
  };

  // Log when dialog opens/closes
  useEffect(() => {
    if (dialogOpen) {
      console.log("========================================");
      console.log("[CreateJobScreen] 🔵 AI Job Generation Dialog OPENED");
      console.log("[CreateJobScreen] User navigated to /admin/jobs/create and clicked 'Create Job via AI'");
      console.log("[CreateJobScreen] Dialog state: open =", dialogOpen);
      console.log("========================================");
    } else {
      console.log("[CreateJobScreen] AI Job Generation Dialog CLOSED");
    }
  }, [dialogOpen]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <AdminHeading
          title="Create New Job"
          description="Fill in the details to create a new job posting"
        />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              console.log("[CreateJobScreen] 🔵 'Create Job via AI' button clicked");
              console.log("[CreateJobScreen] Opening AI generation dialog...");
              setDialogOpen(true);
            }}
          >
            Create Job via AI
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/admin/jobs">
              <ArrowLeftIcon /> Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
      <CreateJobForm aiGeneratedData={aiGeneratedData} />
      <AIJobGenerationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onJobGenerated={handleJobGenerated}
      />
    </div>
  );
}
