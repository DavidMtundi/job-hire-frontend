import Axios from "axios";
import { API_CONFIG } from "~/lib/http/api-config";
import { attachRequestInterceptor } from "~/lib/http/request-interceptor";
import { attachResponseInterceptor } from "~/lib/http/response-interceptor";
import { getApiBaseUrl } from "~/lib/http/base-url";

/**
 * HTTP client: request flow
 * 1. Request interceptor normalizes base URL, classifies public vs protected routes, attaches Bearer token.
 * 2. Backend responds or errors.
 * 3. Response interceptor retries once on 401 after refresh; maps errors to ApiError.
 */
const apiClient = Axios.create({
  baseURL: getApiBaseUrl(),
  timeout: API_CONFIG.timeout,
});

attachRequestInterceptor(apiClient);
attachResponseInterceptor(apiClient);

export default apiClient;

export { getApiBaseUrl, normalizeBaseUrl } from "~/lib/http/base-url";
export { classifyRequestEndpoint, urlMatchesEndpoint } from "~/lib/http/endpoint-classification";
