"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardDef {
  id: number;
  label: string;
  cat: string;
  img?: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CARDS: CardDef[] = [
  { id:  1, label: "Presentation",       cat: "Creatives Committee Onboarding Session", w: 390, h: 232, x: -80,  y: -50, img: "/work/presentation-1.webp" },
  { id:  2, label: "Publicity Material", cat: "Battle of the Wits",                     w: 260, h: 260, x:   0,  y:  25, img: "/work/post-1.webp" },
  { id:  3, label: "Publicity Material", cat: "Sirkits Merch Release",                  w: 325, h: 325, x: -35,  y: -50, img: "/work/post-11.webp" },
  { id:  4, label: "Project 11",         cat: "Product ",                                w: 275, h: 307, x: -15,  y: -15, img: "/work/prototype-3.png" },
  { id:  5, label: "Project 05",         cat: "Motion  ",                                w: 300, h: 225, x: -20,  y:  50, img: "/work/paint-3.webp" },
  { id:  6, label: "Project 06",         cat: "Product ",                                w: 235, h: 300, x: -25,  y: -50, img: "/work/post-6.webp" },
  { id:  7, label: "Project 15",         cat: "Motion  ",                                w: 377, h: 272, x: -87,  y: -75, img: "/work/sticker-2.png" },
  { id:  8, label: "Project 08",         cat: "Branding",                                w: 240, h: 252, x:   0,  y:   0, img: undefined },
  { id:  9, label: "Project 09",         cat: "UI      ",                                w: 192, h: 264, x:   0,  y:   0, img: undefined },
  { id: 10, label: "Project 10",         cat: "Motion  ",                                w: 357, h: 192, x: -105, y:   0, img: "/work/prototype-1.webp" },
  { id: 11, label: "Publicity Material", cat: "Bytecamp 3.0",                            w: 270, h: 337, x: -50,  y: -15, img: "/work/post-3.webp" },
  { id: 12, label: "Project 12",         cat: "Poster  ",                                w: 287, h: 230, x: -75,  y:  15, img: "/work/post-9.webp" },
  { id: 13, label: "Project 13",         cat: "Branding",                                w: 260, h: 260, x:   0,  y:   0, img: "/work/post-2.webp" },
  { id: 14, label: "Membership ID",      cat: "ID & Character Design",                   w: 200, h: 312, x: -35,  y: -25, img: "/work/merch-1.png" },
  { id: 15, label: "Illustration",       cat: "Clip Studio Paint",                       w: 360, h: 277, x: -130, y:   0, img: "/work/paint-1.webp" },
  { id: 16, label: "Project 16",         cat: "Product ",                                w: 275, h: 350, x: -75,  y: -80, img: "/work/post-10.webp" },
  { id: 17, label: "Project 17",         cat: "Poster  ",                                w: 350, h: 250, x: -95,  y:  40, img: "/work/prototype-2.png" },
  { id: 18, label: "Project 18",         cat: "Branding",                                w: 240, h: 252, x:   0,  y:   0, img: undefined },
  { id: 19, label: "Project 19",         cat: "UI      ",                                w: 227, h: 275, x: -75,  y: -20, img: "/work/prototype-4.png" },
  { id: 20, label: "Project 20",         cat: "Motion  ",                                w: 360, h: 258, x: -100, y:   0, img: "/work/plate-3.png" },
  { id: 21, label: "Project 21",         cat: "Product ",                                w: 180, h: 240, x:   0,  y:   0, img: undefined },
  { id: 22, label: "Project 22",         cat: "Poster  ",                                w: 375, h: 275, x: -100, y:   0, img: "/work/post-4.webp" },
  { id: 23, label: "Project 23",         cat: "Branding",                                w: 240, h: 252, x:   0,  y:   0, img: undefined },
  { id: 24, label: "Project 24",         cat: "UI      ",                                w: 247, h: 325, x: -25,  y: -30, img: "/work/post-8.webp" },
  { id: 25, label: "Project 25",         cat: "Motion  ",                                w: 360, h: 260, x: -75,  y: -25, img: "/work/plate-5.jpg" },
  { id: 26, label: "Project 26",         cat: "Product ",                                w: 180, h: 240, x:   0,  y:   0, img: undefined },
  { id: 27, label: "Project 27",         cat: "Poster  ",                                w: 360, h: 227, x: -100, y:   0, img: "/work/paint-2.webp" },
  { id: 28, label: "Project 28",         cat: "Branding",                                w: 325, h: 195, x: -35,  y:  35, img: "/work/paint-4.png" },
  { id: 29, label: "Project 29",         cat: "UI      ",                                w: 275, h: 357, x:   0,  y: -25, img: "/work/post-5.webp" },
  { id: 30, label: "Project 30",         cat: "Motion  ",                                w: 275, h: 192, x: -35,  y:  15, img: "/work/post-7.webp" },
];

