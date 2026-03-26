"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedXpCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedXpCounter({ value, duration = 800, className = "" }: AnimatedXpCounterProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevValue = useRef(value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) return;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <span className={className}>{displayed.toLocaleString()}</span>;
}
