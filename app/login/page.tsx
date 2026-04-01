 "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@naver.com");
  const [password, setPassword] = useState("admin1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<{ access_token: string; token_type: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);

    try {
      const res = await apiPost<{ access_token: string; token_type: string }>("/auth/login", {
        email,
        password,
      });
      setOk(res);
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("token_type", res.token_type);
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="surface noise w-full max-w-md rounded-2xl p-6">
        <div className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          로그인
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          이메일/비밀번호로 로그인합니다. 성공 시 토큰을 로컬에 저장합니다.
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
            autoComplete="current-password"
            className="w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-indigo-400/60 focus:bg-white dark:border-white/10 dark:bg-black/40 dark:text-zinc-50"
          />

          {error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          {ok ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300">
              로그인 성공. 토큰이 저장되었습니다.
            </div>
          ) : null}

          <button
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-5 text-sm text-zinc-600 dark:text-zinc-400">
          계정이 없나요?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

