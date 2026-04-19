"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      // Direct style update — no transition, no lag
      cursorRef.current.style.left = e.clientX - 10 + "px";
      cursorRef.current.style.top = e.clientY - 10 + "px";
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: "#ffd000",
        pointerEvents: "none",
        zIndex: 9999,
        willChange: "left, top",
      }}
    />
  );
}