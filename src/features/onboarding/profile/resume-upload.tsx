import React from 'react'

// Upload CV in PDF/Docx file, analyze by AI, extract data and auto suggest fields.

interface ResumeUploadProps {
  onBack: () => void;
  onNext: () => void;
}

export const ResumeUpload = ({ onBack, onNext }: ResumeUploadProps) => {
  return (
    <div>ResumeUploadForm</div>
  )
}