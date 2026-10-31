import { useCallback, useEffect, useState } from "react";

/** Fired when the server says the session is gone, so App can return to the sign-in screen. */
export const SESSION_EXPIRED = "stocka:session-expired";

/** Fired after an admin saves settings, so the shell can refetch (e.g. company name). */
export const SETTINGS_SAVED = "stocka:settings-saved";

export async function api<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/api/login") && !path.startsWith("/api/me"))
      window.dispatchEvent(new Event(SESSION_EXPIRED));
    throw new Error(data.error || "Something went wrong.");
  }
  return data as T;
}

export const get = <T = any>(path: string) => api<T>("GET", path);
export const post = <T = any>(path: string, body?: unknown) => api<T>("POST", path, body ?? {});
export const patch = <T = any>(path: string, body: unknown) => api<T>("PATCH", path, body);
export const put = <T = any>(path: string, body: unknown) => api<T>("PUT", path, body);
export const del = <T = any>(path: string) => api<T>("DELETE", path);

/** Builds "/api/x?a=1&b=2", skipping empty values. */
export function withQuery(path: string, params: Record<string, string | number | undefined | null>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

/**
 * Loads `path` on mount and whenever it changes (pass null to skip).
 * `reload()` refetches after a create/update/delete.
 */
export function useApi<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let stale = false;
    setLoading(true);
    get<T>(path)
      .then((d) => { if (!stale) { setData(d); setError(""); } })
      .catch((e) => { if (!stale) setError(e instanceof Error ? e.message : "Something went wrong."); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [path, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload, setData };
}
