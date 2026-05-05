"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/layout/auth-shell";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <AuthShell
      side={{
        shape: "flower",
        color: "#FF6FB5",
        title: "A new wave starts here.",
        body:
          "No streaks to defend yet. No quests overdue. Just the calm before — let's set up your first day together.",
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
        Make a wave
      </h1>
      <p className="text-text-secondary mb-7 m-0">
        About 90 seconds. We won&apos;t ask for your phone.
      </p>

      <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
        <div>
          <label className="label">What should we call you?</label>
          <input
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Sol, Mx. Sol, Captain Sol — your call"
            required
          />
        </div>
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
          <label className="label">
            Password{" "}
            <span className="normal-case text-text-faint font-normal">(6+ characters)</span>
          </label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Make it memorable, not clever"
            minLength={6}
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
          className="btn btn-primary mt-3"
          disabled={loading}
          style={{ padding: 14 }}
        >
          {loading ? "Setting the tide…" : "Make my wave"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
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
        onClick={handleGoogleSignup}
      >
        <Icon name="google" size={18} /> Continue with Google
      </button>

      <p className="text-center mt-6 text-text-secondary text-[13px]">
        Already on the water?{" "}
        <Link href="/login" className="text-sun-2 font-semibold">
          Log in →
        </Link>
      </p>
    </AuthShell>
  );
}
