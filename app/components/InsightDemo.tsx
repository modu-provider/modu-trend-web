"use client";

import { useMemo, useState } from "react";

type Gender = "전체" | "여성" | "남성";
type Age = "10대" | "20대" | "30대" | "40대" | "50대+";

type Insight = {
  title: string;
  summary: string;
  topTerms: { term: string; delta: number }[];
  sentiment: { positive: number; neutral: number; negative: number };
  signals: { label: string; value: number }[];
};

const GENDERS: Gender[] = ["전체", "여성", "남성"];
const AGES: Age[] = ["10대", "20대", "30대", "40대", "50대+"];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function formatDelta(delta: number) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta}%`;
}

function seededNumber(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

function makeInsight(topic: string, gender: Gender, age: Age): Insight {
  const s = `${topic}|${gender}|${age}`;
  const r1 = seededNumber(s + "|a");
  const r2 = seededNumber(s + "|b");
  const r3 = seededNumber(s + "|c");

  const basePos = 0.34 + (r1 - 0.5) * 0.18;
  const baseNeg = 0.20 + (r2 - 0.5) * 0.14;
  const baseNeu = clamp01(1 - basePos - baseNeg);
  const positive = Math.round(clamp01(basePos) * 100);
  const negative = Math.round(clamp01(baseNeg) * 100);
  const neutral = Math.max(0, 100 - positive - negative);

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
  const start = Math.floor((r3 * 1000) % terms.length);
  const topTerms = Array.from({ length: 5 }, (_, i) => {
    const term = terms[(start + i) % terms.length]!;
    const d = Math.round(((seededNumber(s + `|t${i}`) - 0.48) * 2) * 18);
    return { term, delta: d };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const signals = [
    { label: "관심도", value: Math.round(55 + r1 * 40) },
    { label: "확산속도", value: Math.round(45 + r2 * 45) },
    { label: "전환가능성", value: Math.round(40 + r3 * 50) },
  ];

  const detail =
    gender === "전체"
      ? "전체 흐름을 기준으로"
      : `${gender}의 반응을 기준으로`;

  const title = `${topic} · ${gender} · ${age}`;
  const summary = `${detail} ${age}에서 많이 언급되는 포인트를 요약했어요. 상위 키워드와 감성 비율, 신호 지표를 한 번에 비교하세요.`;

  return { title, summary, topTerms, sentiment: { positive, neutral, negative }, signals };
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "indigo" | "emerald" | "rose" }) {
  const bg =
    tone === "indigo"
      ? "from-indigo-500/70 to-indigo-400/40"
      : tone === "emerald"
        ? "from-emerald-500/70 to-emerald-400/40"
        : "from-rose-500/70 to-rose-400/40";
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 text-xs text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bg} shimmer`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <div className="w-10 text-right text-xs tabular-nums text-zinc-700 dark:text-zinc-300">{value}%</div>
    </div>
  );
}

export function InsightDemo() {
  const [topic, setTopic] = useState("요즘 인기 제품");
  const [gender, setGender] = useState<Gender>("전체");
  const [age, setAge] = useState<Age>("20대");

  const insight = useMemo(() => makeInsight(topic, gender, age), [topic, gender, age]);

  return (
    <div className="surface noise rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">미리보기</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            성별/나이별 생각을 한눈에
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            주제만 바꾸면 요약, 상위 키워드, 감성 비율, 신호 지표가 즉시 업데이트돼요.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <label className="text-xs text-zinc-600 dark:text-zinc-400">주제</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 새로 출시된 스마트폰"
            className="w-full sm:w-80 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none ring-0 transition focus:border-indigo-400/60 focus:bg-white dark:border-white/10 dark:bg-black/40 dark:text-zinc-50"
          />
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
        <div className="lg:col-span-3 rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
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

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-black/35">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">상위 키워드</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {insight.topTerms.map((t) => {
                  const up = t.delta >= 0;
                  return (
                    <div
                      key={t.term}
                      className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-sm text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
                    >
                      <span className="font-medium">{t.term}</span>
                      <span
                        className={[
                          "text-xs tabular-nums",
                          up ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
                        ].join(" ")}
                      >
                        {formatDelta(t.delta)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-black/35">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">감성 비율</div>
              <div className="mt-3 space-y-2">
                <Bar label="긍정" value={insight.sentiment.positive} tone="emerald" />
                <Bar label="중립" value={insight.sentiment.neutral} tone="indigo" />
                <Bar label="부정" value={insight.sentiment.negative} tone="rose" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">신호 지표</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">0–100</div>
          </div>

          <div className="mt-4 space-y-3">
            {insight.signals.map((s) => (
              <div key={s.label} className="rounded-xl border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-black/35">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{s.label}</div>
                  <div className="text-sm font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">{s.value}</div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500/70 via-emerald-400/50 to-rose-400/55 shimmer"
                    style={{ width: `${Math.max(0, Math.min(100, s.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-black/5 bg-white/70 p-3 text-xs leading-5 text-zinc-600 dark:border-white/10 dark:bg-black/35 dark:text-zinc-400">
            * 데모 화면입니다. 실제 서비스에서는 채널/기간/키워드 필터와 근거 문장(샘플)까지 함께 제공할 수 있어요.
          </div>
        </div>
      </div>
    </div>
  );
}

