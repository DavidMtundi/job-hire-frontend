"use client";

import { Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect, useRef, useCallback } from "react";
import { useGetApplicationStatusHistoryQuery, useGetStatusListQuery, useUpdateApplicationMutation, useUpdateApplicationStatusByIdMutation } from "~/apis/applications/queries";
import { IApplicationStatus } from "~/apis/applications/dto";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";

interface TimelineCardProps {
  applicationId: string;
  application: any;
}

export const TimelineCard = ({ applicationId, application }: TimelineCardProps) => {
  const { data: statusHistory, isLoading: isLoadingStatusHistory } = useGetApplicationStatusHistoryQuery(applicationId);
  const { data: statusList, isLoading: isLoadingStatusList } = useGetStatusListQuery();
  const updateApplicationMutation = useUpdateApplicationMutation();
  const updateApplicationStatusByIdMutation = useUpdateApplicationStatusByIdMutation();
  const isManualUpdateRef = useRef(false);

  const getStatusName = (statusId: string | number) => {
    if (!statusList) {
      return typeof statusId === 'string' ? statusId : String(statusId);
    }

    const statusByName = statusList.find(s => s.status === statusId);
    if (statusByName) return statusByName.status;

    const statusById = statusList.find(s => s.id === Number(statusId));
    if (statusById) return statusById.status;

    return typeof statusId === 'string' ? statusId : String(statusId);
  };

  const mapStageToApiStatus = (stage: string): string | null => {
    const stageMap: Record<string, string> = {
      "applied": "Application Received",
      "screening": "Under Review",
      "shortlisted": "Shortlisted",
      "hr_interview": "Interview Scheduled",
      "technical_interview": "Interview Scheduled",
      "final_interview": "Interview Scheduled",
      "in_review": "Evaluation Pending",
      "offer_sent": "Offer Extended",
      "hired": "Hired",
      "rejected": "CV Rejected",
      "talent_pool": "Selected",
    };

    const normalizedStage = stage.toLowerCase().replace(/\s+/g, '_');
    return stageMap[normalizedStage] || null;
  };

  const getStatusFromApplication = useCallback((): string | null => {
    if (!statusList || statusList.length === 0) {
      return null;
    }

    if (application?.status_id) {
      const found = statusList.find(item => item.id === application.status_id);
      if (found) {
        return found.status;
      }
    }

    if (application?.stage) {
      const apiStatus = mapStageToApiStatus(application.stage);
      if (apiStatus) {
        const found = statusList.find(item => item.status === apiStatus);
        if (found) {
          return apiStatus;
        }
      }
    }

    return "Application Received";
  }, [statusList, application?.status_id, application?.stage]);

  const [currentStatus, setCurrentStatus] = useState<string>(() => {
    if (statusList && statusList.length > 0 && application?.status_id) {
      const found = statusList.find(item => item.id === application.status_id);
      if (found) {
        return found.status;
      }
    }
    return "Application Received";
  });

  useEffect(() => {
    if (isManualUpdateRef.current) {
      return;
    }

    const statusFromApp = getStatusFromApplication();
    if (statusFromApp && statusFromApp !== currentStatus) {
      setCurrentStatus(statusFromApp);
    }
  }, [getStatusFromApplication, currentStatus]);

  const handleStatusChange = async (newStatus: string) => {
    const previousStatus = currentStatus;

    isManualUpdateRef.current = true;

    setCurrentStatus(newStatus);

    try {
      const statusItem = statusList?.find(item => item.status === newStatus);

      if (!statusItem) {
        toast.error("Invalid status selected");
        setCurrentStatus(previousStatus);
        isManualUpdateRef.current = false;
        return;
      }

      await updateApplicationMutation.mutateAsync({
        id: applicationId,
        status_id: statusItem.id,
      } as any);

      await updateApplicationStatusByIdMutation.mutateAsync({
        applicationId: applicationId,
        status_id: statusItem.id,
        remark: newStatus,
      });

      toast.success("Application status updated successfully");

      setTimeout(() => {
        isManualUpdateRef.current = false;
      }, 500);
    } catch (error) {
      setCurrentStatus(previousStatus);
      isManualUpdateRef.current = false;
      const errorMessage = error instanceof Error ? error.message : "Failed to update application status";
      toast.error(errorMessage);
    }
  };

  const statusHistoryIds = statusHistory?.map((s: IApplicationStatus) => {
    const statusName = getStatusName(s.status_id);
    return statusName;
  }) || [];

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-semibold">Timeline</CardTitle>
          </div>
        </div>

        <div className="space-y-2">
          <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            disabled={isLoadingStatusList || updateApplicationMutation.isPending || updateApplicationStatusByIdMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingStatusList ? "Loading..." : "Select status"} />
            </SelectTrigger>
            <SelectContent>
              {statusList && statusList.length > 0 ? (
                statusList
                  .filter((statusItem) => statusItem.status && statusItem.status.trim() !== "")
                  .map((statusItem) => (
                    <SelectItem key={statusItem.id} value={statusItem.status}>
                      {statusItem.status}
                    </SelectItem>
                  ))
              ) : (
                currentStatus && currentStatus.trim() !== "" ? (
                  <SelectItem value={currentStatus}>{currentStatus}</SelectItem>
                ) : (
                  <SelectItem value="pending">Pending</SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 pt-2">
          {isLoadingStatusHistory ? (
            <div className="text-center text-sm text-gray-500 py-4">
              Loading timeline...
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              {(() => {
                const completedStatuses = statusHistory
                  ? [...statusHistory].sort((a, b) => 
                      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                  : [];

                const completedStatusNames = new Set(
                  completedStatuses.map((s: IApplicationStatus) => getStatusName(s.status_id))
                );

                const pendingStatuses = statusList
                  ? statusList.filter(status => !completedStatusNames.has(status.status))
                  : [];

                const allStatuses = [
                  ...completedStatuses.map((historyEntry: IApplicationStatus) => ({
                    type: 'completed' as const,
                    historyEntry,
                    statusName: getStatusName(historyEntry.status_id),
                    date: new Date(historyEntry.created_at),
                  })),
                  ...pendingStatuses.map(status => ({
                    type: 'pending' as const,
                    status,
                    statusName: status.status,
                    date: null,
                  })),
                ];

                if (allStatuses.length === 0) {
                  return (
                    <div className="text-center text-sm text-gray-500 py-4">
                      No status history available
                    </div>
                  );
                }

                return allStatuses.map((item, index) => {
                  const isCompleted = item.type === 'completed';
                  const formattedDate = item.date ? format(item.date, "M/d/yyyy") : null;
                  const historyEntry = isCompleted ? item.historyEntry : null;

                  return (
                    <div key={isCompleted ? item.historyEntry.id : item.status.id} className="relative flex gap-4 pb-6 last:pb-0">
                      <div className="relative z-10 flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pt-1">
                        <div className="mb-1">
                          <span className={`font-bold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                            {item.statusName}
                          </span>
                        </div>
                        {isCompleted && formattedDate && (
                          <div className="flex items-start gap-3">
                            <span className="text-sm text-gray-700">{formattedDate}</span>
                            
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

