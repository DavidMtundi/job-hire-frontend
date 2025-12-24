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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Applications</CardTitle>
              <Button onClick={() => router.push("/user/jobs")}>
                <Plus />
                Apply to New Job
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
    </div>
  );
}

