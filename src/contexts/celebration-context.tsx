"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Priority } from "@/lib/types";
import { getLevelInfo } from "@/lib/levels";
import { createClient } from "@/lib/supabase/client";
import { awardXp, recordActivity } from "@/lib/supabase/queries/profile";

interface CelebrationEvent {
  id: string;
  priority: Priority;
  position: { x: number; y: number };
}

interface ToastEvent {
  id: string;
  xp: number;
}

interface LevelUpInfo {
  level: number;
  title: string;
}

interface PerfectDayInfo {
  blocksCompleted: number;
  totalXp: number;
}

export type StreakEventInput =
  | { type: "streak-broken"; penalty: number }
  | { type: "shield-used"; brokenStreak: number }
  | { type: "shield-earned" };

export type StreakEvent = StreakEventInput & { id: string };

interface CelebrationContextValue {
  celebrate: (opts: { xp: number; priority: Priority; position?: { x: number; y: number } }) => Promise<void>;
  celebratePerfectDay: (opts: PerfectDayInfo) => void;
  showStreakToast: (event: StreakEventInput) => void;
  confettiQueue: CelebrationEvent[];
  toastQueue: ToastEvent[];
  streakEvents: StreakEvent[];
  levelUp: LevelUpInfo | null;
  perfectDay: PerfectDayInfo | null;
  removeConfetti: (id: string) => void;
  removeToast: (id: string) => void;
  removeStreakEvent: (id: string) => void;
  clearLevelUp: () => void;
  clearPerfectDay: () => void;
}

const CelebrationContext = createContext<CelebrationContextValue | null>(null);

export function useCelebration() {
  const ctx = useContext(CelebrationContext);
  if (!ctx) throw new Error("useCelebration must be used within CelebrationProvider");
  return ctx;
}

let eventCounter = 0;
function nextId() {
  return `celebration-${++eventCounter}-${Date.now()}`;
}

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [confettiQueue, setConfettiQueue] = useState<CelebrationEvent[]>([]);
  const [toastQueue, setToastQueue] = useState<ToastEvent[]>([]);
  const [streakEvents, setStreakEvents] = useState<StreakEvent[]>([]);
  const [levelUp, setLevelUp] = useState<LevelUpInfo | null>(null);
  const [perfectDay, setPerfectDay] = useState<PerfectDayInfo | null>(null);

  const removeConfetti = useCallback((id: string) => {
    setConfettiQueue((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToastQueue((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const removeStreakEvent = useCallback((id: string) => {
    setStreakEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearLevelUp = useCallback(() => setLevelUp(null), []);
  const clearPerfectDay = useCallback(() => setPerfectDay(null), []);

  const showStreakToast = useCallback((event: StreakEventInput) => {
    const id = nextId();
    setStreakEvents((prev) => [...prev, { ...event, id } as StreakEvent]);
  }, []);

  const celebrate = useCallback(async (opts: {
    xp: number;
    priority: Priority;
    position?: { x: number; y: number };
  }) => {
    const pos = opts.position ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Confetti immediately
    const confettiId = nextId();
    setConfettiQueue((prev) => [...prev, { id: confettiId, priority: opts.priority, position: pos }]);

    // XP toast after short delay
    setTimeout(() => {
      const toastId = nextId();
      setToastQueue((prev) => [...prev, { id: toastId, xp: opts.xp }]);
    }, 400);

    // Persist XP, update streak, check for level-up
    try {
      const supabase = createClient();
      const { oldTotal, newTotal } = await awardXp(supabase, opts.xp);

      const oldLevel = getLevelInfo(oldTotal);
      const newLevel = getLevelInfo(newTotal);

      if (newLevel.level > oldLevel.level) {
        setTimeout(() => {
          setLevelUp({ level: newLevel.level, title: newLevel.title });
        }, 2500);
      }

      const activityResult = await recordActivity(supabase);
      if (activityResult?.shieldEarned) {
        setTimeout(() => {
          const id = nextId();
          setStreakEvents((prev) => [...prev, { id, type: "shield-earned" }]);
        }, 1200);
      }
    } catch {
      // Persistence failed silently — celebrations still show
    }
  }, []);

  const celebratePerfectDay = useCallback((opts: PerfectDayInfo) => {
    setPerfectDay(opts);
  }, []);

  return (
    <CelebrationContext.Provider
      value={{
        celebrate,
        celebratePerfectDay,
        showStreakToast,
        confettiQueue,
        toastQueue,
        streakEvents,
        levelUp,
        perfectDay,
        removeConfetti,
        removeToast,
        removeStreakEvent,
        clearLevelUp,
        clearPerfectDay,
      }}
    >
      {children}
    </CelebrationContext.Provider>
  );
}
