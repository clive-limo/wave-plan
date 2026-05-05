"use client";

import { useEffect, useRef } from "react";
import { useCelebration } from "@/contexts/celebration-context";
import { createClient } from "@/lib/supabase/client";
import { applyStreakBreak } from "@/lib/supabase/queries/profile";

export function StreakValidator() {
  const { showStreakToast } = useCelebration();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const supabase = createClient();
    applyStreakBreak(supabase)
      .then((result) => {
        if (!result.broken) return;
        if (result.shieldUsed) {
          showStreakToast({
            type: "shield-used",
            brokenStreak: result.brokenStreak,
          });
        } else {
          showStreakToast({
            type: "streak-broken",
            penalty: result.penalty,
          });
        }
      })
      .catch(() => {
        // Streak check failed silently — non-fatal
      });
  }, [showStreakToast]);

  return null;
}
