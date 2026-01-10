"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  useGetEEOTrackingQuery,
  useGetEEOSummaryQuery,
  useCreateEEOTrackingMutation,
  useGetComplianceDocumentsQuery,
  useCreateComplianceDocumentMutation,
  useGetComplianceReportsQuery,
  useCreateComplianceReportMutation,
} from "~/apis/compliance/queries";
import { FileText, Upload, FileCheck, BarChart3, Plus, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ComplianceManagementPage() {
  const [filters, setFilters] = useState({
    start_date: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: eeoTrackingData, error: eeoError } = useGetEEOTrackingQuery(filters);
  const { data: eeoSummaryData, error: eeoSummaryError } = useGetEEOSummaryQuery(filters);
  const { data: documentsData, error: documentsError } = useGetComplianceDocumentsQuery();
  const { data: reportsData, error: reportsError } = useGetComplianceReportsQuery(filters);

  const eeoTracking = eeoTrackingData?.data || [];
  const eeoSummary = eeoSummaryData?.data;
  const documents = documentsData?.data || [];
  const reports = reportsData?.data || [];

  // Check for permission errors
  const hasPermissionError = 
    (eeoError as any)?.response?.status === 403 ||
    (eeoSummaryError as any)?.response?.status === 403 ||
    (documentsError as any)?.response?.status === 403 ||
    (reportsError as any)?.response?.status === 403;

  // EEO Summary Chart
  const eeoChartOptions = {
    chart: {
      type: "bar" as const,
      height: 350,
    },
    xaxis: {
      categories: eeoSummary?.summary?.map((item) => `${item.gender || "Unknown"} - ${item.race_ethnicity || "Unknown"}`) || [],
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    colors: ["#3b82f6", "#10b981"],
    legend: {
      position: "top" as const,
    },
  };

  const eeoChartSeries = [
    {
      name: "Applications",
      data: eeoSummary?.summary?.map((item) => item.total_applications) || [],
    },
    {
      name: "Hired",
      data: eeoSummary?.summary?.map((item) => item.total_hired) || [],
    },
  ];

  if (hasPermissionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Permission Denied</CardTitle>
            <CardDescription>
              You don't have permission to view compliance data. Please contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Management</h1>
          <p className="text-muted-foreground">EEO tracking, documents, and compliance reports</p>
        </div>
      </div>

      <Tabs defaultValue="eeo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="eeo">EEO Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="eeo" className="space-y-4">
          {/* EEO Summary */}
          <Card>
            <CardHeader>
              <CardTitle>EEO Summary</CardTitle>
              <CardDescription>Hiring statistics by gender and race/ethnicity</CardDescription>
            </CardHeader>
            <CardContent>
              {eeoSummary && eeoSummary.summary.length > 0 && Chart ? (
                <Chart
                  options={eeoChartOptions}
                  series={eeoChartSeries}
                  type="bar"
                  height={350}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No EEO data available</p>
              )}
              {eeoSummary && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold">{eeoSummary.total_applications}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Hired</p>
                    <p className="text-2xl font-bold">{eeoSummary.total_hired}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Overall Hire Rate</p>
                    <p className="text-2xl font-bold">{eeoSummary.overall_hire_rate.toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* EEO Tracking Table */}
          <Card>
            <CardHeader>
              <CardTitle>EEO Tracking Records</CardTitle>
              <CardDescription>Individual application EEO data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Application ID</th>
                      <th className="text-left p-2">Gender</th>
                      <th className="text-left p-2">Race/Ethnicity</th>
                      <th className="text-left p-2">Veteran</th>
                      <th className="text-left p-2">Disability</th>
                      <th className="text-left p-2">Age Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eeoTracking.slice(0, 20).map((record) => (
                      <tr key={record.id} className="border-b">
                        <td className="p-2 text-sm font-mono">{record.application_id.slice(0, 8)}...</td>
                        <td className="p-2">{record.gender || "N/A"}</td>
                        <td className="p-2">{record.race_ethnicity || "N/A"}</td>
                        <td className="p-2">
                          {record.veteran_status !== null ? (record.veteran_status ? "Yes" : "No") : "N/A"}
                        </td>
                        <td className="p-2">
                          {record.disability_status !== null
                            ? record.disability_status
                              ? "Yes"
                              : "No"
                            : "N/A"}
                        </td>
                        <td className="p-2">{record.age_range || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Documents</CardTitle>
                  <CardDescription>Manage compliance-related documents</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Compliance Document</DialogTitle>
                      <DialogDescription>
                        Upload a compliance document (offer letter, contract, etc.)
                      </DialogDescription>
                    </DialogHeader>
                    <DocumentUploadForm />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No compliance documents uploaded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.file_name}</p>
                          <p className="text-sm text-gray-500">
                            {doc.document_type} • {doc.entity_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.document_type}</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Reports</CardTitle>
                  <CardDescription>Generated compliance and audit reports</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Compliance Report</DialogTitle>
                      <DialogDescription>
                        Create a new compliance report
                      </DialogDescription>
                    </DialogHeader>
                    <ReportGenerationForm />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No compliance reports generated</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{report.report_name}</p>
                          <p className="text-sm text-gray-500">
                            {report.report_type} • {format(new Date(report.report_period_start), "MMM d")} -{" "}
                            {format(new Date(report.report_period_end), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            report.status === "completed"
                              ? "default"
                              : report.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {report.status}
                        </Badge>
                        {report.file_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentUploadForm() {
  const [documentType, setDocumentType] = useState("offer_letter");
  const [entityType, setEntityType] = useState("application");
  const [entityId, setEntityId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const createDocumentMutation = useCreateComplianceDocumentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    // In a real implementation, upload file first, then create document record
    toast.info("File upload functionality will be implemented");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="document-type">Document Type</Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger id="document-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="offer_letter">Offer Letter</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="nda">NDA</SelectItem>
            <SelectItem value="background_check">Background Check</SelectItem>
            <SelectItem value="reference_check">Reference Check</SelectItem>
            <SelectItem value="i9_form">I-9 Form</SelectItem>
            <SelectItem value="w4_form">W-4 Form</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="entity-type">Entity Type</Label>
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger id="entity-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="application">Application</SelectItem>
            <SelectItem value="candidate">Candidate</SelectItem>
            <SelectItem value="job">Job</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="entity-id">Entity ID</Label>
        <Input
          id="entity-id"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Enter entity ID"
        />
      </div>
      <div>
        <Label htmlFor="file">File</Label>
        <Input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={createDocumentMutation.isPending}>
          {createDocumentMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>
    </form>
  );
}

function ReportGenerationForm() {
  const [reportType, setReportType] = useState("eeo1");
  const [reportName, setReportName] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const createReportMutation = useCreateComplianceReportMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReportMutation.mutateAsync({
        report_type: reportType,
        report_name: reportName || `${reportType.toUpperCase()} Report - ${startDate} to ${endDate}`,
        report_period_start: startDate,
        report_period_end: endDate,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="report-type">Report Type</Label>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger id="report-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="eeo1">EEO-1 Report</SelectItem>
            <SelectItem value="ofccp">OFCCP Report</SelectItem>
            <SelectItem value="custom">Custom Report</SelectItem>
            <SelectItem value="audit_summary">Audit Summary</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="report-name">Report Name</Label>
        <Input
          id="report-name"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="Enter report name (optional)"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={createReportMutation.isPending}>
          {createReportMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Report"
          )}
        </Button>
      </div>
    </form>
  );
}

