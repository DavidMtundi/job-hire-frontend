import React from 'react'

// degrees, institutes, years

interface EducationFormProps { 
  onBack: () => void;
  onNext: () => void;
}

export const EducationForm = ({ onBack, onNext }: EducationFormProps) => {
  return (
    <div>EducationForm</div>
  )
}