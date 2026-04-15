"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../lib/api";

type RankingsResponse = {
  group: string;
  age: number;
  window_hours: number;
  items: { keyword: string; count: number }[];
};

const GROUPS = [
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
] as const;

const AGES = [10, 20, 30, 40, 50] as const;

function groupLabel(code: string) {
  const g = GROUPS.find((x) => x.value === code);
  return g?.label ?? code;
}


export default function KeywordsPage() {
  const [group, setGroup] = useState<string>("female");
  const [age, setAge] = useState<number>(20);
  const [data, setData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<RankingsResponse>("/rankings", { group, age });
      setData(res);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [group, age]);

  useEffect(() => {
    void load();
  }, [load]);

  const maxCount = data?.items.length
    ? Math.max(...data.items.map((i) => i.count), 1)
    : 1;

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_15%_10%,rgba(99,102,241,0.12),transparent_55%),radial-gradient(900px_circle_at_85%_30%,rgba(16,185,129,0.10),transparent_55%)] dark:bg-[radial-gradient(1200px_circle_at_15%_10%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(900px_circle_at_85%_30%,rgba(16,185,129,0.10),transparent_55%)]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-black/40">
              <span className="h-5 w-5 rounded-xl bg-gradient-to-br from-indigo-500/70 via-emerald-400/50 to-rose-400/55" />
            </span>
            MODU Trend
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-700 dark:text-zinc-300">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              홈
            </Link>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              키워드보기
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
          키워드 랭킹
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs dark:bg-white/10">
            GET /rankings?group=&amp;age=
          </code>{" "}
          결과를 성별·연령별로 조회합니다.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                그룹
              </label>
              <div className="flex flex-wrap gap-2">
                {GROUPS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGroup(g.value)}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      group === g.value
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-black/10 bg-white/70 text-zinc-800 hover:bg-white dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:hover:bg-black/55",
                    ].join(" ")}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                연령
              </label>
              <select
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none focus:border-indigo-400/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-50"
              >
                {AGES.map((a) => (
                  <option key={a} value={a}>
                    {a}대
                  </option>
                ))}
              </select>
            </div>
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

        {loading && !data && !error ? (
          <div className="surface noise mt-8 rounded-2xl p-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            랭킹을 불러오는 중…
          </div>
        ) : null}

        {data && !error ? (
          <div className="surface noise mt-8 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/5 pb-4 dark:border-white/10">
              <div className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {groupLabel(data.group)} · {data.age}대
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                집계 구간{" "}
                <span className="font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
                  {data.window_hours}
                </span>
                시간
              </div>
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">불러오는 중…</p>
            ) : data.items.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
                표시할 키워드가 없습니다.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.items.map((item, idx) => (
                  <li key={`${item.keyword}-${idx}`}>
                    <Link
                      href={`/keywords/${encodeURIComponent(item.keyword)}?group=${encodeURIComponent(
                        group,
                      )}&age=${encodeURIComponent(String(age))}`}
                      className="flex items-center gap-4 rounded-xl border border-black/5 bg-white/50 px-3 py-2.5 transition hover:bg-white/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 dark:border-white/10 dark:bg-black/25 dark:hover:bg-black/35"
                      title="클릭해서 상세로 이동"
                    >
                      <span className="w-8 shrink-0 text-center text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-left font-medium text-zinc-950 dark:text-zinc-50">
                            {item.keyword}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                            {item.count}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500/80 to-emerald-500/60 transition-[width] duration-500"
                            style={{
                              width: `${Math.round((item.count / maxCount) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
