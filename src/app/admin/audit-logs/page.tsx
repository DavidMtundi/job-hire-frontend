"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useGetAuditLogsQuery } from "~/apis/audit/queries";
import apiClient from "~/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Loader } from "~/components/loader";
import { Sparkles, Filter, Download, Calendar, User, Activity } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    user_id: "",
    action_type: "",
    entity_type: "",
    ai_used: undefined as boolean | undefined,
  });

  const { data: logsData, isLoading: logsLoading } = useGetAuditLogsQuery({
    page,
    page_size: pageSize,
    ...filters,
  });

  const { data: aiMetricsData, isLoading: metricsLoading, error: aiMetricsError } = useQuery({
    queryKey: ["ai-usage-metrics", "month"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/audit/ai-usage", { 
          params: { 
            period: "month"
          } 
        });
        return response.data;
      } catch (error: any) {
        // Silently handle errors - this is an optional feature
        // 403 errors mean user doesn't have permission (not admin/HR)
        // 404/500 errors mean endpoint doesn't exist or server error
        if (error?.response?.status !== 403) {
          console.warn("Failed to fetch AI usage metrics:", error?.response?.status, error?.response?.data);
        }
        return null;
      }
    },
    enabled: true,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logs = logsData?.data?.items || [];
  const totalCount = logsData?.data?.total_count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      user_id: "",
      action_type: "",
      entity_type: "",
      ai_used: undefined,
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Track all system actions and AI usage</p>
          </div>
        </div>

        {/* AI Usage Metrics */}
        {!metricsLoading && !aiMetricsError && aiMetricsData?.success && aiMetricsData?.data && Array.isArray(aiMetricsData.data) && aiMetricsData.data.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle>AI Usage Metrics (Last Month)</CardTitle>
              </div>
              <CardDescription>Summary of AI operations and estimated costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiMetricsData.data.map((metric: any, index: number) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900">{metric.action_type || "Unknown"}</p>
                    <p className="text-2xl font-bold text-blue-600">{metric.usage_count || 0}</p>
                    <p className="text-xs text-blue-700">
                      Model: {metric.ai_model || "N/A"} | Est. Cost: ${(metric.total_cost_estimate || 0).toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="User ID"
                value={filters.user_id}
                onChange={(e) => handleFilterChange("user_id", e.target.value)}
              />
              <Input
                placeholder="Action Type"
                value={filters.action_type}
                onChange={(e) => handleFilterChange("action_type", e.target.value)}
              />
              <Input
                placeholder="Entity Type"
                value={filters.entity_type}
                onChange={(e) => handleFilterChange("entity_type", e.target.value)}
              />
              <Select
                value={filters.ai_used === undefined ? "all" : filters.ai_used ? "true" : "false"}
                onValueChange={(value) =>
                  handleFilterChange("ai_used", value === "all" ? undefined : value === "true")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="AI Used" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">AI Used</SelectItem>
                  <SelectItem value="false">No AI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>
                  {totalCount} total entries | Page {page} of {totalPages}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <Loader mode="icon" />
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No audit logs found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-sm font-semibold">Timestamp</th>
                      <th className="text-left p-2 text-sm font-semibold">User</th>
                      <th className="text-left p-2 text-sm font-semibold">Action</th>
                      <th className="text-left p-2 text-sm font-semibold">Entity</th>
                      <th className="text-left p-2 text-sm font-semibold">AI</th>
                      <th className="text-left p-2 text-sm font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: any) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-sm">
                          {format(new Date(log.created_at), "MMM dd, yyyy HH:mm")}
                        </td>
                        <td className="p-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{log.user_role}</span>
                          </div>
                          <span className="text-xs text-gray-500">{log.user_id?.substring(0, 8)}...</span>
                        </td>
                        <td className="p-2 text-sm">
                          <Badge variant="outline">{log.action_type}</Badge>
                        </td>
                        <td className="p-2 text-sm">
                          <span className="text-gray-700">{log.entity_type}</span>
                        </td>
                        <td className="p-2 text-sm">
                          {log.ai_used ? (
                            <Badge className="bg-blue-500 hover:bg-blue-500">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {log.ai_model || "AI"}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Manual</Badge>
                          )}
                        </td>
                        <td className="p-2 text-sm">
                          {log.ai_cost_estimate && (
                            <span className="text-xs text-gray-500">
                              ${log.ai_cost_estimate.toFixed(4)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

