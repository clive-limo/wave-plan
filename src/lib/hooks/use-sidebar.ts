"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "wave-plan-sidebar-expanded";

export function useSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setExpanded(true);
  }, []);

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const isOpen = expanded || hovered;

  return { isOpen, expanded, hovered, toggle, setHovered, mounted };
}
