import React from 'react'
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

const basicInfoSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
})
type BasicInfoForm = z.infer<typeof basicInfoSchema>

interface BasicInformationProps {
  onBack: () => void;
  onNext: () => void;
}

export const BasicInfoForm = ({ onNext, onBack }: BasicInformationProps) => {
  const form = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
  })

  const onSubmit = (data: BasicInfoForm) => {
    console.log("Basic Info:", data)
    // TODO: send API request here
    onNext()
  }


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="First Name" />
      </div>
      <div>
        <Input placeholder="Email" />
      </div>
      <div>
        <Input placeholder="Phone (optional)" />
      </div>
      <div>
        <Input placeholder="Address (optional)" />
      </div>
      <div className='flex justify-end gap-2'>
        <Button type="submit">Save & Continue</Button>
      </div>
    </form>
  )
}
