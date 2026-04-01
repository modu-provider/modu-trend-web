 "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@naver.com");
  const [password, setPassword] = useState("admin1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<{ id: number; email: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await apiPost<{ id: number; email: string }>("/auth/register", {
        email,
        password,
      });
      setOk(res);
      router.push("/login");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "회원가입에 실패했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="surface noise w-full max-w-md rounded-2xl p-6">
        <div className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          회원가입
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          이메일/비밀번호로 회원가입 후 로그인으로 이동합니다.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-indigo-400/60 focus:bg-white dark:border-white/10 dark:bg-black/40 dark:text-zinc-50"
          />
          <input
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-indigo-400/60 focus:bg-white dark:border-white/10 dark:bg-black/40 dark:text-zinc-50"
          />

          {error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          ) : null}
          {ok ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300">
              가입 완료: {ok.email} (id: {ok.id})
            </div>
          ) : null}

          <button
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}

