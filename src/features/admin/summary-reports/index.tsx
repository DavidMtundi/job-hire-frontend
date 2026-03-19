"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import { useGetApplicationsQuery } from "~/apis/applications/queries";
import { useGetHiringFunnelQuery } from "~/apis/dashboard-hr/queries";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Calendar,
  Loader2,
  RefreshCw,
  Users,
  Clock3,
  MessageSquare,
  Handshake,
  UserCheck,
  UserX,
} from "lucide-react";

const normalizeStageLabel = (stage: string) => {
  const value = (stage || "").trim().toLowerCase();

  if (value.includes("under review") || value.includes("in review") || value.includes("review")) {
    return "In Review";
  }
  if (value.includes("interview")) return "Interview";
  if (value.includes("offer")) return "Offer";
  if (value.includes("hired")) return "Hired";
  if (value.includes("reject")) return "Rejected";
  if (value.includes("screen")) return "Screening";
  if (value.includes("appl")) return "Applied";
  return stage || "Applied";
};

const getStatusColor = (stage: string) => {
  switch (normalizeStageLabel(stage)) {
    case "Applied":
      return "bg-gray-100 text-gray-800";
    case "Screening":
    case "In Review":
      return "bg-yellow-100 text-yellow-800";
    case "Interview":
      return "bg-blue-100 text-blue-800";
    case "Offer":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    case "Hired":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const normalizeSummaryMarkdown = (value: string): string => {
  return value
    .split("\n")
    .map((line) => {
      const bulletMatch = line.match(/^(\s*)\*\s+(.*)$/);
      if (!bulletMatch) return line;
      return `${bulletMatch[1]}- ${bulletMatch[2]}`;
    })
    .join("\n");
};

const cleanText = (value: string): string => {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const toTextBlock = (value: unknown): string => {
  if (value == null) return "";

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => toTextBlock(item))
      .filter(Boolean)
      .join("\n");
    return cleanText(joined);
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const preferredKeys = ["title", "company", "institution", "position", "degree", "description", "name"];

    const parts = preferredKeys
      .map((key) => toTextBlock(obj[key]))
      .filter(Boolean);

    if (parts.length > 0) {
      return cleanText(parts.join(" | "));
    }

    const fallback = Object.values(obj)
      .map((item) => toTextBlock(item))
      .filter(Boolean)
      .slice(0, 5)
      .join(" | ");

    return cleanText(fallback);
  }

  const text = String(value).trim();
  if (!text || text === "[object Object]") return "";
  return cleanText(text);
};

const firstDefined = (...values: unknown[]) => {
  for (const value of values) {
    const text = toTextBlock(value);
    if (text) return text;
  }
  return "";
};

export default function SummaryReportsScreen() {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const { data: applicationsData, isLoading: appsLoading } = useGetApplicationsQuery();
  const { data: hiringFunnelData, isLoading: isFunnelLoading } = useGetHiringFunnelQuery();

  // Sort applications by most recent first
  const applicationsList = (() => {
    const raw = Array.isArray(applicationsData?.data)
      ? applicationsData.data
      : (applicationsData?.data as any)?.items ?? [];
    // Deduplicate by application id (backend occasionally returns duplicates)
    const byId = new Map<string, any>();
    for (const app of raw ?? []) {
      const id = String(app?.id ?? "");
      if (!id) continue;
      const existing = byId.get(id);
      if (!existing) {
        byId.set(id, app);
        continue;
      }
      const existingTime = new Date(existing.applied_at || 0).getTime();
      const nextTime = new Date(app.applied_at || 0).getTime();
      if (nextTime >= existingTime) byId.set(id, app);
    }

    return [...byId.values()].sort((a, b) => {
      const dateA = new Date(a.applied_at || 0).getTime();
      const dateB = new Date(b.applied_at || 0).getTime();
      return dateB - dateA;
    });
  })();

  const hiringFunnel = hiringFunnelData?.data ?? [];
  const getFunnelCount = (label: "applications" | "in_review" | "interview" | "offer" | "hired" | "rejected") => {
    const byLabel = hiringFunnel.find((item: any) => {
      const stage = normalizeStageLabel(String(item?.stage ?? ""));
      if (label === "applications") return stage.toLowerCase().includes("appl");
      if (label === "in_review") return stage === "In Review";
      if (label === "interview") return stage === "Interview";
      if (label === "offer") return stage === "Offer";
      if (label === "hired") return stage === "Hired";
      if (label === "rejected") return stage === "Rejected";
      return false;
    });
    return Number(byLabel?.count ?? 0);
  };

  const metrics = [
    { title: "Applications", value: getFunnelCount("applications"), icon: Users },
    { title: "In Review", value: getFunnelCount("in_review"), icon: Clock3 },
    { title: "Interviews", value: getFunnelCount("interview"), icon: MessageSquare },
    { title: "Offers", value: getFunnelCount("offer"), icon: Handshake },
    { title: "Hired", value: getFunnelCount("hired"), icon: UserCheck },
    { title: "Rejected", value: getFunnelCount("rejected"), icon: UserX },
  ];

  const overallRows = applicationsList.map((app: any, index: number) => {
    const name = app.candidate
      ? `${app.candidate.first_name ?? ""} ${app.candidate.last_name ?? ""}`.trim()
      : `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim() || "Unknown";
    const email = app.candidate?.email || app.email || "";
    const phone = app.candidate?.phone || app.phone || "";

    const academicQualifications = firstDefined(
      app.last_education,
      app.candidate?.last_education,
      app.job?.education_requirements,
      app?.metadata?.last_education,
      app?.metadata?.resume_data?.last_education,
      app?.metadata?.parsed_cv?.education,
      app?.metadata?.cv_extract?.education,
    ) || "N/A";

    const industrialExperience = firstDefined(
      [app.current_position, app.years_experience ? `${app.years_experience} years` : ""].filter(Boolean).join(" | "),
      app.summary,
      app.candidate?.summary,
      app?.metadata?.resume_data?.job_history,
      app?.metadata?.job_history,
      app?.metadata?.parsed_cv?.experience,
      app?.metadata?.cv_extract?.experience,
    ) || "N/A";

    const summaryText = firstDefined(app.summary, app.candidate?.summary);
    const mobilizationFromSummary = /fundraising|resource mobilization|partnership|donor|grant/i.test(summaryText)
      ? summaryText
      : "";

    const mobilizationExperience = firstDefined(
      app?.metadata?.fundraising_experience,
      app?.metadata?.resource_mobilization_experience,
      app?.metadata?.parsed_cv?.fundraising,
      app?.metadata?.cv_extract?.fundraising,
      mobilizationFromSummary,
      app?.metadata?.ai_summary,
    ) || "N/A";

    return {
      id: String(app?.id ?? index),
      name: [name, email, phone].filter(Boolean).join("\n"),
      academicQualifications,
      industrialExperience,
      mobilizationExperience,
    };
  });

  const generateSummary = async (customPrompt?: string) => {
    if (applicationsList.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const token =
        (session as any)?.tokens?.access_token ||
        (session as any)?.tokens?.accessToken ||
        (session as any)?.accessToken ||
        (session as any)?.token;
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch("/api/admin/summary-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applications: applicationsList,
          prompt: customPrompt || undefined,
        }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const message =
          data?.error ||
          (res.status === 503
            ? "AI summaries are not configured. Please set GOOGLE_API_KEY."
            : "Failed to generate summary");
        setError(message);
        return;
      }
      setSummary(data.summary || "");
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    generateSummary(prompt.trim());
    setPrompt("");
  };

  const handlePrintOverallReport = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Summary Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-generated insights on candidates and applications
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Data scope: {applicationsList.length} applications included in this overall report
          </p>
        </div>
        <Button
          onClick={() => generateSummary()}
          disabled={isLoading || appsLoading || applicationsList.length === 0}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {isLoading ? "Generating..." : "Generate AI Summary"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{metric.title}</p>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold mt-2">
                {isFunnelLoading ? "..." : metric.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overall-report-print-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base">Candidates&apos; CV Summaries</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-1">
                Overall report format for all candidates in the current pipeline
              </p>
            </div>
            <div className="no-print">
              <Button variant="outline" size="sm" onClick={handlePrintOverallReport}>
                Print / Save as PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {appsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : overallRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No candidate records available for overall summary.</p>
          ) : (
            <div className="overall-report-sheet overflow-x-auto border rounded-md bg-white">
              <div className="overall-report-header p-4 border-b">
                <h3 className="text-center font-semibold text-base">Candidates&apos; CV Summaries</h3>
                <p className="text-center text-xs text-muted-foreground mt-1">
                  Generated on {new Date().toLocaleDateString()} | Total candidates: {overallRows.length}
                </p>
              </div>
              <table className="w-full text-sm border-collapse overall-report-table">
                <thead className="bg-muted/40">
                  <tr className="border-b">
                    <th className="text-left align-top p-3 border-r min-w-[220px]">Name</th>
                    <th className="text-left align-top p-3 border-r min-w-[260px]">Academic Qualifications</th>
                    <th className="text-left align-top p-3 border-r min-w-[320px]">Industrial Experience</th>
                    <th className="text-left align-top p-3 min-w-[360px]">Fundraising &amp; Resource Mobilization Experience</th>
                  </tr>
                </thead>
                <tbody>
                  {overallRows.map((row) => (
                    <tr key={row.id} className="border-b last:border-b-0">
                      <td className="align-top p-3 border-r whitespace-pre-wrap">{row.name}</td>
                      <td className="align-top p-3 border-r whitespace-pre-wrap">{row.academicQualifications}</td>
                      <td className="align-top p-3 border-r whitespace-pre-wrap">{row.industrialExperience}</td>
                      <td className="align-top p-3 whitespace-pre-wrap">{row.mobilizationExperience}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Applications ({applicationsList.length})
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  sorted by recent
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {appsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : applicationsList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 px-4">
                  No applications found.
                </p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto divide-y">
                  {applicationsList.map((app: any, index: number) => (
                    <div
                      key={`${String(app?.id ?? "unknown")}-${String(app?.applied_at ?? "")}-${index}`}
                      className="px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {app.candidate
                              ? `${app.candidate.first_name} ${app.candidate.last_name}`
                              : "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.job?.title || "Unknown position"}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Calendar className="size-3" />
                            {app.applied_at
                              ? new Date(app.applied_at).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs shrink-0 ${getStatusColor(app.stage || "Applied")}`}
                        >
                          {normalizeStageLabel(app.stage || "Applied")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Summary Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="min-h-[300px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Analysing applications...</p>
                </div>
              ) : summary ? (
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1">
                    <ReactMarkdown>{normalizeSummaryMarkdown(summary)}</ReactMarkdown>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateSummary()}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click &quot;Generate AI Summary&quot; to get AI-powered insights on your
                    candidate pipeline.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt / Command Box */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Refine or Query</CardTitle>
              <p className="text-xs text-muted-foreground">
                Ask follow-up questions or request specific analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='e.g. "Which candidates are best for the senior engineering role?" or "Summarize only candidates in the interview stage"'
                  rows={2}
                  className="resize-none flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleSendPrompt();
                    }
                  }}
                />
                <Button
                  onClick={handleSendPrompt}
                  disabled={isLoading || !prompt.trim() || applicationsList.length === 0}
                  className="self-end"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : "Send"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Press Ctrl+Enter to send
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .overall-report-print-card,
          .overall-report-print-card * {
            visibility: visible;
          }

          .overall-report-print-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
            background: #fff !important;
          }

          .no-print {
            display: none !important;
          }

          .overall-report-sheet {
            overflow: visible !important;
            border: 1px solid #000 !important;
            border-radius: 0 !important;
          }

          .overall-report-table {
            font-size: 11px !important;
          }

          .overall-report-table thead {
            display: table-header-group;
          }

          .overall-report-table tr,
          .overall-report-table td,
          .overall-report-table th {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          @page {
            size: A4 portrait;
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
}
