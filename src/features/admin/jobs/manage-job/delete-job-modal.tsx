"use client";

import { Loader2Icon, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useDeleteJobMutation } from "~/apis/jobs/queries";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface DeleteJobModalProps {
  jobId: string;
}

export const DeleteJobModal = ({ jobId }: DeleteJobModalProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const { mutate: deleteJob, isPending } = useDeleteJobMutation();

  const handleDelete = async () => {
    setIsLoading(true);

    deleteJob(jobId, {
      onSuccess: () => {
        toast.success("Job deleted successfully");
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
      onSettled: () => {
        setIsLoading(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Trash2 /> Delete
        </Button>
      </AlertDialogTrigger>

      {/* Modal */}
      <AlertDialogContent className="max-w-md rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">
            Delete Job Posting?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Are you sure you want to permanently delete this job posting?
            <br />This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Footer */}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive/90 hover:bg-destructive/80"
          >
            {isPending && <Loader2Icon className="w-4 h-4 animate-spin" />}
            {isPending ? "Deleting..." : "Yes, Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
