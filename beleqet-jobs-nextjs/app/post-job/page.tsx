"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authRequest, getSession } from "@/lib/auth";

type Category = {
  id: string;
  slug: string;
  label: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const jobTypes = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "CONTRACT", label: "Contract" },
];

export default function PostJobPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const session = getSession();

  useEffect(() => {
    fetch(`${API_URL}/jobs/categories`)
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  async function ensureCompany(companyName: string) {
    const existing = await authRequest<unknown | null>("/users/company", { method: "GET" });
    if (existing) return existing;

    return authRequest("/users/company", {
      method: "POST",
      body: JSON.stringify({
        name: companyName,
        description: "Company profile created from the Beleqet frontend.",
        location: "Addis Ababa, Ethiopia",
      }),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const currentSession = getSession();
    if (!currentSession) {
      setError("Please login or create an employer account first.");
      return;
    }

    if (!["EMPLOYER", "ADMIN"].includes(currentSession.user.role)) {
      setError("Only employer accounts can post jobs.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const companyName = String(form.get("companyName") ?? "").trim();

    setLoading(true);
    try {
      await ensureCompany(companyName);
      await authRequest("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: String(form.get("title") ?? ""),
          companyName,
          description: String(form.get("description") ?? ""),
          location: String(form.get("location") ?? ""),
          type: String(form.get("type") ?? "FULL_TIME"),
          categoryId: String(form.get("categoryId") ?? ""),
          tags: String(form.get("tags") ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          salaryMin: Number(form.get("salaryMin")) || undefined,
          salaryMax: Number(form.get("salaryMax")) || undefined,
          featured: true,
          status: "PUBLISHED",
        }),
      });

      event.currentTarget.reset();
      setMessage("Job published successfully. It is now visible in Find Jobs.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-pageH1">Post a Job</h1>
      <p className="text-muted mt-4 leading-relaxed">
        Reach thousands of verified job seekers across Ethiopia. Employer accounts can publish directly to the live API.
      </p>

      {!session && (
        <div className="mt-6 rounded-xl border border-border bg-white p-5 text-sm text-muted">
          Please{" "}
          <Link href="/login?next=/post-job" className="font-semibold text-brandGreen hover:underline">
            login
          </Link>{" "}
          or{" "}
          <Link href="/register" className="font-semibold text-brandGreen hover:underline">
            create an employer account
          </Link>{" "}
          before posting.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-border bg-white p-7 space-y-4"
      >
        {message && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-brandGreen">{message}</p>}
        {error && <p className="rounded-lg bg-redAccent/10 px-3 py-2 text-sm text-redAccent">{error}</p>}

        <div>
          <label className="text-xs font-semibold text-ink">Job Title</label>
          <input name="title" required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink">Company</label>
            <input name="companyName" required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink">Location</label>
            <input name="location" required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink">Category</label>
            <select name="categoryId" required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen">
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink">Job Type</label>
            <select name="type" required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen">
              {jobTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink">Minimum Salary</label>
            <input name="salaryMin" type="number" min="0" className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink">Maximum Salary</label>
            <input name="salaryMax" type="number" min="0" className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink">Job Description</label>
          <textarea name="description" rows={5} required className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink">Tags</label>
          <input name="tags" placeholder="React, Marketing, Finance" className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen transition-colors disabled:opacity-60">
          {loading ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
