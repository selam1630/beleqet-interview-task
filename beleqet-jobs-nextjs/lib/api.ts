import { categories as fallbackCategories, jobs as fallbackJobs, type Job } from "@/lib/mockData";

export type Category = {
  id: string;
  label: string;
  count: string;
  icon: string;
};

type ApiCompany = {
  name?: string | null;
};

type ApiCategory = {
  id: string;
  slug: string;
  label: string;
  icon?: string | null;
  _count?: {
    jobs?: number;
  };
};

type ApiJob = {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  type: string;
  featured?: boolean;
  tags?: string[];
  createdAt?: string;
  companyName?: string | null;
  company?: ApiCompany | null;
  category?: ApiCategory | null;
};

type JobsResponse = {
  items: ApiJob[];
  total: number;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

const typeLabels: Record<string, Job["type"]> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  CONTRACT: "Contract",
};

function postedAgo(date?: string) {
  if (!date) return "Recently";

  const created = new Date(date).getTime();
  const diffMs = Date.now() - created;
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function mapJob(job: ApiJob): Job {
  return {
    id: job.id,
    title: job.title,
    company: job.companyName ?? job.company?.name ?? "Verified Employer",
    location: job.location,
    type: typeLabels[job.type] ?? "Full Time",
    category: job.category?.slug ?? "",
    postedAgo: postedAgo(job.createdAt),
    featured: job.featured,
    description: job.description ?? "",
    tags: job.tags ?? [],
  };
}

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getJobs(params?: { q?: string; location?: string; category?: string; type?: string; limit?: number }) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.location) searchParams.set("location", params.location);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.type) searchParams.set("type", params.type);
    searchParams.set("limit", String(params?.limit ?? 50));

    const data = await apiFetch<JobsResponse>(`/jobs?${searchParams.toString()}`);
    return data.items.map(mapJob);
  } catch {
    return fallbackJobs;
  }
}

export async function getFeaturedJobs() {
  const jobs = await getJobs({ limit: 10 });
  return jobs.filter((job) => job.featured).slice(0, 5);
}

export async function getJob(id: string) {
  try {
    return mapJob(await apiFetch<ApiJob>(`/jobs/${id}`));
  } catch {
    return fallbackJobs.find((job) => job.id === id) ?? null;
  }
}

export async function getCategories() {
  try {
    const categories = await apiFetch<ApiCategory[]>("/jobs/categories");
    return categories.slice(0, 7).map((category): Category => ({
      id: category.slug,
      label: category.label,
      count: String(category._count?.jobs ?? 0),
      icon: category.icon ?? "briefcase",
    }));
  } catch {
    return fallbackCategories;
  }
}

