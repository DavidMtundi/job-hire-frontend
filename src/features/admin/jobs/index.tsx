import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { JobsSummary } from "./jobs-summary";
import { ListJob } from "./list-job";

export default function JobsScreen() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-700">Jobs Management</h1>
          <p className="text-gray-600">
            Create, manage, and track job postings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href={"/admin/jobs/create"}>
              <PlusIcon /> Create Job
            </Link>
          </Button>
        </div>
      </div>      

      {/* <JobsSummary /> */}
      <ListJob />
    </div>
  );
}
