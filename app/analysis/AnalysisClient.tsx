"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type SearchAnalysisResponse = {
  keyword: string;
  group: string;
  age: number;
  window_minutes: number;
  matched_posts: number;
  analyzed_posts: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
};

function isSearchAnalysisResponse(x: unknown): x is SearchAnalysisResponse {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.keyword === "string" &&
    typeof o.group === "string" &&
    typeof o.age === "number" &&
    typeof o.window_minutes === "number" &&
    typeof o.matched_posts === "number" &&
    typeof o.analyzed_posts === "number" &&
    typeof o.positive_pct === "number" &&
    typeof o.neutral_pct === "number" &&
    typeof o.negative_pct === "number"
  );
}

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function DonutChart({
  positive,
  neutral,
  negative,
}: {
  positive: number;
  neutral: number;
  negative: number;
}) {
  const p = clampPct(positive);
  const n = clampPct(neutral);
  const ng = clampPct(negative);

  const total = p + n + ng;
  const pNorm = total > 0 ? (p / total) * 100 : 0;
  const nNorm = total > 0 ? (n / total) * 100 : 0;
  const ngNorm = total > 0 ? (ng / total) * 100 : 0;

  const r = 44;
  const c = 2 * Math.PI * r;

  const pLen = (pNorm / 100) * c;
  const nLen = (nNorm / 100) * c;
  const ngLen = (ngNorm / 100) * c;

  const stroke = 12;

  return (
    <svg viewBox="0 0 120 120" className="h-40 w-40">
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={stroke}
        className="dark:stroke-white/10"
      />

      <g transform="rotate(-90 60 60)">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(16,185,129,0.85)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${pLen} ${c - pLen}`}
          strokeDashoffset={0}
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(148,163,184,0.9)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${nLen} ${c - nLen}`}
          strokeDashoffset={-pLen}
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(244,63,94,0.85)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${ngLen} ${c - ngLen}`}
          strokeDashoffset={-(pLen + nLen)}
        />
      </g>

      <circle cx="60" cy="60" r={r - stroke / 2} fill="rgba(255,255,255,0.75)" className="dark:fill-black/35" />
      <text x="60" y="56" textAnchor="middle" className="fill-zinc-900 text-[10px] font-semibold dark:fill-zinc-50">
        Sentiment
      </text>
      <text x="60" y="72" textAnchor="middle" className="fill-zinc-600 text-[9px] dark:fill-zinc-300">
        {total > 0 ? "100%" : "0%"}
      </text>
    </svg>
  );
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
  const [effectiveKeyword, setEffectiveKeyword] = useState<string>(() => {
    const fromProp = (keyword ?? "").trim();
    if (fromProp) return fromProp;
    if (typeof window === "undefined") return "";
    return (new URLSearchParams(window.location.search).get("keyword") ?? "").trim();
  });
  const [effectiveGroup, setEffectiveGroup] = useState<string>(() => {
    const fromProp = (group ?? "female").trim() || "female";
    if (typeof window === "undefined") return fromProp;
    return (new URLSearchParams(window.location.search).get("group") ?? fromProp).trim() || "female";
  });
  const [effectiveAge, setEffectiveAge] = useState<number>(() => {
    const fromProp = age || 20;
    if (typeof window === "undefined") return fromProp;
    return Number(new URLSearchParams(window.location.search).get("age") ?? String(fromProp)) || fromProp;
  });

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
  const [payload, setPayload] = useState<SearchAnalysisResponse | null>(null);

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
        minutes: "2000",
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
      if (!isSearchAnalysisResponse(data)) {
        throw new Error("API 응답 형식이 예상과 다릅니다.");
      }
      setPayload(data);
    } catch (e) {
      setPayload(null);
      setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [safeKeyword, safeGroup, safeAge]);

  useEffect(() => {
    if (!safeKeyword) return;
    void load();
  }, [load]);

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
            {!payload ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">표시할 데이터가 없습니다.</p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      감성 비율
                    </div>
                    <div className="mt-4 flex items-center gap-5">
                      <DonutChart
                        positive={payload.positive_pct}
                        neutral={payload.neutral_pct}
                        negative={payload.negative_pct}
                      />
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                            긍정
                          </div>
                          <div className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                            {payload.positive_pct.toFixed(1)}%
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-400/90" />
                            중립
                          </div>
                          <div className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                            {payload.neutral_pct.toFixed(1)}%
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                            부정
                          </div>
                          <div className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                            {payload.negative_pct.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                      분석 요약
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-black/5 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-black/35">
                        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">키워드</div>
                        <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                          {payload.keyword}
                        </div>
                      </div>
                      <div className="rounded-xl border border-black/5 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-black/35">
                        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">대상</div>
                        <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                          {payload.group} · {payload.age}대
                        </div>
                      </div>
                      <div className="rounded-xl border border-black/5 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-black/35">
                        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">윈도우(분)</div>
                        <div className="mt-1 font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                          {payload.window_minutes}
                        </div>
                      </div>
                      <div className="rounded-xl border border-black/5 bg-white/70 p-3 text-sm dark:border-white/10 dark:bg-black/35">
                        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">매칭/분석 게시글</div>
                        <div className="mt-1 font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                          {payload.matched_posts} / {payload.analyzed_posts}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

