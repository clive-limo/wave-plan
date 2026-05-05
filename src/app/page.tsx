import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Sticker } from "@/components/ui/sticker";
import { Icon } from "@/components/ui/icon";

const STATS = [
  { n: "3.2x", l: "days you finish what you started" },
  { n: "47min", l: "of dread, gone — daily" },
  { n: "92%", l: "still here after 30 days" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary">
      {/* Sun glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[55%] -translate-x-1/2 rounded-full"
        style={{
          width: 1400,
          height: 1400,
          background:
            "radial-gradient(circle, #FFD23F 0%, #FF6D29 18%, rgba(255,109,41,0.4) 35%, rgba(255,109,41,0) 60%)",
          filter: "blur(40px)",
        }}
      />
      {/* Horizon line */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-[62%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,180,120,0.5), transparent)",
          boxShadow: "0 0 40px rgba(255,180,120,0.4)",
        }}
      />

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
        <Logo size={32} />
        <nav className="flex gap-2 items-center">
          <a className="btn btn-ghost text-[13px] hidden sm:inline-flex">How it works</a>
          <a className="btn btn-ghost text-[13px] hidden sm:inline-flex">Manifesto</a>
          <Link href="/login" className="btn btn-ghost">Log in</Link>
          <Link href="/signup" className="btn btn-primary">
            Get started <Icon name="arrow-right" size={14} />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-10 py-15 md:py-20 text-center">
        <span className="pill pill-sun mb-6 animate-float inline-flex">
          <Icon name="sparkle" size={12} /> A productivity app that doesn&apos;t hate you
        </span>

        <h1
          className="font-[family-name:var(--font-heading)] font-bold m-0"
          style={{
            fontSize: "clamp(48px, 7vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.04em",
          }}
        >
          Catch the day
          <br />
          <span
            style={{
              background:
                "linear-gradient(180deg, #FFE6B0 0%, #FF8F4D 50%, #FF3D2E 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            before it catches you.
          </span>
        </h1>

        <p className="text-[19px] text-text-secondary max-w-[620px] mx-auto mt-7 leading-[1.5]">
          Wave Plan turns the chaos of your week into a rideable wave — small quests,
          gentle gauges, tiny celebrations. Finish what matters. Feel good doing it.
        </p>

        <div className="flex justify-center gap-3 mt-9 flex-wrap">
          <Link
            href="/signup"
            className="btn btn-primary"
            style={{ padding: "16px 28px", fontSize: 15 }}
          >
            Start your first day — it&apos;s free <Icon name="arrow-right" size={16} />
          </Link>
          <Link
            href="/login"
            className="btn btn-ghost"
            style={{ padding: "16px 28px", fontSize: 15 }}
          >
            I already have a wave
          </Link>
        </div>

        {/* Floating stickers — hidden on small screens */}
        <div
          aria-hidden
          className="hidden md:block absolute pointer-events-none"
          style={{ left: "4%", top: "20%", animation: "float 5s ease-in-out infinite" }}
        >
          <Sticker shape="flower" color="#FF6FB5" size={84} expression="happy" tilt={-8} />
        </div>
        <div
          aria-hidden
          className="hidden md:block absolute pointer-events-none"
          style={{ right: "6%", top: "14%", animation: "float 6s ease-in-out infinite 0.5s" }}
        >
          <Sticker shape="star" color="#FFC857" size={72} expression="happy" tilt={12} />
        </div>
        <div
          aria-hidden
          className="hidden md:block absolute pointer-events-none"
          style={{ left: "10%", bottom: "8%", animation: "float 7s ease-in-out infinite 1s" }}
        >
          <Sticker shape="heart" color="#FF3D2E" size={64} expression="happy" tilt={-12} />
        </div>
        <div
          aria-hidden
          className="hidden md:block absolute pointer-events-none"
          style={{ right: "8%", bottom: "12%", animation: "float 5.5s ease-in-out infinite 1.5s" }}
        >
          <Sticker shape="hex" color="#2B6BFF" size={68} expression="open" tilt={8} />
        </div>
        <div
          aria-hidden
          className="hidden md:block absolute pointer-events-none"
          style={{ left: "20%", top: "5%", animation: "float 8s ease-in-out infinite" }}
        >
          <Sticker shape="cloud" color="#2DBE6C" size={56} expression="happy" tilt={5} />
        </div>

        {/* Stat row */}
        <div className="grid gap-4 mt-20 max-w-[800px] mx-auto grid-cols-1 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <div key={i} className="card-surface p-5 text-left">
              <div className="font-[family-name:var(--font-heading)] text-[36px] font-bold text-gold leading-none">
                {s.n}
              </div>
              <div className="text-[13px] text-text-secondary mt-1.5">{s.l}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
