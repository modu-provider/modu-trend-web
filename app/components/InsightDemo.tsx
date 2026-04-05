"use client";

import { useMemo, useState } from "react";

type Insight = {
  title: string;
  summary: string;
  ranked: { term: string; rank: number; delta: number; score: number }[];
};

type Gender = "전체" | "여성" | "남성";
type Age = "10대" | "20대" | "30대" | "40대" | "50대+";
const GENDERS: Gender[] = ["전체", "여성", "남성"];
const AGES: Age[] = ["10대", "20대", "30대", "40대", "50대+"];

function seededNumber(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function makeInsight(gender: Gender, age: Age): Insight {
  const s = `${gender}|${age}`;
  const terms = [
    "가성비",
    "브랜드",
    "후기",
    "트렌드",
    "신뢰",
    "디자인",
    "기능",
    "가격",
    "편의성",
    "지속가능",
  ];
  const rankedBase = terms.map((term, idx) => {
    const r = seededNumber(s + `|k${idx}`);
    const score = Math.round(50 + r * 50); // 50~100
    const delta = Math.round(((seededNumber(s + `|d${idx}`) - 0.5) * 2) * 15); // -15~+15
    return { term, score, delta };
  });
  const rankedSorted = rankedBase.sort((a, b) => b.score - a.score).map((item, i) => ({
    term: item.term,
    rank: i + 1,
    delta: item.delta,
    score: item.score,
  }));

  const isOverall = gender === "전체" && age === "20대";
  const title = `실시간 키워드 랭킹 1~10 · ${gender} · ${age}`;
  const summary = isOverall
    ? "전체 흐름 기준으로 커뮤니티 인기글에서 추출된 키워드 랭킹입니다."
    : `${gender} · ${age} 기준으로 커뮤니티 인기글에서 추출된 키워드 랭킹입니다.`;

  return { title, summary, ranked: rankedSorted };
}

export function InsightDemo() {
  const [gender, setGender] = useState<Gender>("전체");
  const [age, setAge] = useState<Age>("20대");
  const insight = useMemo(() => makeInsight(gender, age), [gender, age]);

  return (
    <div className="surface noise rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">미리보기</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            실시간 키워드 랭킹 1~10
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            커뮤니티 인기글에서 추출된 키워드 순위를 성별/나이에 따라 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-black/30">
          <div className="flex flex-wrap items-center gap-2">
            {GENDERS.map((g) => {
              const active = g === gender;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm transition",
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-black/5 text-zinc-800 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15",
                  ].join(" ")}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white/60 p-3 dark:border-white/10 dark:bg-black/30">
          <div className="flex flex-wrap items-center gap-2">
            {AGES.map((a) => {
              const active = a === age;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAge(a)}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm transition",
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-black/5 text-zinc-800 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15",
                  ].join(" ")}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-5 rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{insight.title}</div>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{insight.summary}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2 py-1 text-xs text-zinc-700 dark:border-white/10 dark:bg-black/40 dark:text-zinc-300">
                실시간 업데이트
              </span>
              <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2 py-1 text-xs text-zinc-700 dark:border-white/10 dark:bg-black/40 dark:text-zinc-300">
                비교 가능
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-black/35">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">실시간 키워드 랭킹 1~10</div>
            <div className="mt-3 space-y-2">
              {insight.ranked.slice(0, 10).map((k) => {
                return (
                  <div key={k.term} className="flex items-center gap-3">
                    <div className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                      {k.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate text-sm text-zinc-800 dark:text-zinc-100">{k.term}</div>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500/70 via-emerald-400/50 to-rose-400/55 shimmer"
                          style={{ width: `${Math.max(10, Math.min(100, k.score))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

