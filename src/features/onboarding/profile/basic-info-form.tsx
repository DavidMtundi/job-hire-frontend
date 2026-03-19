import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useCreateCandidateMutation, useGetCandidateByUserIdQuery, useUpdateCandidateMutation } from '~/apis/candidates/queries';

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
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const { data: candidateByUser } = useGetCandidateByUserIdQuery(userId || "");
  const createCandidateMutation = useCreateCandidateMutation();
  const updateCandidateMutation = useUpdateCandidateMutation();

  const onSubmit = async (data: BasicInfoForm) => {
    try {
      if (!userId) {
        toast.error("Please login to continue");
        return;
      }

      // Upsert candidate: update if exists, otherwise create minimal record
      if (candidateByUser?.success && candidateByUser?.data?.id) {
        await updateCandidateMutation.mutateAsync({
          id: candidateByUser.data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
        } as any);
      } else {
        await createCandidateMutation.mutateAsync({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          current_position: "Not Specified",
          years_experience: 0,
          skills: [],
          stack: [],
          joining_availability: "immediately",
        } as any);
      }

      toast.success("Saved");
      onNext();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    }
  }


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="First Name" {...form.register("first_name")} />
      </div>
      <div>
        <Input placeholder="Last Name" {...form.register("last_name")} />
      </div>
      <div>
        <Input placeholder="Email" {...form.register("email")} />
      </div>
      <div>
        <Input placeholder="Phone (optional)" {...form.register("phone")} />
      </div>
      <div>
        <Input placeholder="Address (optional)" {...form.register("address")} />
      </div>
      <div className='flex justify-end gap-2'>
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button
          type="submit"
          disabled={createCandidateMutation.isPending || updateCandidateMutation.isPending}
        >
          Save & Continue
        </Button>
      </div>
    </form>
  )
}
