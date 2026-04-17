"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

/* ── Configuration ────────────────────────────────────────────────────── */
const CARD_W = 320;
const CARD_H = 240;
const GAP = 20;
const GRID_W = CARD_W + GAP; // 340px
const GRID_H = CARD_H + GAP; // 260px

// We use 10 cols x 6 rows (60 cards) to ensure the looping world is massive (3400px wide).
// This guarantees that cards wrap around OFF-SCREEN, fixing the "vanishing" issue.
const WORLD_COLS = 10;
const WORLD_ROWS = 6;
const WORLD_WIDTH = WORLD_COLS * GRID_W;
const WORLD_HEIGHT = WORLD_ROWS * GRID_H;

interface CardDef {
  id: number;
  label: string;
  cat: string;
  img?: string;
  badgeTop: number;
  badgeRight: number;
}

const CARDS_DATA: CardDef[] = Array.from({ length: WORLD_COLS * WORLD_ROWS }, (_, i) => ({
  id: i + 1,
  label: `Project ${String(i + 1).padStart(2, '0')}`,
  cat: ["Product", "Poster", "Branding", "UI", "Motion"][i % 5],
  // Slightly scatter the blue badge positions for variety
  badgeTop: -14 + (i % 3) * 6,
  badgeRight: -14 + (Math.floor(i / 2) % 3) * 6,
}));

