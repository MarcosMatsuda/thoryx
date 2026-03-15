export interface HttpClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000;
  }

  async get<T>(
    path: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>("GET", path, undefined, headers);
  }

  async post<T>(
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>("POST", path, body, headers);
  }

  async put<T>(
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", path, body, headers);
  }

  async delete<T>(
    path: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", path, undefined, headers);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const mergedHeaders = { ...this.defaultHeaders, ...headers };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: mergedHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