// ─── Layout constants ─────────────────────────────────────────────────────────

const COLS        = 6;
const ROWS        = 5;
const CELL_W      = 340;
const CELL_H      = 320;
const MAX_CARD_W  = 280;
const MAX_CARD_H  = 280;
const WRAP_BUFFER = 400;
const WORLD_W     = COLS * CELL_W;
const WORLD_H     = ROWS * CELL_H;

// ─── Pre-computed base positions (stable reference, never recalculated) ───────

const BASE_POSITIONS = CARDS.map((card, i) => ({
  x: (i % COLS) * CELL_W + (CELL_W - MAX_CARD_W) / 2 + (card.x ?? 0),
  y: Math.floor(i / COLS) * CELL_H + (CELL_H - MAX_CARD_H) / 2 + (card.y ?? 0),
}));

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "WORK",       href: "/" },
  { label: "PLAYGROUND", href: "/playground" },
  { label: "ABOUT",      href: "#" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Playground() {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  // DOM refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const bgRef     = useRef<HTMLDivElement>(null);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);

  // Pan state — all mutable, never triggers re-render
  const panOffset    = useRef({ x: 0, y: 0 });
  const targetOffset = useRef({ x: 0, y: 0 });
  const rafRef       = useRef<number>(0);
  const scaleRef     = useRef(1);
  const isTouching   = useRef(false);

  // ── Scale on resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      scaleRef.current = window.innerWidth < 640 ? 0.6 : 1;
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── DOM write: positions of bg + all cards ──────────────────────────────────
  const commitPositions = useCallback(() => {
    const s  = scaleRef.current;
    const ox = panOffset.current.x;
    const oy = panOffset.current.y;

    // dot-grid: parallax illusion via modulo on bg offset
    if (bgRef.current) {
      bgRef.current.style.transform =
        `translate3d(${(ox * s) % 18}px,${(oy * s) % 18}px,0)`;
    }

    for (let i = 0; i < cardRefs.current.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const bx = BASE_POSITIONS[i].x + ox;
      const by = BASE_POSITIONS[i].y + oy;
      // infinite wrap
      const rx = (((bx + WRAP_BUFFER) % WORLD_W) + WORLD_W) % WORLD_W - WRAP_BUFFER;
      const ry = (((by + WRAP_BUFFER) % WORLD_H) + WORLD_H) % WORLD_H - WRAP_BUFFER;
      el.style.transform = `translate3d(${rx * s}px,${ry * s}px,0) scale(${s})`;
    }
  }, []);

  // ── RAF loop: lerp when mouse/wheel, snap when touch ────────────────────────
  useEffect(() => {
    const LERP = 0.18;
    let prevX = 0, prevY = 0;

    const loop = () => {
      const tx = targetOffset.current.x;
      const ty = targetOffset.current.y;

      if (isTouching.current) {
        panOffset.current.x = tx;
        panOffset.current.y = ty;
      } else {
        panOffset.current.x += (tx - panOffset.current.x) * LERP;
        panOffset.current.y += (ty - panOffset.current.y) * LERP;
      }

      // Only write to DOM if position actually changed (saves GPU on Android)
      if (panOffset.current.x !== prevX || panOffset.current.y !== prevY) {
        commitPositions();
        prevX = panOffset.current.x;
        prevY = panOffset.current.y;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [commitPositions]);

  // ── Wheel pan ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // blocks browser back-swipe on macOS
      targetOffset.current.x -= e.deltaX;
      targetOffset.current.y -= e.deltaY;
    };
    // Must be non-passive to call preventDefault
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // ── Mouse drag ───────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("nav")) return;
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY;
    const ox = targetOffset.current.x, oy = targetOffset.current.y;

    const onMove = (ev: MouseEvent) => {
      targetOffset.current.x = ox + (ev.clientX - sx) / scaleRef.current;
      targetOffset.current.y = oy + (ev.clientY - sy) / scaleRef.current;
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // ── Touch drag ───────────────────────────────────────────────────────────────
  // iOS Safari fix:
  //   • Attach imperatively with { passive: false } so we can call preventDefault()
  //   • preventDefault() stops Safari from stealing the touch for scroll/bounce
  //   • We attach to the canvas element (not window) to keep it scoped
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    let startX = 0, startY = 0, startOX = 0, startOY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest("nav")) return;
      e.preventDefault(); // ← critical: blocks iOS Safari scroll hijack
      const t = e.touches[0];
      startX  = t.clientX;
      startY  = t.clientY;
      startOX = targetOffset.current.x;
      startOY = targetOffset.current.y;
      isTouching.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching.current) return;
      e.preventDefault(); // ← critical: prevents iOS rubber-band during drag
      const t = e.touches[0];
      const s = scaleRef.current;
      targetOffset.current.x = startOX + (t.clientX - startX) / s;
      targetOffset.current.y = startOY + (t.clientY - startY) / s;
    };

    const onTouchEnd = () => {
      isTouching.current = false;
    };

    // passive: false is required to be able to call preventDefault on iOS
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true  });
    el.addEventListener("touchcancel",onTouchEnd,   { passive: true  });

    return () => {
      el.removeEventListener("touchstart",  onTouchStart);
      el.removeEventListener("touchmove",   onTouchMove);
      el.removeEventListener("touchend",    onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          width: 100%; height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
          background: #fff;
        }
        .pg-canvas {
          width: 100vw;
          height: 100svh; /* svh: correct viewport on iOS Safari (no toolbar jitter) */
          position: relative;
          overflow: hidden;
          cursor: grab;
          /* none: hand raw touch coords to our JS listeners */
          touch-action: none;
          /* Promote to GPU layer for the whole canvas */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        .pg-canvas:active { cursor: grabbing; }
        @media (max-width: 640px) {
          .pg-nav-logo  { font-size: 12px !important; }
          .pg-nav-links { gap: 16px !important; }
          .pg-nav-link  { font-size: 10px !important; letter-spacing: 0.08em !important; }
        }
      `}</style>

      <div
        ref={canvasRef}
        className="pg-canvas"
        onMouseDown={onMouseDown}
        // Touch handlers intentionally NOT on React props — see imperative listeners above
      >
        {/* Scrolling dot grid */}
        <div
          ref={bgRef}
          style={{
            position: "absolute",
            inset: "-200px",
            backgroundImage: "radial-gradient(circle, #A8C8E8 1.1px, transparent 1.1px)",
            backgroundSize: "18px 18px",
            zIndex: 0,
            pointerEvents: "none",
            willChange: "transform",
          }}
        />

        {/* Header accent lines */}
        <div style={{ position: "absolute", top: 43, left: 0, right: 0, height: 2, background: "#E03030", zIndex: 200, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 47, left: 0, right: 0, height: 2, background: "#3B72C8", zIndex: 200, pointerEvents: "none" }} />

        {/* Nav */}
        <nav style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 43,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", zIndex: 300, background: "#ffffff",
        }}>
          <Link
            href="/"
            className="pg-nav-logo"
            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace", fontWeight: 400, fontSize: 14, letterSpacing: "0.10em", color: "#707070", textDecoration: "none" }}
          >
            KRIS
          </Link>
          <div style={{ display: "flex", gap: 40 }} className="pg-nav-links">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="pg-nav-link"
                style={{
                  fontFamily: "'Courier Prime', 'Courier New', monospace",
                  fontWeight: 400, fontSize: 13, letterSpacing: "0.14em", color: "#111",
                  textDecoration: item.label === "PLAYGROUND" ? "underline" : "none",
                  textUnderlineOffset: 3, textTransform: "uppercase",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Cards layer */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              onMouseEnter={() => setHoveredLabel(`${card.id} · ${card.label} · ${card.cat}`)}
              onMouseLeave={() => setHoveredLabel(null)}
              style={{
                position: "absolute",
                left: 0, top: 0,
                width: card.w,
                height: card.h,
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: "2px 3px 4px rgba(0,0,0,0.1)",
                pointerEvents: "auto",
                userSelect: "none",
                // GPU layer per card; transformZ forces independent compositor layer
                willChange: "transform",
                zIndex: 10,
                transformOrigin: "top left",
              }}
            >
              {/* Badge */}
              <div style={{
                position: "absolute", top: -14, right: -14, width: 32, height: 32,
                borderRadius: "50%", background: "#3B72C8", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: "bold", zIndex: 20,
                fontFamily: "Arial, Helvetica, sans-serif",
                boxShadow: "0 2px 6px rgba(59,114,200,0.3)",
              }}>
                {card.id}
              </div>

              {/* Card content */}
              <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#ebebea" }}>
                {card.img ? (
                  <Image
                    src={card.img}
                    alt={card.label}
                    fill
                    sizes={`${card.w}px`}
                    style={{ objectFit: "cover" }}
                    draggable={false}
                  />
                ) : (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: "100%",
                    fontFamily: "'Courier Prime', 'Courier New', monospace",
                    fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    {card.cat}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Hover label */}
        {hoveredLabel && (
          <div style={{
            position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
            background: "#fff", border: "1px solid #e0e0e0", borderRadius: 2,
            padding: "10px 20px",
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontSize: 13, color: "#111", zIndex: 300,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)", whiteSpace: "nowrap", pointerEvents: "none",
          }}>
            {hoveredLabel}
          </div>
        )}
      </div>
    </>
  );
}