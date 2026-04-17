"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

/* ── Configuration ────────────────────────────────────────────────────── */
const TOTAL_CARDS = 30;

// Expanded World Size to ensure 30 unique spots
const WORLD_W = 3400; 
const WORLD_H = 2600;
const WRAP_BUFFER = 600; 

interface CardDef {
  id: number;
  label: string;
  cat: string;
  img?: string;
  w: number;
  h: number;
}

const CARDS_DATA: CardDef[] = Array.from({ length: TOTAL_CARDS }, (_, i) => ({
  id: i + 1,
  label: `Project ${String(i + 1).padStart(2, '0')}`,
  cat: ["Product", "Poster", "Branding", "UI", "Motion"][i % 5],
  // Controlled sizes to help prevent overlap math
  w: [280, 340, 400, 310, 370][i % 5],
  h: [360, 250, 390, 410, 290][(i * 3) % 5],
}));

export default function Playground() {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panOffset = useRef({ x: 0, y: 0 });
  const dragDist = useRef(0);

  // FIXED: Distribution logic using a 6x5 matrix with extra padding
  const cardBasePos = useRef(
    CARDS_DATA.map((_, i) => {
      const cols = 6;
      const cellW = WORLD_W / cols;
      const cellH = WORLD_H / 5;
      
      const col = i % cols;
      const row = Math.floor(i / cols);

      return {
        // Position card in center of cell + slight organic offset (max 30px)
        x: col * cellW + (cellW - 400) / 2 + (Math.random() * 30),
        y: row * cellH + (cellH - 400) / 2 + (Math.random() * 30),
      };
    })
  );

  const renderPositions = useCallback(() => {
    // FIXED: Grid visibility and infinite panning sync
    if (bgRef.current) {
      const gx = panOffset.current.x % 18;
      const gy = panOffset.current.y % 18;
      bgRef.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    }

    cardRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const base = cardBasePos.current[i];
      let x = base.x + panOffset.current.x;
      let y = base.y + panOffset.current.y;

      let renderX = (((x + WRAP_BUFFER) % WORLD_W) + WORLD_W) % WORLD_W - WRAP_BUFFER;
      let renderY = (((y + WRAP_BUFFER) % WORLD_H) + WORLD_H) % WORLD_H - WRAP_BUFFER;

      ref.style.transform = `translate3d(${renderX}px, ${renderY}px, 0)`;
    });
  }, []);

  useEffect(() => {
    renderPositions();
    const onWheel = (e: WheelEvent) => {
      panOffset.current.x -= e.deltaX;
      panOffset.current.y -= e.deltaY;
      renderPositions();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [renderPositions]);

  const startPanDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("nav")) return;
    dragDist.current = 0;
    const isTouch = e.type === "touchstart";
    const startX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const startY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    const initialPanX = panOffset.current.x;
    const initialPanY = panOffset.current.y;

    const onMove = (ev: MouseEvent | TouchEvent) => {
      const currentX = ev.type === "touchmove" ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX;
      const currentY = ev.type === "touchmove" ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;
      dragDist.current = Math.abs(dx) + Math.abs(dy);
      panOffset.current.x = initialPanX + dx;
      panOffset.current.y = initialPanY + dy;
      renderPositions();
    };

    const onUp = () => {
      window.removeEventListener(isTouch ? "touchmove" : "mousemove", onMove);
      window.removeEventListener(isTouch ? "touchend" : "mouseup", onUp);
    };
    window.addEventListener(isTouch ? "touchmove" : "mousemove", onMove);
    window.addEventListener(isTouch ? "touchend" : "mouseup", onUp);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
          width: 100%; height: 100%; overflow: hidden; 
          background: #fff; cursor: default; 
        }
        .playground-canvas { 
          width: 100vw; height: 100vh; position: relative; overflow: hidden; 
          cursor: grab;
        }
        .playground-canvas:active { cursor: grabbing; }
      `}</style>

      <div onMouseDown={startPanDrag} onTouchStart={startPanDrag} className="playground-canvas">
        
        {/* FIXED: Dotted grid re-implemented with high z-index visibility */}
        <div 
          ref={bgRef} 
          style={{
            position: "absolute",
            inset: "-200px", 
            backgroundImage: "radial-gradient(circle, #A8C8E8 1px, transparent 1.2px)",
            backgroundSize: "18px 18px",
            zIndex: 0,
            pointerEvents: "none",
          }} 
        />

        {/* UI Lines */}
        <div style={{ position: "absolute", top: 43, left: 0, right: 0, height: 2, background: "#E03030", zIndex: 200, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 47, left: 0, right: 0, height: 2, background: "#3B72C8", zIndex: 200, pointerEvents: "none" }} />

        <nav style={navStyle}>
          <Link href="/" style={logoStyle}>KRIS</Link>
          <div style={{ display: "flex", gap: 40 }}>
            {["WORK", "PLAYGROUND", "LIBRARY", "ABOUT"].map((l) => (
              <Link key={l} href={l === "PLAYGROUND" ? "/playground" : "/"} style={{ ...navLinkStyle, textDecoration: l === "PLAYGROUND" ? "underline" : "none", textUnderlineOffset: 3 }}>
                {l}
              </Link>
            ))}
          </div>
        </nav>

        {/* The 30 Cards */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {CARDS_DATA.map((card, i) => (
            <div
              key={card.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              onClick={() => dragDist.current < 5 && setSelectedLabel(`${card.id} · ${card.label} · ${card.cat}`)}
              style={{
                position: "absolute", left: 0, top: 0,
                width: card.w, height: card.h,
                backgroundColor: "#fff",
                borderRadius: 2,
                boxShadow: "2px 3px 4px rgba(0,0,0,0.1)",
                pointerEvents: "auto",
                userSelect: "none",
                willChange: "transform",
                zIndex: 10,
              }}
            >
              {/* FIXED: Number font is now Arial (Sans-Serif) */}
              <div style={blueBadgeStyle}>{card.id}</div>
              
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

        {selectedLabel && <div style={footerInfoStyle}>{selectedLabel}</div>}
      </div>
    </>
  );
}

const FONT = "'Courier Prime', 'Courier New', monospace";
const SANS = "Arial, Helvetica, sans-serif";

const navStyle: React.CSSProperties = { position: "absolute", top: 0, left: 0, right: 0, height: 43, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px", zIndex: 300, background: "#fff" };
const logoStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 14, letterSpacing: "0.10em", color: "#707070", textDecoration: "none" };
const navLinkStyle: React.CSSProperties = { fontFamily: FONT, fontSize: 13, letterSpacing: "0.14em", color: "#111", textDecoration: "none", textTransform: "uppercase" };

const blueBadgeStyle: React.CSSProperties = { 
  position: "absolute", top: -14, right: -14, 
  width: 32, height: 32, borderRadius: "50%", 
  background: "#3B72C8", color: "#fff", 
  display: "flex", alignItems: "center", justifyContent: "center", 
  fontSize: "14px", fontWeight: "bold", 
  zIndex: 20, fontFamily: SANS, 
  boxShadow: "0 2px 6px rgba(59, 114, 200, 0.3)" 
};

const footerInfoStyle: React.CSSProperties = { position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 2, padding: "10px 20px", fontFamily: FONT, fontSize: 13, color: "#111", zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", whiteSpace: "nowrap" };
const placeholderStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: FONT, fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" };