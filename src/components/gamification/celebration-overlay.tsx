"use client";

import { useCelebration } from "@/contexts/celebration-context";
import { ConfettiBurst } from "./confetti-burst";
import { XpToast } from "./xp-toast";
import { LevelUp } from "./level-up";
import { PerfectDay } from "./perfect-day";

export function CelebrationOverlay() {
  const {
    confettiQueue,
    toastQueue,
    levelUp,
    perfectDay,
    removeConfetti,
    removeToast,
    clearLevelUp,
    clearPerfectDay,
  } = useCelebration();

  return (
    <>
      {confettiQueue.map((evt) => (
        <ConfettiBurst
          key={evt.id}
          priority={evt.priority}
          position={evt.position}
          onDone={() => removeConfetti(evt.id)}
        />
      ))}

      {toastQueue.map((toast, i) => (
        <XpToast
          key={toast.id}
          xp={toast.xp}
          offsetIndex={i}
          onDone={() => removeToast(toast.id)}
        />
      ))}

      {levelUp && (
        <LevelUp
          level={levelUp.level}
          title={levelUp.title}
          onDone={clearLevelUp}
        />
      )}

      {perfectDay && (
        <PerfectDay
          blocksCompleted={perfectDay.blocksCompleted}
          totalXp={perfectDay.totalXp}
          onDone={clearPerfectDay}
        />
      )}
    </>
  );
}
