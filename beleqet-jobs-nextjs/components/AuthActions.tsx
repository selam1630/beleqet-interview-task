"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, getSession, type AuthSession } from "@/lib/auth";

export default function AuthActions() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const sync = () => setSession(getSession());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("beleqet-auth", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("beleqet-auth", sync);
    };
  }, []);

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs text-muted">
          {session.user.firstName} · {session.user.role.replace("_", " ")}
        </span>
        <button
          onClick={clearSession}
          className="hidden sm:inline-block text-sm font-medium text-ink hover:text-brandGreen transition-colors"
        >
          Logout
        </button>
        <Link
          href="/post-job"
          className="inline-flex items-center rounded-full bg-brandGreen px-4 py-2 text-sm font-semibold text-white hover:bg-darkGreen transition-colors"
        >
          Post a Job
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="hidden sm:inline-block text-sm font-medium text-ink hover:text-brandGreen transition-colors"
      >
        Login / Sign Up
      </Link>
      <Link
        href="/post-job"
        className="inline-flex items-center rounded-full bg-brandGreen px-4 py-2 text-sm font-semibold text-white hover:bg-darkGreen transition-colors"
      >
        Post a Job
      </Link>
    </div>
  );
}

