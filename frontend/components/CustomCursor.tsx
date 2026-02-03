"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

function isInteractive(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "a, button, [role='button'], input, textarea, select, option, [data-cursor]"
    )
  );
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const handleMQ = (e: MediaQueryListEvent | MediaQueryList) => {
      setEnabled(Boolean(("matches" in e ? e.matches : mq.matches)));
    };

    handleMQ(mq);
    mq.addEventListener("change", handleMQ);

    return () => {
      mq.removeEventListener("change", handleMQ);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const handleOver = (event: PointerEvent) => {
      setActive(isInteractive(event.target));
    };

    const handleOut = (event: PointerEvent) => {
      if (event.relatedTarget && isInteractive(event.relatedTarget)) return;
      setActive(false);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerover", handleOver, { passive: true });
    window.addEventListener("pointerout", handleOut, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      window.removeEventListener("pointerout", handleOut);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="cursor"
      style={{
        translateX: x,
        translateY: y,
        scale: active ? 1.5 : 1,
      }}
      aria-hidden
    />
  );
}

export default CustomCursor;
