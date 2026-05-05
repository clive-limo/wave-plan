import { Sticker } from "@/components/ui/sticker";

export default function SettingsPage() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-5 min-h-[calc(100vh-200px)] text-center px-4">
      <Sticker shape="cloud" color="#FFC857" size={120} expression="happy" />
      <h1
        className="font-[family-name:var(--font-heading)] font-bold m-0"
        style={{ fontSize: 36, letterSpacing: "-0.02em" }}
      >
        Tune your wave
      </h1>
      <p className="text-text-secondary max-w-[440px] m-0">
        Notification rhythms, theme, integrations, and a &quot;do not disturb the
        universe&quot; mode are all coming soon. Until then, the defaults are kind
        to you.
      </p>
      <button className="btn btn-ghost">Email me when this lands</button>
    </div>
  );
}
