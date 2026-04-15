"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "../lib/api";

type RankingsResponse = {
  group: string;
  age: number;
  window_hours: number;
  items: { keyword: string; count: number }[];
};

type PostsSearchResponse = unknown;

const GROUPS = [
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
] as const;

const AGES = [10, 20, 30, 40, 50] as const;

function groupLabel(code: string) {
  const g = GROUPS.find((x) => x.value === code);
  return g?.label ?? code;
}

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

export default function KeywordsPage() {
  const [group, setGroup] = useState<string>("female");
  const [age, setAge] = useState<number>(20);
  const [data, setData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const postsSectionRef = useRef<HTMLElement | null>(null);

  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsPayload, setPostsPayload] = useState<PostsSearchResponse | null>(null);

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

  const loadPosts = useCallback(
    async (keyword: string) => {
      setSelectedKeyword(keyword);
      setPostsLoading(true);
      setPostsError(null);
      postsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      try {
        const res = await apiGet<PostsSearchResponse>("/posts/search", {
          keyword,
          group,
          age,
          limit: 10,
          minutes: 200,
        });
        setPostsPayload(res);
      } catch (e) {
        setPostsPayload(null);
        setPostsError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
      } finally {
        setPostsLoading(false);
      }
    },
    [group, age],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSelectedKeyword(null);
    setPostsError(null);
    setPostsPayload(null);
    setPostsLoading(false);
  }, [group, age]);

  const maxCount = data?.items.length
    ? Math.max(...data.items.map((i) => i.count), 1)
    : 1;

  const posts = extractPosts(postsPayload);

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
              <>
                {selectedKeyword ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/5 bg-white/60 px-3 py-2 text-xs text-zinc-700 dark:border-white/10 dark:bg-black/30 dark:text-zinc-300">
                    <div className="min-w-0 truncate">
                      선택됨:{" "}
                      <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                        {selectedKeyword}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {postsLoading ? (
                        <span className="font-medium">게시글 불러오는 중…</span>
                      ) : postsError ? (
                        <span className="font-medium text-rose-700 dark:text-rose-300">
                          {postsError}
                        </span>
                      ) : (
                        <span className="font-medium">
                          {posts.length}개 결과
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}

                <ul className="mt-4 space-y-3">
                {data.items.map((item, idx) => (
                  <li
                    key={`${item.keyword}-${idx}`}
                    className="flex items-center gap-4 rounded-xl border border-black/5 bg-white/50 px-3 py-2.5 dark:border-white/10 dark:bg-black/25"
                  >
                    <span className="w-8 shrink-0 text-center text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => void loadPosts(item.keyword)}
                          className={[
                            "min-w-0 truncate text-left font-medium transition cursor-pointer",
                            "hover:underline hover:decoration-indigo-500/60 hover:underline-offset-4",
                            selectedKeyword === item.keyword
                              ? "text-indigo-700 dark:text-indigo-300"
                              : "text-zinc-950 dark:text-zinc-50",
                          ].join(" ")}
                          title="클릭해서 게시글 보기"
                        >
                          {item.keyword}
                        </button>
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
                  </li>
                ))}
                </ul>
              </>
            )}
          </div>
        ) : null}

        <section ref={postsSectionRef} className="mt-8">
          <div className="surface noise rounded-2xl p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/5 pb-4 dark:border-white/10">
              <div className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                게시글 검색
                {selectedKeyword ? (
                  <span className="ml-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    “{selectedKeyword}”
                  </span>
                ) : null}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                <code className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">
                  GET /posts/search?keyword=&amp;group=&amp;age=&amp;limit=&amp;minutes=
                </code>
              </div>
            </div>

            {!selectedKeyword ? (
              <div className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
                위에서 키워드를 클릭하면 게시글을 불러옵니다.
              </div>
            ) : postsError ? (
              <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-300">
                {postsError}
              </div>
            ) : postsLoading ? (
              <div className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">불러오는 중…</div>
            ) : posts.length === 0 ? (
              <div className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
                결과가 없습니다.
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
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

            {selectedKeyword && postsPayload ? (
              <details className="mt-5">
                <summary className="cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  원본 응답 보기
                </summary>
                <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-black/5 bg-white/60 p-3 text-xs text-zinc-800 dark:border-white/10 dark:bg-black/30 dark:text-zinc-100">
                  {JSON.stringify(postsPayload, null, 2)}
                </pre>
              </details>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
