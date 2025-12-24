import React from 'react'

// Job preferences, availability, work authorization, languages, profile image

interface PreferencesFormProps {
  onBack: () => void;
  onNext: () => void;
}

export const PreferencesForm = ({ onBack, onNext }: PreferencesFormProps) => {
  return (
    <div>PreferencesForm</div>
  )
}