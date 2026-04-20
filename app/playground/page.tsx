"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────────────────────
   CARD DATA
───────────────────────────────────────────────────────────────────────── */
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

const CARDS: CardDef[] = [
  { id:  1, label: "Presentation",     cat: "Creatives Committee Onboarding Session", w: 360, h: 202, x: -100, y: -50, img: "/work/presentation-1.webp" },
  { id:  2, label: "Publicity Material", cat: "Battle of the Wits",    w: 260, h: 260, x: 0, y:  25, img: "/work/post-1.webp" },
  { id:  3, label: "Publicity Material", cat: "Sirkits Merch Release", w: 260, h: 260, x: 0, y: -25, img: undefined },
  { id:  4, label: "Publicity Material", cat: "Bytecamp 3.0",          w: 270, h: 337, x: 0, y:   0, img: "/work/post-3.webp" },
  { id:  5, label: "Project 05",       cat: "Motion  ", w: 228, h: 192, x: 0, y: 0, img: undefined },
  { id:  6, label: "Project 06",       cat: "Product ", w: 180, h: 240, x: 0, y: 0, img: undefined },
  { id:  7, label: "Illustration",     cat: "Clip Studio Paint", w: 360, h: 277, x: -80, y: -85, img: "/work/paint-1.webp" },
  { id:  8, label: "Project 08",       cat: "Branding", w: 240, h: 252, x: 0, y: 0, img: undefined },
  { id:  9, label: "Project 09",       cat: "UI      ", w: 192, h: 264, x: 0, y: 0, img: undefined },
  { id: 10, label: "Project 10",       cat: "Motion  ", w: 357, h: 192, x: -100, y: 75, img: "/work/prototype-1.webp" },
  { id: 11, label: "Project 11",       cat: "Product ", w: 180, h: 240, x: 0, y: 0, img: undefined },
  { id: 12, label: "Project 12",       cat: "Poster  ", w: 216, h: 168, x: 0, y: 0, img: undefined },
  { id: 13, label: "Project 13",       cat: "Branding", w: 260, h: 260, x: 0, y: 0, img: "/work/post-2.webp" },
  { id: 14, label: "Membership ID",    cat: "ID & Character Design", w: 200, h: 312, x: 0, y: -27, img: "/work/merch-1.png" },
  { id: 15, label: "Project 15",       cat: "Motion  ", w: 377, h: 272, x: -87, y: 0, img: "/work/merch-2.webp" },
  { id: 16, label: "Project 16",       cat: "Product ", w: 180, h: 240, x: 0, y: 0, img: undefined },
  { id: 17, label: "Project 17",       cat: "Poster  ", w: 216, h: 168, x: 0, y: 0, img: undefined },
  { id: 18, label: "Project 18",       cat: "Branding", w: 240, h: 252, x: 0, y: 0, img: undefined },
  { id: 19, label: "Project 19",       cat: "UI      ", w: 192, h: 264, x: 0, y: 0, img: undefined },
  { id: 20, label: "Project 20",       cat: "Motion  ", w: 360, h: 258, x: -100, y: 0, img: "/work/plate-3.png" },
  { id: 21, label: "Project 21",       cat: "Product ", w: 180, h: 240, x: 0, y: 0, img: undefined },
  { id: 22, label: "Project 22",       cat: "Poster  ", w: 216, h: 168, x: 0, y: 0, img: undefined },
  { id: 23, label: "Project 23",       cat: "Branding", w: 240, h: 252, x: 0, y: 0, img: undefined },
  { id: 24, label: "Project 24",       cat: "UI      ", w: 192, h: 264, x: 0, y: 0, img: undefined },
  { id: 25, label: "Project 25",       cat: "Motion  ", w: 228, h: 192, x: 0, y: 0, img: undefined },
  { id: 26, label: "Project 26",       cat: "Product ", w: 180, h: 240, x: 0, y: 0, img: undefined },
  { id: 27, label: "Project 27",       cat: "Poster  ", w: 360, h: 227, x: -100, y: 0, img: "/work/paint-2.webp" },
  { id: 28, label: "Project 28",       cat: "Branding", w: 240, h: 252, x: 0, y: 0, img: undefined },
  { id: 29, label: "Project 29",       cat: "UI      ", w: 192, h: 264, x: 0, y: 0, img: undefined },
  { id: 30, label: "Project 30",       cat: "Motion  ", w: 228, h: 192, x: 0, y: 0, img: undefined },
];

