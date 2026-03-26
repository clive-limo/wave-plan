import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight mb-3 font-[family-name:var(--font-heading)]">
          Wave Plan
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Track your quests. Guard your energy. Level up.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-white text-bg-primary font-medium rounded-md hover:bg-text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 border border-border text-text-primary rounded-md hover:bg-bg-card transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
