"use client";

import { useEffect, useMemo } from "react";
import { Priority } from "@/lib/types";

interface ConfettiBurstProps {
  priority: Priority;
  position: { x: number; y: number };
  onDone: () => void;
}

const COLORS: Record<Priority, string[]> = {
  urgent: ["#e05252", "#c9a84c", "#f5e6b0", "#ffffff", "#ff7b7b", "#ffd700"],
  normal: ["#5b8def", "#c9a84c", "#f5e6b0", "#ffffff"],
  low: ["#c9a84c", "#f5e6b0", "#ffffff"],
};

const COUNTS: Record<Priority, number> = { low: 8, normal: 20, urgent: 40 };

interface Particle {
  dx: string;
  dy: string;
  rot: string;
  color: string;
  size: number;
  delay: string;
  isRect: boolean;
}

function generateParticles(priority: Priority): Particle[] {
  const count = COUNTS[priority];
  const colors = COLORS[priority];
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
    const distance = 40 + Math.random() * (priority === "urgent" ? 120 : 80);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particles.push({
      dx: `${dx.toFixed(1)}px`,
      dy: `${dy.toFixed(1)}px`,
      rot: `${Math.floor(Math.random() * 720 - 360)}deg`,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: priority === "low" ? 3 : 3 + Math.random() * 4,
      delay: `${(Math.random() * 0.15).toFixed(2)}s`,
      isRect: priority === "urgent" && Math.random() > 0.5,
    });
  }

  return particles;
}

export function ConfettiBurst({ priority, position, onDone }: ConfettiBurstProps) {
  const particles = useMemo(() => generateParticles(priority), [priority]);

  useEffect(() => {
    const timer = setTimeout(onDone, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="fixed pointer-events-none z-[60]"
      style={{ left: position.x, top: position.y }}
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className={`absolute ${p.isRect ? "" : "rounded-full"}`}
          style={{
            width: p.isRect ? p.size * 1.5 : p.size,
            height: p.size,
            backgroundColor: p.color,
            "--dx": p.dx,
            "--dy": p.dy,
            "--rot": p.rot,
            animation: priority === "low"
              ? `sparkle-pop 1.2s ease-out ${p.delay} forwards`
              : `confetti-particle 1.4s ease-out ${p.delay} forwards`,
            opacity: 0,
            left: -p.size / 2,
            top: -p.size / 2,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