/* ─────────────────────────────────────────────────────────────────────────
   LAYOUT CONFIG
───────────────────────────────────────────────────────────────────────── */
const LAYOUT = {
  COLS: 6,
  ROWS: 5,
  CELL_W: 340,
  CELL_H: 320,
  MAX_CARD_W: 280,
  MAX_CARD_H: 280,
  WRAP_BUFFER: 400,
};

const WORLD_W = LAYOUT.COLS * LAYOUT.CELL_W;
const WORLD_H = LAYOUT.ROWS * LAYOUT.CELL_H;

/* ─────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────── */
const FONT = "'Courier Prime', 'Courier New', monospace";
const SANS = "Arial, Helvetica, sans-serif";

const styles = {
  dotGrid: {
    position: "absolute",
    inset: "-200px",
    backgroundImage: "radial-gradient(circle, #A8C8E8 1.1px, transparent 1.1px)",
    backgroundSize: "18px 18px",
    zIndex: 0,
    pointerEvents: "none",
    willChange: "transform",
  } as React.CSSProperties,

  accentRed: {
    position: "absolute", top: 43, left: 0, right: 0,
    height: 2, background: "#E03030", zIndex: 200, pointerEvents: "none",
  } as React.CSSProperties,

  accentBlue: {
    position: "absolute", top: 47, left: 0, right: 0,
    height: 2, background: "#3B72C8", zIndex: 200, pointerEvents: "none",
  } as React.CSSProperties,

  nav: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 43,
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    zIndex: 300, background: "#ffffff",
  } as React.CSSProperties,

  logo: {
    fontFamily: FONT, fontWeight: 400, fontSize: 14,
    letterSpacing: "0.10em", color: "#707070", textDecoration: "none",
  } as React.CSSProperties,

  navLink: (active: boolean): React.CSSProperties => ({
    fontFamily: FONT, fontWeight: 400, fontSize: 13,
    letterSpacing: "0.14em", color: "#111",
    textDecoration: active ? "underline" : "none",
    textUnderlineOffset: 3, textTransform: "uppercase",
  }),

  card: {
    position: "absolute", left: 0, top: 0,
    backgroundColor: "#fff", borderRadius: 2,
    boxShadow: "2px 3px 4px rgba(0,0,0,0.1)",
    pointerEvents: "auto", userSelect: "none", willChange: "transform", zIndex: 10,
    transformOrigin: "top left",
  } as React.CSSProperties,

  badge: {
    position: "absolute", top: -14, right: -14,
    width: 32, height: 32, borderRadius: "50%",
    background: "#3B72C8", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", fontWeight: "bold",
    zIndex: 20, fontFamily: SANS,
    boxShadow: "0 2px 6px rgba(59, 114, 200, 0.3)",
  } as React.CSSProperties,

  placeholder: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", fontFamily: FONT, fontSize: 10,
    color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em",
  } as React.CSSProperties,

  hoverLabel: {
    position: "fixed", bottom: 40, left: "50%",
    transform: "translateX(-50%)", background: "#fff",
    border: "1px solid #e0e0e0", borderRadius: 2,
    padding: "10px 20px", fontFamily: FONT,
    fontSize: 13, color: "#111", zIndex: 300,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    whiteSpace: "nowrap", pointerEvents: "none",
  } as React.CSSProperties,
};

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function Playground() {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const bgRef    = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const panOffset    = useRef({ x: 0, y: 0 });
  const targetOffset = useRef({ x: 0, y: 0 });

  // FIX 1: useRef<number> requires an initial value in strict React types.
  // Use 0 as the initial value (will be overwritten by rAF immediately).
  const reqRef = useRef<number>(0);

  const [scale, setScale] = useState(1);

  // FIX 2: Store scale in a ref so startDrag always reads the current value
  // without going stale inside the closure.
  const scaleRef = useRef(1);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  useEffect(() => {
    const handleResize = () => {
      const s = window.innerWidth < 640 ? 0.6 : 1;
      setScale(s);
      scaleRef.current = s;
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const basePositions = useRef(
    CARDS.map((card, i) => {
      const col = i % LAYOUT.COLS;
      const row = Math.floor(i / LAYOUT.COLS);
      return {
        x: col * LAYOUT.CELL_W + (LAYOUT.CELL_W - LAYOUT.MAX_CARD_W) / 2 + (card.x ?? 0),
        y: row * LAYOUT.CELL_H + (LAYOUT.CELL_H - LAYOUT.MAX_CARD_H) / 2 + (card.y ?? 0),
      };
    })
  );

  const renderPositions = useCallback(() => {
    const s = scaleRef.current;
    if (bgRef.current) {
      bgRef.current.style.transform =
        `translate3d(${(panOffset.current.x * s) % 18}px, ${(panOffset.current.y * s) % 18}px, 0)`;
    }
    cardRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const base = basePositions.current[i];
      const x = base.x + panOffset.current.x;
      const y = base.y + panOffset.current.y;
      const rx = (((x + LAYOUT.WRAP_BUFFER) % WORLD_W) + WORLD_W) % WORLD_W - LAYOUT.WRAP_BUFFER;
      const ry = (((y + LAYOUT.WRAP_BUFFER) % WORLD_H) + WORLD_H) % WORLD_H - LAYOUT.WRAP_BUFFER;
      ref.style.transform = `translate3d(${rx * s}px, ${ry * s}px, 0) scale(${s})`;
    });
  // scaleRef is a ref — intentionally omitted from deps (never changes identity)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fluid animation loop
  useEffect(() => {
    const loop = () => {
      panOffset.current.x += (targetOffset.current.x - panOffset.current.x) * 0.08;
      panOffset.current.y += (targetOffset.current.y - panOffset.current.y) * 0.08;
      renderPositions();
      reqRef.current = requestAnimationFrame(loop);
    };
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [renderPositions]);

  // Wheel / trackpad pan
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      targetOffset.current.x -= e.deltaX;
      targetOffset.current.y -= e.deltaY;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Drag (mouse + touch)
  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("nav")) return;

    const isTouch = e.type === "touchstart";

    const getXY = (ev: MouseEvent | TouchEvent) =>
      ev.type.startsWith("touch")
        ? { x: (ev as TouchEvent).touches[0].clientX, y: (ev as TouchEvent).touches[0].clientY }
        : { x: (ev as MouseEvent).clientX,            y: (ev as MouseEvent).clientY };

    const start  = getXY(e.nativeEvent as MouseEvent | TouchEvent);
    const origin = { ...targetOffset.current };

    const onMove = (ev: Event) => {
      const cur = getXY(ev as MouseEvent | TouchEvent);
      // FIX 2 (applied): read scale from ref, never stale
      targetOffset.current.x = origin.x + (cur.x - start.x) / scaleRef.current;
      targetOffset.current.y = origin.y + (cur.y - start.y) / scaleRef.current;
    };

    const onUp = () => {
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      window.removeEventListener(isTouch ? "touchend"  : "mouseup",   onUp);
    };

    window.addEventListener(isTouch ? "touchmove" : "mousemove", onMove);
    window.addEventListener(isTouch ? "touchend"  : "mouseup",   onUp);
  }, []);

  const NAV_LINKS = [
    { label: "WORK",       href: "/" },
    { label: "PLAYGROUND", href: "/playground" },
    { label: "ABOUT",      href: "#" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #fff; }
        .canvas { width: 100vw; height: 100vh; position: relative; overflow: hidden; cursor: grab; }
        .canvas:active { cursor: grabbing; }
        @media (max-width: 640px) {
          .nav-logo  { font-size: 12px !important; }
          .nav-links { gap: 16px !important; }
          .nav-link  { font-size: 10px !important; letter-spacing: 0.08em !important; }
        }
      `}</style>

      <div className="canvas" onMouseDown={startDrag} onTouchStart={startDrag}>
        <div ref={bgRef} style={styles.dotGrid} />

        <div style={styles.accentRed} />
        <div style={styles.accentBlue} />

        <nav style={styles.nav}>
          <Link href="/" style={styles.logo} className="nav-logo">KRIS</Link>
          <div style={{ display: "flex", gap: 40 }} className="nav-links">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={styles.navLink(false)}
                className="nav-link"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {CARDS.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              onMouseEnter={() => setHoveredLabel(`${card.id} · ${card.label} · ${card.cat}`)}
              onMouseLeave={() => setHoveredLabel(null)}
              style={{ ...styles.card, width: card.w, height: card.h }}
            >
              <div style={styles.badge}>{card.id}</div>
              <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#ebebea" }}>
                {card.img ? (
                  <Image
                    src={card.img}
                    alt={card.label}
                    fill
                    style={{ objectFit: "cover" }}
                    draggable={false}
                  />
                ) : (
                  <div style={styles.placeholder}>{card.cat}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {hoveredLabel && <div style={styles.hoverLabel}>{hoveredLabel}</div>}
      </div>
    </>
  );
}