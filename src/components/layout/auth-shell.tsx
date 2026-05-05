import { Sticker, type StickerShape } from "@/components/ui/sticker";

interface AuthShellSide {
  shape: StickerShape;
  color: string;
  title: string;
  body: string;
}

interface AuthShellProps {
  children: React.ReactNode;
  side: AuthShellSide;
}

export function AuthShell({ children, side }: AuthShellProps) {
  return (
    <div className="relative min-h-screen bg-bg-primary grid lg:grid-cols-2">
      {/* Form side */}
      <div className="relative z-10 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>

      {/* Decorative side */}
      <div
        className="hidden lg:flex relative overflow-hidden items-end p-12"
        style={{
          background: "linear-gradient(180deg, #260F03 0%, #0E0A07 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute left-1/2 top-[40%] -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: "120%",
            height: "120%",
            background:
              "radial-gradient(circle, #FFD23F 0%, #FF6D29 25%, rgba(255,109,41,0.3) 50%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
        <div className="relative z-10 max-w-[480px] text-text-primary">
          <Sticker shape={side.shape} color={side.color} size={88} expression="happy" tilt={-6} />
          <h2
            className="font-[family-name:var(--font-heading)] font-bold mt-8 mb-4"
            style={{ fontSize: 44, letterSpacing: "-0.03em", lineHeight: 1.05 }}
          >
            {side.title}
          </h2>
          <p className="text-[17px] leading-[1.5] m-0" style={{ color: "rgb(215, 184, 151)" }}>
            {side.body}
          </p>
        </div>
      </div>
    </div>
  );
}
