import * as z from "zod";

const questionDifficulty = ["easy", "medium", "difficult"] as const;

export const AIQuestionSchema = z.object({
  question: z.string(),
  difficulty: z.enum(questionDifficulty),
});

export const AIQuestionsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  status_code: z.number(),
  data: z.array(AIQuestionSchema),
});

export type TAIQuestion = z.infer<typeof AIQuestionSchema>;
export type TAIQuestionsResponse = z.infer<typeof AIQuestionsResponseSchema>;
export type TQuestionDifficulty = typeof questionDifficulty[number];

export const MarkAIInterviewDataSchema = z.object({
  interview_id: z.string(),
  ai_interview: z.boolean(),
});

export const MarkAIInterviewResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  status_code: z.number(),
  data: MarkAIInterviewDataSchema,
});

export type TMarkAIInterviewData = z.infer<typeof MarkAIInterviewDataSchema>;
export type TMarkAIInterviewResponse = z.infer<typeof MarkAIInterviewResponseSchema>;

export const AIInterviewLinkDataSchema = z.object({
  url: z.string(),
});

export const AIInterviewLinkResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  status_code: z.number(),
  data: AIInterviewLinkDataSchema,
});

export type TAIInterviewLinkData = z.infer<typeof AIInterviewLinkDataSchema>;
export type TAIInterviewLinkResponse = z.infer<typeof AIInterviewLinkResponseSchema>;

export const SubmitAnswerResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  status_code: z.number(),
  data: z.any().optional(),
});

export type TSubmitAnswerResponse = z.infer<typeof SubmitAnswerResponseSchema>;
