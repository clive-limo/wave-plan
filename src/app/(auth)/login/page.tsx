"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/layout/auth-shell";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <AuthShell
      side={{
        shape: "blob",
        color: "#FF6D29",
        title: "Welcome back, friend.",
        body:
          "The water's been waiting. Pick up where you left off — small steps, kind day.",
      }}
    >
      <Link href="/" className="btn btn-ghost mb-6 text-[13px]" style={{ padding: "8px 14px" }}>
        <Icon name="chevron-left" size={14} /> Back
      </Link>
      <Logo size={28} />
      <h1
        className="font-[family-name:var(--font-heading)] font-bold mt-6 mb-2"
        style={{ fontSize: 36, letterSpacing: "-0.02em" }}
      >
        Log in
      </h1>
      <p className="text-text-secondary mb-7 m-0">
        Pick up the day where you set it down.
      </p>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@goodthings.io"
            required
          />
        </div>
        <div>
          <div className="flex justify-between items-baseline">
            <label className="label">Password</label>
            <span className="text-xs text-sun-2">Forgot?</span>
          </div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least six brave letters"
            required
          />
        </div>

        {error && (
          <div className="pill pill-red self-start" style={{ textTransform: "none" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary mt-2"
          disabled={loading}
          style={{ padding: 14 }}
        >
          {loading ? "Catching the wave…" : "Log in"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="font-[family-name:var(--font-mono)] text-[11px] text-text-muted uppercase tracking-widest">
          or
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        type="button"
        className="btn btn-dark w-full"
        style={{ padding: 14 }}
        onClick={handleGoogleLogin}
      >
        <Icon name="google" size={18} /> Continue with Google
      </button>

      <p className="text-center mt-7 text-text-secondary text-[13px]">
        New around here?{" "}
        <Link href="/signup" className="text-sun-2 font-semibold">
          Make a wave →
        </Link>
      </p>
    </AuthShell>
  );
}
