export type ApiErrorShape = {
  message?: string;
  error?: string;
  statusCode?: number;
};

function getApiBase() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  if (envBase) return envBase;
  // Dev-friendly default when env is not configured.
  if (typeof window !== "undefined") return "http://localhost:8000";
  return "";
}

function joinUrl(base: string, path: string) {
  if (!base) return path;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function pathSkipsAuth(path: string) {
  const p = path.startsWith("/") ? path.slice(1) : path;
  return p === "auth/login" || p === "auth/register";
}

function withAuthHeaders(path: string, base: Record<string, string>, initHeaders?: HeadersInit) {
  const headers = new Headers(base);
  if (initHeaders) {
    new Headers(initHeaders).forEach((value, key) => headers.set(key, value));
  }
  if (
    typeof window !== "undefined" &&
    !pathSkipsAuth(path) &&
    !headers.has("Authorization")
  ) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
}

export async function apiPost<TResponse>(
  path: string,
  body: unknown,
  init?: Omit<RequestInit, "method" | "body" | "headers"> & {
    headers?: HeadersInit;
  },
): Promise<TResponse> {
  const base = getApiBase();
  const url = joinUrl(base, path);

  const { headers: initHeaders, ...restInit } = init ?? {};
  const headers = withAuthHeaders(path, { "content-type": "application/json" }, initHeaders);

  const res = await fetch(url, {
    ...restInit,
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const maybe = (data ?? {}) as ApiErrorShape;
    const msg =
      maybe.message ||
      maybe.error ||
      `요청에 실패했습니다. (${res.status} ${res.statusText})`;
    throw new Error(msg);
  }

  return data as TResponse;
}

export async function apiGet<TResponse>(
  path: string,
  params?: Record<string, string | number>,
  init?: Omit<RequestInit, "method" | "headers"> & { headers?: HeadersInit },
): Promise<TResponse> {
  const base = getApiBase();
  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const qs =
    params && Object.keys(params).length > 0
      ? `?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : "";
  const url = `${joinUrl(base, urlPath)}${qs}`;

  const { headers: initHeaders, ...restInit } = init ?? {};
  const headers = withAuthHeaders(urlPath, { accept: "application/json" }, initHeaders);

  const res = await fetch(url, {
    ...restInit,
    method: "GET",
    headers,
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const maybe = (data ?? {}) as ApiErrorShape;
    const msg =
      maybe.message ||
      maybe.error ||
      `요청에 실패했습니다. (${res.status} ${res.statusText})`;
    throw new Error(msg);
  }

  return data as TResponse;
}