export default function Playground() {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [topZ, setTopZ] = useState(10);
  
  // Refs for high-performance direct DOM manipulation
  const bgRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Track the global pan offset
  const panOffset = useRef({ x: 0, y: 0 });
  
  // Track individual card base positions (so they can be moved independently)
  const cardBasePos = useRef(
    CARDS_DATA.map((_, i) => ({
      x: (i % WORLD_COLS) * GRID_W,
      y: Math.floor(i / WORLD_COLS) * GRID_H,
      z: 10,
    }))
  );

  /* ── Core Render Engine (Bypasses React State for smooth physics) ── */
  const renderPositions = useCallback(() => {
    if (bgRef.current) {
      bgRef.current.style.backgroundPosition = `${13 + panOffset.current.x}px ${13 + panOffset.current.y}px`;
    }

    cardRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const base = cardBasePos.current[i];
      
      // Calculate global position
      let x = base.x + panOffset.current.x;
      let y = base.y + panOffset.current.y;

      // Robust modulo math for infinite looping
      // We shift by -500px so the 0-coordinate wrapping happens far off-screen
      let renderX = (((x + 500) % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH - 500;
      let renderY = (((y + 500) % WORLD_HEIGHT) + WORLD_HEIGHT) % WORLD_HEIGHT - 500;

      ref.style.transform = `translate3d(${renderX}px, ${renderY}px, 0)`;
      ref.style.zIndex = base.z.toString();
    });
  }, []);

  // Initial render
  useEffect(() => {
    renderPositions();
  }, [renderPositions]);

  /* ── Background Drag (Panning) ─────────────────────────────────── */
  const startPanDrag = (e: React.MouseEvent | React.TouchEvent) => {
    // Ignore if clicking on a card or navbar
    if ((e.target as HTMLElement).closest(".pg-card") || (e.target as HTMLElement).closest("nav")) return;

    const isTouch = e.type === "touchstart";
    const startX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const startY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const initialPanX = panOffset.current.x;
    const initialPanY = panOffset.current.y;

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const currentX = ev.type === "touchmove" ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
      const currentY = ev.type === "touchmove" ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY;
      panOffset.current.x = initialPanX + (currentX - startX);
      panOffset.current.y = initialPanY + (currentY - startY);
      renderPositions();
    };

    const onUp = () => {
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      window.removeEventListener(isTouch ? "touchend" : "mouseup", onUp);
    };

    window.addEventListener(isTouch ? "touchmove" : "mousemove", onMove, { passive: true });
    window.addEventListener(isTouch ? "touchend" : "mouseup", onUp);
  };

  /* ── Individual Card Drag ──────────────────────────────────────── */
  const startCardDrag = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    e.stopPropagation(); // Stop background pan

    // Bring to front
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    cardBasePos.current[index].z = nextZ;
    renderPositions();

    const isTouch = e.type === "touchstart";
    const startX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const startY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const initialCardX = cardBasePos.current[index].x;
    const initialCardY = cardBasePos.current[index].y;

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const currentX = ev.type === "touchmove" ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
      const currentY = ev.type === "touchmove" ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY;
      
      cardBasePos.current[index].x = initialCardX + (currentX - startX);
      cardBasePos.current[index].y = initialCardY + (currentY - startY);
      renderPositions();
    };

    const onUp = () => {
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      window.removeEventListener(isTouch ? "touchend" : "mouseup", onUp);
    };

    window.addEventListener(isTouch ? "touchmove" : "mousemove", onMove, { passive: true });
    window.addEventListener(isTouch ? "touchend" : "mouseup", onUp);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #fff; cursor: grab; }
        body:active { cursor: grabbing; }
      `}</style>

      <div onMouseDown={startPanDrag} onTouchStart={startPanDrag} style={pageStyle}>
        {/* Hardware-accelerated Dot Grid */}
        <div ref={bgRef} style={dotGridStyle} />

        {/* Header Lines */}
        <div style={{ position: "absolute", top: 43, left: 0, right: 0, height: 2, background: "#E03030", zIndex: 200, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 47, left: 0, right: 0, height: 2, background: "#3B72C8", zIndex: 200, pointerEvents: "none" }} />

        {/* Navbar */}
        <nav style={navStyle}>
          <Link href="/" style={logoStyle}>KRIS</Link>
          <div style={{ display: "flex", gap: 40 }}>
            {["WORK", "PLAYGROUND", "LIBRARY", "ABOUT"].map((label) => (
              <Link key={label} href={label === "PLAYGROUND" ? "/playground" : "/"} style={{ ...navLinkStyle, textDecoration: label === "PLAYGROUND" ? "underline" : "none", textUnderlineOffset: 3 }}>
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Cards */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {CARDS_DATA.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="pg-card"
              onMouseDown={(e) => startCardDrag(e, i)}
              onTouchStart={(e) => startCardDrag(e, i)}
              onClick={() => setSelectedLabel(`${card.id} · ${card.label} · ${card.cat}`)}
              style={{
                position: "absolute", left: 0, top: 0, // Position controlled by translate3d
                width: CARD_W, height: CARD_H,
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: "2px 3px 4px rgba(0,0,0,0.1)", // Sharp, low blur shadow
                pointerEvents: "auto",
                cursor: "pointer",
                userSelect: "none",
                willChange: "transform", // Optimizes physics
              }}
            >
              {/* Blue Badge (Scattered via data) */}
              <div style={{ ...blueBadgeStyle, top: card.badgeTop, right: card.badgeRight }}>
                {card.id}
              </div>
              
              <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#ebebea" }}>
                {card.img ? (
                  <Image src={card.img} alt={card.label} fill style={{ objectFit: "cover" }} draggable={false} />
                ) : (
                  <div style={placeholderStyle}>{card.cat}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        {selectedLabel && <div style={footerInfoStyle}>{selectedLabel}</div>}
      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const FONT = "'Courier Prime', 'Courier New', monospace";
const pageStyle: React.CSSProperties = { position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#ffffff" };
const dotGridStyle: React.CSSProperties = { position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #A8C8E8 1px, transparent 1.3px)", backgroundSize: "18px 18px", zIndex: 0, pointerEvents: "none", willChange: "background-position" };
const navStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, right: 0, height: 43, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px", zIndex: 300, background: "#fff" };
const logoStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 14, letterSpacing: "0.10em", color: "#707070", textDecoration: "none" };
const navLinkStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 13, letterSpacing: "0.14em", color: "#111", textDecoration: "none", textTransform: "uppercase" };
const blueBadgeStyle: React.CSSProperties = { position: "absolute", width: 32, height: 32, borderRadius: "50%", background: "#3B72C8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, zIndex: 20, fontFamily: FONT };
const footerInfoStyle: React.CSSProperties = { position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 2, padding: "10px 20px", fontFamily: FONT, fontSize: 13, color: "#111", zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" };
const placeholderStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: FONT, fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" };