'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';

interface PreviewResumeModalProps {
  resume: File;
  render?: React.ReactNode;
}

export const PreviewResumeModal = ({ resume, render }: PreviewResumeModalProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const resumePreviewUrl = URL.createObjectURL(resume);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {render || <Button variant="outline" size="sm">Preview Resume</Button>}
      </DialogTrigger>
      <DialogContent className="min-w-fit flex flex-col overflow-y-auto p-0">
        <DialogHeader className='px-6 pt-4'>
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogDescription>
            View and download candidate resume
          </DialogDescription>
        </DialogHeader>
        <div className='border'>
          {resumePreviewUrl && resume && (
            <iframe
              src={resumePreviewUrl}
              title="Resume Preview"
              className="w-full md:w-[700px] h-[80vh] border-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}