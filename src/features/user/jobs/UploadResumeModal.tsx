"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
// import { useUploadResumeMutation } from "~/apis/candidate/queries"
import { useUploadResumeMutation } from "../../../apis/resume/queries"

interface UploadResumeModalProps {
  userId: string
  triggerLabel?: string
  trigger?: React.ReactNode
}

export const UploadResumeModal = ({ userId, triggerLabel = "Upload Resume", trigger }: UploadResumeModalProps) => {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { mutate: uploadResume, isPending } = useUploadResumeMutation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first")
      return
    }

    uploadResume(
      { userId, file: selectedFile },
      {
        onSuccess: () => {
          toast.success("Resume uploaded successfully")
          setSelectedFile(null)
          setOpen(false)
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.detail || "Resume upload failed"
          toast.error(message)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">{triggerLabel}</Button>}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Resume</DialogTitle>
          <DialogDescription>
            Please upload your resume. Accepted formats: PDF, DOC, DOCX.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="block w-full"
          />
          {selectedFile && (
            <p className="text-gray-700 text-sm">Selected file: {selectedFile.name}</p>
          )}
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isPending}>
            {isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
