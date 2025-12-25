"use client";

import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IGetApplicationsParams } from "~/apis/applications/dto";
import { useGetApplicationsQuery } from "~/apis/applications/queries";
import { TApplicationStatus } from "~/apis/applications/schemas";
import { DataList } from "~/components/data-list";
import { Loader } from "~/components/loader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { columns } from "./columns";


export default function ApplicationsScreen() {
  const [filter, setFilter] = useState<IGetApplicationsParams>();

  const router = useRouter();
  const { data } = useSession();
  const user = data?.user as any;

  const count = {
    all: 0,
    "Applied": 0,
    "Screening": 0,
    "HR Interview": 0,
    "Technical Interview": 0,
    "Final Interview": 0,
    "In Review": 0,
    "Offer Sent": 0,
    "Hired": 0,
    "Rejected": 0,
    "Talent Pool": 0,
  }

  const { data: applicationsData } = useGetApplicationsQuery();
  // Backend returns data.items (array) or data (array) depending on response structure
  const applicationsList = Array.isArray(applicationsData?.data) 
    ? applicationsData.data 
    : (applicationsData?.data?.items ?? []);
  const applications = (applicationsList ?? []).filter((item) =>  {
    let truth = true;
    count.all++;
    if(filter?.stage && item.stage) {
      if(filter.stage === "pending") {
        truth = ["Applied", "Screening"].includes(item.stage);
      } else if(filter.stage === "interviews") {
        truth = ["HR Interview", "Technical Interview", "Final Interview"].includes(item.stage);
      } else if(filter.stage === "accepted") {
        truth = ["Offer Sent", "Hired"].includes(item.stage);
      } else if(filter.stage === "rejected") {
        truth = ["Rejected", "Talent Pool"].includes(item.stage);
      }
    }
    if (item.stage) {
      count[item.stage as keyof typeof count]++;
    }
    return truth;
  });

  if (!user) {
    return <Loader mode="icon" />;
  }

  return (
    <div className="w-full h-full">
      <Card className="bg-white shadow-lg transition-shadow w-full">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">My Applications</CardTitle>
            <Button onClick={() => router.push("/user/jobs")} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Apply to New Job</span>
              <span className="sm:hidden">Apply</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* <Tabs 
            defaultValue="all" 
            className="w-full mb-4" 
            onValueChange={(value) => setFilter({ ...filter, stage: value as TApplicationStatus })}
          >
            <TabsList className="w-full">
              <TabsTrigger value="all" className="cursor-pointer">
                All ({count.all})
              </TabsTrigger>
              <TabsTrigger value="pending" className="cursor-pointer">
                Pending ({count.Applied + count.Screening})
              </TabsTrigger>
              <TabsTrigger value="interviews" className="cursor-pointer">
                Interviews ({count["HR Interview"] + count["Technical Interview"] + count["Final Interview"]})
              </TabsTrigger>
              {/* <TabsTrigger value="In Review" className="cursor-pointer">
                In Review ({count["In Review"]})
              </TabsTrigger> */}
              {/* <TabsTrigger value="accepted" className="cursor-pointer">
                Accepted ({count["Offer Sent"] + count["Hired"]})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="cursor-pointer">
                Rejected ({count.Rejected + count["Talent Pool"]})
              </TabsTrigger>
            </TabsList>
          </Tabs> */} 

          <DataList columns={columns} data={applications} />
        </CardContent>
      </Card>
    </div>
  );
}

