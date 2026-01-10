/**
 * Analytics API Schemas
 */
import * as z from "zod";

export const TimeToFillMetricsSchema = z.object({
  job_id: z.string(),
  job_title: z.string(),
  department_name: z.string().nullable().optional(),
  job_posted_date: z.string(),
  filled_date: z.string().nullable().optional(),
  time_to_fill_days: z.number().nullable().optional(),
  recruiter_id: z.string().nullable().optional(),
  recruiter_name: z.string().nullable().optional(),
  total_applications: z.number(),
  total_hired: z.number(),
});

export const SourceOfHireMetricsSchema = z.object({
  source: z.string(),
  total_applications: z.number(),
  total_hired: z.number(),
  hire_rate_percent: z.number().nullable().optional(),
  avg_time_to_fill_days: z.number().nullable().optional(),
});

export const CostPerHireMetricsSchema = z.object({
  job_id: z.string(),
  job_title: z.string(),
  department_name: z.string().nullable().optional(),
  total_hired: z.number(),
  total_applications: z.number(),
  job_board_costs: z.number(),
  recruiter_time_cost: z.number(),
  interview_costs: z.number(),
  total_cost: z.number(),
  cost_per_hire: z.number(),
});

export const PipelineHealthMetricsSchema = z.object({
  stage: z.string(),
  count: z.number(),
  percentage: z.number().nullable().optional(),
});

export const RecruiterPerformanceMetricsSchema = z.object({
  recruiter_id: z.string(),
  recruiter_name: z.string(),
  recruiter_email: z.string().nullable().optional(),
  total_applications: z.number(),
  total_hired: z.number(),
  total_shortlisted: z.number(),
  total_interviews: z.number(),
  hire_rate_percent: z.number().nullable().optional(),
  avg_time_to_fill_days: z.number().nullable().optional(),
  applications_last_30_days: z.number(),
});

export const ConversionFunnelMetricsSchema = z.object({
  stage: z.string(),
  count: z.number(),
  previous_stage_count: z.number().nullable().optional(),
  conversion_rate_percent: z.number().nullable().optional(),
});

export type TTimeToFillMetrics = z.infer<typeof TimeToFillMetricsSchema>;
export type TSourceOfHireMetrics = z.infer<typeof SourceOfHireMetricsSchema>;
export type TCostPerHireMetrics = z.infer<typeof CostPerHireMetricsSchema>;
export type TPipelineHealthMetrics = z.infer<typeof PipelineHealthMetricsSchema>;
export type TRecruiterPerformanceMetrics = z.infer<typeof RecruiterPerformanceMetricsSchema>;
export type TConversionFunnelMetrics = z.infer<typeof ConversionFunnelMetricsSchema>;

export interface IAnalyticsSummary {
  time_to_fill: {
    data: TTimeToFillMetrics[];
    summary: {
      total_jobs: number;
      filled_jobs: number;
      avg_time_to_fill_days: number | null;
      min_time_to_fill_days: number | null;
      max_time_to_fill_days: number | null;
    };
  };
  source_of_hire: {
    data: TSourceOfHireMetrics[];
    summary: {
      total_sources: number;
      total_hired: number;
      top_source: TSourceOfHireMetrics | null;
    };
  };
  cost_per_hire: {
    data: TCostPerHireMetrics[];
    summary: {
      total_jobs: number;
      total_hired: number;
      total_cost: number;
      avg_cost_per_hire: number;
    };
  };
  pipeline_health: TPipelineHealthMetrics[];
  recruiter_performance: TRecruiterPerformanceMetrics[];
  conversion_funnel: TConversionFunnelMetrics[];
}

