export type ApiErrorMetadata = {
  status?: number | null;
  code?: string | number | null;
  responseData?: unknown;
  url?: string | null;
  method?: string | null;
};

export default class ApiError extends Error {
  public readonly metadata?: ApiErrorMetadata;

  constructor(message: string, public status_code: number, metadata?: ApiErrorMetadata) {
    super(message);
    this.name = "ApiError";
    this.metadata = metadata;
  }
}
