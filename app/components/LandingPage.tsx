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
      "성별/나이별로 어떤 ‘말’이 움직이는지",
      "어떤 이유로 ‘선호/불만’이 생기는지",
      "어디서 ‘확산’되고 있는지",
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
            <a href="#features" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              기능
            </a>
            <a href="#demo" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              데모
            </a>
            <a href="#pricing" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              가격
            </a>
            <a href="#faq" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              FAQ
            </a>
            <Link
              href="/keywords"
              className="hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              키워드보기
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
                    인터넷상의 데이터로
                    <span className="block">
                      <span className="bg-gradient-to-r from-indigo-600 via-emerald-500 to-rose-500 bg-clip-text text-transparent shimmer">
                        성별/나이별 ‘생각’
                      </span>
                      을 보여주는 서비스
                    </span>
                  </h1>
                </Reveal>

                <Reveal delayMs={140}>
                  <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    MODU Trend는 웹 상의 발화(키워드/맥락)를 수집·요약해 세그먼트별 반응 차이를 빠르게 이해하도록 돕습니다.
                    기획, 마케팅, 리서치, 제품 개선 의사결정에 바로 연결하세요.
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
                  클릭해보면 바로 체감돼요
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  성별/나이 탭과 주제를 바꾸면, 요약/키워드/감성/지표가 즉시 변경됩니다.
                </p>
              </div>
              <a
                href="#pricing"
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
                title="세그먼트별 요약"
                desc="같은 주제라도 성별/나이별로 달라지는 관심과 맥락을 압축해서 보여줍니다."
                accent="indigo"
              />
            </Reveal>
            <Reveal delayMs={120}>
              <FeatureCard
                title="키워드 + 감성 변화"
                desc="상위 키워드와 긍정/중립/부정 비율로 반응의 결을 빠르게 파악합니다."
                accent="emerald"
              />
            </Reveal>
            <Reveal delayMs={180}>
              <FeatureCard
                title="확산 신호 지표"
                desc="관심도·확산속도·전환가능성 같은 신호로 다음 액션 우선순위를 세웁니다."
                accent="rose"
              />
            </Reveal>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Pricing</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
                  팀 규모에 맞게 시작
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  (지금은 랜딩/프로토타입 UI입니다) 실제 요금제는 데이터량/채널 수/기능 범위에 맞춰 조정할 수 있어요.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              { name: "Starter", price: "₩0", desc: "개인/검증용", cta: "무료로 시작", hot: false },
              { name: "Team", price: "상담", desc: "팀 협업/공유", cta: "데모 요청", hot: true },
              { name: "Enterprise", price: "상담", desc: "대규모 데이터/보안", cta: "문의하기", hot: false },
            ].map((p, idx) => (
              <Reveal key={p.name} delayMs={80 + idx * 60}>
                <div
                  className={[
                    "surface noise rounded-2xl p-6 transition-all",
                    p.hot ? "ring-1 ring-indigo-500/30" : "",
                    "hover:-translate-y-0.5 hover:shadow-xl",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{p.name}</div>
                    {p.hot ? (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white">
                        추천
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                    {p.price}
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400"> / 월</span>
                  </div>
                  <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{p.desc}</div>
                  <ul className="mt-5 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500/70" /> 주제/세그먼트 비교
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500/70" /> 키워드/감성 요약
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500/70" /> 공유용 리포트
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Link
                      href="/signup"
                      className={[
                        "inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition",
                        p.hot
                          ? "bg-indigo-600 text-white hover:bg-indigo-500"
                          : "border border-black/10 bg-white/70 text-zinc-900 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:hover:bg-black/55",
                      ].join(" ")}
                    >
                      {p.cta}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

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

