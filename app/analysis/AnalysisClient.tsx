"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type PostsSearchResponse = unknown;

function extractPosts(payload: unknown): unknown[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as unknown[];
  if (typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;
  const candidates = [obj.items, obj.posts, obj.results, obj.data];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

function postTitle(p: unknown): string {
  if (!p || typeof p !== "object") return "Untitled";
  const o = p as Record<string, unknown>;
  return (
    (typeof o.title === "string" && o.title) ||
    (typeof o.subject === "string" && o.subject) ||
    (typeof o.name === "string" && o.name) ||
    "Untitled"
  );
}

function postUrl(p: unknown): string | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  const u = o.url ?? o.link ?? o.href;
  return typeof u === "string" && u ? u : null;
}

export function AnalysisClient({
  keyword,
  group,
  age,
}: {
  keyword: string;
  group: string;
  age: number;
}) {
  const [effectiveKeyword, setEffectiveKeyword] = useState<string>((keyword ?? "").trim());
  const [effectiveGroup, setEffectiveGroup] = useState<string>(
    (group ?? "female").trim() || "female",
  );
  const [effectiveAge, setEffectiveAge] = useState<number>(age || 20);

  // If this page was prerendered without query, hydrate from the real URL.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search);
    const k = (fromUrl.get("keyword") ?? "").trim();
    const g = (fromUrl.get("group") ?? "").trim();
    const a = Number(fromUrl.get("age") ?? "") || 0;

    if (k && k !== effectiveKeyword) setEffectiveKeyword(k);
    if (g && g !== effectiveGroup) setEffectiveGroup(g);
    if (a && a !== effectiveAge) setEffectiveAge(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeKeyword = useMemo(() => (effectiveKeyword ?? "").trim(), [effectiveKeyword]);
  const safeGroup = useMemo(
    () => (effectiveGroup ?? "female").trim() || "female",
    [effectiveGroup],
  );
  const safeAge = useMemo(() => effectiveAge || 20, [effectiveAge]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<PostsSearchResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPayload(null);
    try {
      if (!safeKeyword) throw new Error("keyword 파라미터가 비어있습니다.");

      const qs = new URLSearchParams({
        keyword: safeKeyword,
        group: safeGroup,
        age: String(safeAge),
        limit: "10",
        minutes: "200",
      }).toString();

      const headers: HeadersInit = { accept: "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/posts/search?${qs}`, { method: "GET", headers });
      const text = await res.text();
      const data = text ? (JSON.parse(text) as unknown) : null;
      if (!res.ok) {
        const maybe = (data ?? {}) as { message?: string; error?: string };
        const msg =
          maybe.message ||
          maybe.error ||
          `요청에 실패했습니다. (${res.status} ${res.statusText})`;
        throw new Error(msg);
      }
      setPayload(data as PostsSearchResponse);
    } catch (e) {
      setPayload(null);
      setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [safeKeyword, safeGroup, safeAge]);

  useEffect(() => {
    void load();
  }, [load]);

  const posts = extractPosts(payload);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_15%_10%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(900px_circle_at_85%_30%,rgba(16,185,129,0.10),transparent_55%)] dark:bg-[radial-gradient(1200px_circle_at_15%_10%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(900px_circle_at_85%_30%,rgba(16,185,129,0.10),transparent_55%)]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/keywords"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-black/40">
              <span className="h-5 w-5 rounded-xl bg-gradient-to-br from-indigo-500/70 via-emerald-400/50 to-rose-400/55" />
            </span>
            키워드 랭킹으로
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              홈
            </Link>
            <Link href="/keywords" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              키워드보기
            </Link>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">분석</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
              키워드 분석
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              키워드:{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{safeKeyword || "-"}</span>{" "}
              · group={safeGroup} · age={safeAge}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs dark:bg-white/10">
                GET /api/posts/search?keyword=&amp;group=&amp;age=&amp;limit=&amp;minutes=
              </code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white disabled:opacity-60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:hover:bg-black/55"
          >
            {loading ? "불러오는 중…" : "새로고침"}
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
            {error}
          </div>
        ) : null}

        {loading && !payload && !error ? (
          <div className="surface noise mt-8 rounded-2xl p-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            게시글을 불러오는 중…
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="surface noise mt-8 rounded-2xl p-5 sm:p-6">
            {posts.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">결과가 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {posts.map((p, i) => {
                  const title = postTitle(p);
                  const url = postUrl(p);
                  return (
                    <li
                      key={`post-${i}`}
                      className="rounded-xl border border-black/5 bg-white/50 px-4 py-3 dark:border-white/10 dark:bg-black/25"
                    >
                      <div className="flex flex-col gap-1">
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="line-clamp-2 text-sm font-semibold text-zinc-950 hover:underline hover:decoration-indigo-500/60 hover:underline-offset-4 dark:text-zinc-50"
                          >
                            {title}
                          </a>
                        ) : (
                          <div className="line-clamp-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                            {title}
                          </div>
                        )}
                        {url ? (
                          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{url}</div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

