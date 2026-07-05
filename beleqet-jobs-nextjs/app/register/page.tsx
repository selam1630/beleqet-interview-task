"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register, type AuthUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<AuthUser["role"]>("EMPLOYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      await register({
        firstName: String(form.get("firstName") ?? ""),
        lastName: String(form.get("lastName") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        role,
      });
      router.push(role === "EMPLOYER" ? "/post-job" : "/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16 max-w-lg">
      <h1 className="text-pageH1">Create Account</h1>
      <p className="text-sm text-muted mt-2">Register with the real backend authentication API.</p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-border bg-white p-7 space-y-4">
        {error && <p className="rounded-lg bg-redAccent/10 px-3 py-2 text-sm text-redAccent">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink">First Name</label>
            <input name="firstName" required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink">Last Name</label>
            <input name="lastName" required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink">Email</label>
          <input name="email" type="email" required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink">Password</label>
          <input name="password" type="password" required minLength={8} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink">Account Type</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as AuthUser["role"])}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen"
          >
            <option value="EMPLOYER">Employer</option>
            <option value="JOB_SEEKER">Job Seeker</option>
            <option value="FREELANCER">Freelancer</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-muted mt-5 text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brandGreen hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
