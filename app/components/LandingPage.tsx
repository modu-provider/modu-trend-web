"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InsightDemo } from "./InsightDemo";
import { Reveal } from "./Reveal";

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-white/10 dark:bg-black/40 dark:text-zinc-300">
      {children}
    </span>
  );
}

function FeatureCard({
  title,
  desc,
  accent,
}: {
  title: string;
  desc: string;
  accent: "indigo" | "emerald" | "rose";
}) {
  const ring =
    accent === "indigo"
      ? "hover:border-indigo-300/50 hover:shadow-indigo-500/10"
      : accent === "emerald"
        ? "hover:border-emerald-300/50 hover:shadow-emerald-500/10"
        : "hover:border-rose-300/50 hover:shadow-rose-500/10";

  return (
    <div
      className={[
        "group surface noise rounded-2xl p-5 transition-all",
        "hover:-translate-y-0.5 hover:shadow-xl",
        ring,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{desc}</p>
        </div>
        <div
          className={[
            "h-10 w-10 shrink-0 rounded-2xl border border-black/10 bg-white/70 shadow-sm",
            "dark:border-white/10 dark:bg-black/40",
          ].join(" ")}
        >
          <div
            className={[
              "m-1.5 h-7 w-7 rounded-xl bg-gradient-to-br shimmer",
              accent === "indigo"
                ? "from-indigo-500/70 to-indigo-300/40"
                : accent === "emerald"
                  ? "from-emerald-500/70 to-emerald-300/40"
                  : "from-rose-500/70 to-rose-300/40",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="surface noise rounded-2xl p-4">
      <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{note}</div>
    </div>
  );
}

export function LandingPage() {
  const y = useScrollY();
  const scrolled = y > 16;
  const [isAuthed, setIsAuthed] = useState(false);

  const heroBlurb = useMemo(
    () => [
      "커뮤니티 인기글에서 키워드를 추출해 흐름을 포착",
      "실시간 랭킹 1~10 키워드로 즉시 파악",
      "지금 뜨는 이슈를 한눈에",
    ],
    [],
  );

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("access_token")));

    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token") {
        setIsAuthed(Boolean(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    setIsAuthed(false);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_15%_10%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(900px_circle_at_85%_20%,rgba(16,185,129,0.12),transparent_55%),radial-gradient(900px_circle_at_50%_95%,rgba(236,72,153,0.10),transparent_55%)] dark:bg-[radial-gradient(1200px_circle_at_15%_10%,rgba(99,102,241,0.16),transparent_55%),radial-gradient(900px_circle_at_85%_20%,rgba(16,185,129,0.12),transparent_55%),radial-gradient(900px_circle_at_50%_95%,rgba(236,72,153,0.10),transparent_55%)]">
      <header
        className={[
          "sticky top-0 z-50",
          scrolled ? "bg-white/65 dark:bg-black/40 backdrop-blur-xl border-b border-black/5 dark:border-white/10" : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/10 bg-white/70 shadow-sm dark:border-white/10 dark:bg-black/40">
              <span className="h-5 w-5 rounded-xl bg-gradient-to-br from-indigo-500/70 via-emerald-400/50 to-rose-400/55 shimmer" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              MODU Trend
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-700 dark:text-zinc-300 sm:flex">
            <Link
              href="/keywords"
              className="hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              키워드 보기
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthed ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:hover:bg-black/55"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:hover:bg-black/55"
              >
                로그인
              </Link>
            )}
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 hover:shadow-md"
            >
              회원가입
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grad-orb" />
          <div className="absolute inset-0 opacity-[0.65] dark:opacity-[0.55]">
            <div className="mx-auto h-full max-w-6xl px-4 sm:px-6">
              <div className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/18 via-emerald-400/10 to-rose-400/12 blur-3xl" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-14 sm:px-6 sm:pb-18 sm:pt-20">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>데이터 기반 인사이트</Pill>
                <Pill>성별/나이별 비교</Pill>
                <Pill>요약 + 근거</Pill>
              </div>
            </Reveal>

            <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <Reveal delayMs={80}>
                  <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
                    커뮤니티 인기글로 읽는
                    <span className="block">
                      <span className="bg-gradient-to-r from-indigo-600 via-emerald-500 to-rose-500 bg-clip-text text-transparent shimmer">
                        실시간 키워드 랭킹 1~10
                      </span>
                      으로 보는 지금의 흐름
                    </span>
                  </h1>
                </Reveal>

                <Reveal delayMs={140}>
                  <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    사람들의 속마음이 잘 드러나는 커뮤니티의 인기글에서 키워드를 추출해,
                    지금 떠오르는 이슈를 랭킹 1~10으로 빠르게 파악하세요.
                  </p>
                </Reveal>

                <Reveal delayMs={200}>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href="#demo"
                      className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                      데모 보기
                    </a>
                    <a
                      href="#features"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white/70 px-5 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:hover:bg-black/55"
                    >
                      기능 살펴보기
                    </a>
                  </div>
                </Reveal>

                <Reveal delayMs={260}>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <Stat label="세그먼트" value="성별×연령" note="필요한 관점으로 분해" />
                    <Stat label="출력" value="요약/근거" note="왜 그런지까지 빠르게" />
                    <Stat label="비교" value="한 화면" note="차이를 명확히" />
                  </div>
                </Reveal>

                <Reveal delayMs={320}>
                  <ul className="mt-8 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {heroBlurb.map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>

              <Reveal delayMs={120} className="lg:justify-self-end">
                <div className="floaty">
                  <div className="surface noise rounded-3xl p-4 sm:p-5">
                    <div className="rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                          오늘의 흐름
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">프로토타입</div>
                      </div>
                      <div className="mt-3 grid gap-3">
                        <div className="h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-indigo-500/70 via-emerald-400/50 to-rose-400/55 shimmer" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-xl border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-black/35">
                            <div className="text-xs text-zinc-600 dark:text-zinc-400">관심도</div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">78</div>
                          </div>
                          <div className="rounded-xl border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-black/35">
                            <div className="text-xs text-zinc-600 dark:text-zinc-400">확산</div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">64</div>
                          </div>
                          <div className="rounded-xl border border-black/5 bg-white/70 p-3 dark:border-white/10 dark:bg-black/35">
                            <div className="text-xs text-zinc-600 dark:text-zinc-400">부정</div>
                            <div className="mt-1 text-lg font-semibold tabular-nums">21%</div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-black/5 bg-white/70 p-3 text-xs leading-5 text-zinc-600 dark:border-white/10 dark:bg-black/35 dark:text-zinc-400">
                          세그먼트를 바꿔가며 “왜” 반응이 갈리는지 확인해보세요.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="demo" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <Reveal>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Demo</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
                  열면 바로 보이는 실시간 랭킹
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  커뮤니티 인기글에서 추출된 키워드의 실시간 랭킹 1~10을 바로 확인하세요.
                </p>
              </div>
              <a
                href="/keywords"
                className="hidden sm:inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:hover:bg-black/55"
              >
                시작하기
              </a>
            </div>
          </Reveal>

          <Reveal delayMs={120}>
            <InsightDemo />
          </Reveal>
        </section>

        <section id="features" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <Reveal>
            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Features</div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
                한 번에 “요약 + 비교 + 근거”
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                데이터는 많고 시간은 없을 때, 중요한 포인트만 빠르게 잡도록 설계했습니다.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <Reveal delayMs={60}>
              <FeatureCard
                title="인기글 기반 키워드 추출"
                desc="커뮤니티에서 많이 본 글을 바탕으로 핵심 키워드를 뽑아 흐름을 잡습니다."
                accent="indigo"
              />
            </Reveal>
            <Reveal delayMs={120}>
              <FeatureCard
                title="실시간 반영"
                desc="인기글의 흐름 변화를 빠르게 반영해 최신 랭킹을 보여줍니다."
                accent="emerald"
              />
            </Reveal>
            <Reveal delayMs={180}>
              <FeatureCard
                title="실시간 키워드 랭킹 1~10"
                desc="지금 뜨는 키워드를 순위로 보여주어 우선순위를 빠르게 판단합니다."
                accent="rose"
              />
            </Reveal>
          </div>
        </section>

        {/* pricing section removed */}

        <section id="faq" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <Reveal>
            <div>
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">FAQ</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
                자주 묻는 질문
              </h2>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {[
              {
                q: "어떤 데이터 소스를 쓰나요?",
                a: "프로토타입 단계에서는 형태를 보여주기 위한 데모 데이터를 사용합니다. 실제 서비스에선 정책/약관을 준수하는 범위에서 채널을 선택하고, 수집·정제 파이프라인을 구성합니다.",
              },
              {
                q: "성별/나이 추정은 어떻게 하나요?",
                a: "데이터 특성과 허용 범위에 따라 접근이 달라집니다. 공개 프로필 기반, 설문/패널, 혹은 익명화된 통계 집계 형태 등 프라이버시를 최우선으로 설계합니다.",
              },
              {
                q: "결과의 근거를 볼 수 있나요?",
                a: "요약만으로 끝나지 않도록, 핵심 요약을 뒷받침하는 근거 문장(샘플)과 출처/기간/필터를 함께 제공하는 구성을 목표로 합니다.",
              },
              {
                q: "팀원들과 공유는 어떻게 하나요?",
                a: "대시보드 링크 공유, 슬랙/노션용 요약, 기간 비교 리포트 등 협업 기능을 중심으로 확장할 수 있어요.",
              },
            ].map((f, idx) => (
              <Reveal key={f.q} delayMs={60 + idx * 60}>
                <details className="surface noise group rounded-2xl p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/5 text-xs text-zinc-700 transition group-open:bg-indigo-600 group-open:text-white dark:bg-white/10 dark:text-zinc-300">
                      +
                    </span>
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        <footer className="border-t border-black/5 bg-white/40 py-10 dark:border-white/10 dark:bg-black/20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">MODU Trend</div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Link href="/login" className="hover:text-zinc-950 dark:hover:text-zinc-50">
                  로그인
                </Link>
                <Link href="/signup" className="hover:text-zinc-950 dark:hover:text-zinc-50">
                  회원가입
                </Link>
                <a href="#demo" className="hover:text-zinc-950 dark:hover:text-zinc-50">
                  데모
                </a>
              </div>
            </div>
            <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-500">
              © {new Date().getFullYear()} MODU Trend. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

