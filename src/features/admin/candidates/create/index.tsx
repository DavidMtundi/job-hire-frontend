import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { AdminHeading } from "~/features/admin/_components/heading";
import { CreateCandidateForm } from "./create-candidate-form";


export default function CreateCandidateScreen() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <AdminHeading
          title="Create New Candidate" 
          description="Fill in the details to create a new candidate" 
        />
        <Button 
          variant="secondary" 
          size="sm"
          asChild
        >
          <Link href="/admin/candidates">
            <ArrowLeftIcon /> Back to Candidates
          </Link>
        </Button>
      </div>
      <CreateCandidateForm />
    </div>
  );
}
