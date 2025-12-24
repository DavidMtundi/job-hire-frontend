// gender, dob, nationality ...

interface PersonalDetailsFormProps {
  onBack: () => void;
  onNext: () => void;
}

export const PersonalDetailsForm = ({ onBack, onNext }: PersonalDetailsFormProps) => {
  return (
    <div>PersonalDetailsForm</div>
  )
}