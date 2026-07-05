"use client";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "EMPLOYER" | "JOB_SEEKER" | "FREELANCER";
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const SESSION_KEY = "beleqet.auth";

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }

  return data as T;
}

export function getSession() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("beleqet-auth"));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("beleqet-auth"));
}

export async function login(email: string, password: string) {
  const session = await request<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession(session);
  return session;
}

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: AuthUser["role"];
}) {
  const session = await request<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  saveSession(session);
  return session;
}

export async function authRequest<T>(path: string, options: RequestInit = {}) {
  const session = getSession();
  if (!session) throw new Error("Please login first.");

  return request<T>(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...options.headers,
    },
  });
}

