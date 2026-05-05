"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number;
  dismissible?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 460,
  dismissible = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && dismissible) onClose();
    }

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current && dismissible) onClose();
      }}
    >
      <div
        className="card-surface w-full p-7 relative animate-overlay-pop"
        style={{
          maxWidth,
          background:
            "linear-gradient(180deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 100%)",
        }}
      >
        {dismissible && (
          <button
            onClick={onClose}
            className="btn-icon absolute top-3.5 right-3.5"
            aria-label="Close"
          >
            <Icon name="x" size={16} />
          </button>
        )}
        {title && (
          <h2
            className="font-[family-name:var(--font-heading)] font-bold m-0 mb-4"
            style={{ fontSize: 22, letterSpacing: "-0.02em" }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
