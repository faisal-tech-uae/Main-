"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";
import { API_BASE_URL } from "@/lib/config";
import { ApiClientError } from "@/lib/api-error";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = payload?.error?.message ?? res.statusText ?? "Request failed";
    throw new ApiClientError(res.status, message, payload?.error?.details);
  }

  return (payload?.data ?? payload) as T;
}

/** Client-side API hook: attaches the current Clerk session token to every request. */
export function useApi() {
  const { getToken } = useAuth();

  const request = useCallback(
    async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      let body: BodyInit | undefined;
      if (options.body !== undefined) {
        if (options.isFormData) {
          body = options.body as FormData;
        } else {
          headers["Content-Type"] = "application/json";
          body = JSON.stringify(options.body);
        }
      }

      const res = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body,
      });

      return parseResponse<T>(res);
    },
    [getToken]
  );

  return useMemo(
    () => ({
      get: <T>(path: string) => request<T>(path, { method: "GET" }),
      post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
      put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
      patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
      del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
      postForm: <T>(path: string, formData: FormData) => request<T>(path, { method: "POST", body: formData, isFormData: true }),
      downloadFile: async (path: string, filename: string) => {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}${path}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new ApiClientError(res.status, "Download failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      },
    }),
    [request, getToken]
  );
}
