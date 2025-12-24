"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { BasicInfoForm } from "./basic-info-form"
import { EducationForm } from "./education-form"
import { ExperienceForm } from "./experience-form"
import { PersonalDetailsForm } from "./personal-details-form"
import { PreferencesForm } from "./preferences-form"
import { ResumeUpload } from "./resume-upload"
import { SkillsForm } from "./skills-form"

const steps = [
  { label: "Basic Info", component: BasicInfoForm },
  { label: "Personal Details", component: PersonalDetailsForm },
  { label: "Education", component: EducationForm },
  { label: "Experience", component: ExperienceForm },
  { label: "Skills", component: SkillsForm },
  { label: "Resume Upload", component: ResumeUpload },
  { label: "Preferences", component: PreferencesForm }
]

export const ProfileStepper = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const StepComponent = steps[currentStep].component

  const next = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  const prev = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Progress value={((currentStep + 1) / steps.length) * 100} className="mb-6" />
      <h2 className="text-xl font-semibold mb-4">{steps[currentStep].label}</h2>

      <div className="border rounded-2xl p-4 shadow-sm">
        <StepComponent onNext={next} onBack={prev} />
      </div>

      <div className="flex justify-between mt-6">
        <Button onClick={prev} disabled={currentStep === 0}>Back</Button>
        <Button onClick={next}>
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  )
}
