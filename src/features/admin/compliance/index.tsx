"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useGetApplicationsQuery } from "~/apis/applications/queries";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type ComplianceIssue = {
  id: string;
  candidateName: string;
  jobTitle: string;
  stage: string;
  issue: string;
  appliedAt?: string;
};

const getApplicationsList = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload)) return payload;
  return [];
};

const formatCandidateName = (application: any): string => {
  const firstName = application?.candidate?.first_name ?? "";
  const lastName = application?.candidate?.last_name ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Unknown candidate";
};

const formatIssueFromApplication = (application: any): string | null => {
  const hasResume =
    Boolean(application?.candidate?.resume_url) ||
    Boolean(application?.resume_url);
  const hasCoverLetter = Boolean(application?.cover_letter?.trim?.());
  const hasNextStepDate = Boolean(application?.next_step_date);

  if (!hasResume) return "Missing resume";
  if (!hasCoverLetter) return "Missing cover letter";
  if (!hasNextStepDate) return "Missing next-step date";

  return null;
};

export default function ComplianceScreen() {
  const { data, isLoading, isError, error } = useGetApplicationsQuery({
    page: 1,
    page_size: 200,
  });

  const applications = useMemo(() => getApplicationsList(data), [data]);

  const issues = useMemo<ComplianceIssue[]>(() => {
    return applications
      .map((application: any): ComplianceIssue | null => {
        const issue = formatIssueFromApplication(application);
        if (!issue) return null;

        return {
          id: String(
            application?.id ??
              `${application?.candidate_id ?? "unknown"}-${application?.job_id ?? "unknown"}-${
                application?.applied_at ?? "unknown"
              }`,
          ),
          candidateName: formatCandidateName(application),
          jobTitle: application?.job?.title ?? "Unknown position",
          stage: application?.stage ?? "Applied",
          issue,
          appliedAt: application?.applied_at,
        };
      })
      .filter((item): item is ComplianceIssue => item !== null);
  }, [applications]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Compliance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor application completeness and identify records missing required fields.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-600">{issues.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliant Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-600">
              {Math.max(applications.length - issues.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Failed to fetch compliance data: {error?.message ?? "Unknown error"}
            </div>
          ) : issues.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              All fetched records are currently compliant.
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.candidateName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{item.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Applied:{" "}
                      {item.appliedAt ? new Date(item.appliedAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.stage}</Badge>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      {item.issue}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
