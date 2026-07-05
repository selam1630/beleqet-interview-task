"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import { login } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push(searchParams.get("next") ?? "/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="text-pageH1">Login</h1>
      <p className="text-sm text-muted mt-2">Access your Beleqet account to post jobs and manage applications.</p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-border bg-white p-7 space-y-4">
        {error && <p className="rounded-lg bg-redAccent/10 px-3 py-2 text-sm text-redAccent">{error}</p>}

        <div>
          <label className="text-xs font-semibold text-ink">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-muted mt-5 text-center">
        Need an account?{" "}
        <Link href="/register" className="font-semibold text-brandGreen hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-page py-16 text-sm text-muted">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
