"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Note {
  id: string;
  xPct: number;
  yPct: number;
  color: string;
  width: number;
  minHeight?: number;
  zIndex: number;
  content: React.ReactNode;
  isUserAdded?: boolean;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const FONT  = "'Courier Prime', 'Courier New', monospace";
const CFONT = "Consolas, 'Courier New', monospace";

const USER_CARD_COLORS = ["#FFA0BB", "#C9E6EF", "#F1DD77", "#F7F6EF"];

const DESKTOP_POSITIONS = [
  { id: "intro",     xPct: 30, yPct: 25, color: "#43669e", width: 235, zIndex: 4 },
  { id: "quote",     xPct: 50, yPct: 20, color: "#2f812f", width: 320, zIndex: 6 },
  { id: "education", xPct: 44, yPct: 33, color: "#c06408", width: 250, zIndex: 8 },
  { id: "red",       xPct: 50, yPct: 45, color: "#b02415", width: 200, zIndex: 5 },
];

const MOBILE_POSITIONS = [
  { id: "intro",     xPct: 12, yPct: 28, color: "#43669e", width: 250, zIndex: 4 },
  { id: "quote",     xPct: 26, yPct: 17, color: "#2f812f", width: 275, zIndex: 6 },
  { id: "education", xPct: 38, yPct: 48, color: "#c06408", width: 225, zIndex: 8 },
  { id: "red",       xPct: 20, yPct: 57, color: "#b02415", width: 200, zIndex: 5 },
];

const PROJECTS: {
  id: number;
  label: string;
  cat: string;
  btnColor: string;
  btnLabel: string;
  href: string | null;
}[] = [
  {
    id: 0,
    label: "The Render House",
    cat: "An open-source library of designs that transforms everyday graphics into collectible statements.",
    btnColor: "#E03030",
    btnLabel: "VIEW",
    href: "https://therenderhouse.com",
  },
  {
    id: 1,
    label: "The ABC Archive",
    cat: "A curated repository where physical objects, digital systems, and visual narratives converge into a continuum of design.",
    btnColor: "#3B72C8",
    btnLabel: "VIEW",
    href: "https://theabcarchive.com",
  },
  {
    id: 2,
    label: "Generative Thinking",
    cat: "An ongoing exploration of generative systems as tools for creative and conceptual design practice.",
    btnColor: "#999",
    btnLabel: "IN PROGRESS",
    href: null,
  },
  {
    id: 3,
    label: "Konsept",
    cat: "A design tool built for quick and easy visualization. Designed for creators of all kinds.",
    btnColor: "#999",
    btnLabel: "IN PROGRESS",
    href: null,
  },
];

const N = PROJECTS.length;

// ─── Styles ───────────────────────────────────────────────────────────────────
const titleStyle: React.CSSProperties = {
  color: "#fff", fontFamily: FONT, fontWeight: 400,
  fontSize: 14, marginBottom: 14, letterSpacing: "0.02em",
};
const bodyStyle: React.CSSProperties = {
  color: "#fff", fontFamily: FONT, fontWeight: 400,
  fontSize: 13.5, lineHeight: 1.8, letterSpacing: "0.01em",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cardSizeFromText(t: string) {
  const l = t.length;
  if (l <= 30) return { width: 160, minHeight: 160 };
  if (l <= 60) return { width: 190, minHeight: 190 };
  if (l <= 80) return { width: 210, minHeight: 210 };
  return { width: 230, minHeight: 230 };
}

function randomSpawnPosition(isMobile: boolean) {
  if (isMobile) return { xPct: 4  + Math.random() * 44, yPct: 10 + Math.random() * 55 };
  return              { xPct: 28 + Math.random() * 30, yPct: 28 + Math.random() * 28 };
}

function buildInitialNotes(isMobile: boolean): Note[] {
  const P = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;
  return [
    {
      ...P[0],
      content: (
        <div>
          <p style={titleStyle}>Hi! I&apos;m Kris :)</p>
          <p style={bodyStyle}>
            Working at the intersection of digital and physical culture, I explore
            technology as a space for creative expression.
          </p>
        </div>
      ),
    },
    {
      ...P[1],
      content: (
        <p style={{ ...bodyStyle, whiteSpace: "pre-wrap" }}>
          {`"Carpe Diem," Keating whispered loudly. "Seize the day. Make your lives extraordinary."`}
        </p>
      ),
    },
    {
      ...P[2],
      content: (
        <p style={{ ...bodyStyle, whiteSpace: "pre-wrap" }}>
          I am currently pursuing BS Information Technology at Bicol University.
        </p>
      ),
    },
    { ...P[3], content: <div /> },
  ];
}

// ─── SplashScreen ─────────────────────────────────────────────────────────────
// Simple doodle circuit draws itself with stroke-dashoffset.
// No text — just the circuit. Fades out at 1.7s, done at 2.05s.
//
// Layout (200×140 viewBox):
//   Left wire    (20,105)→(20,20)
//   Top wire     (20,20)→(200,20)  with resistor zigzag at center
//   Right wire   (200,20)→(200,105) with capacitor plates mid-right
//   Bottom wire  (200,105)→(20,105) with LED triangle near right
//   Battery      on left wire, mid-height
//
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2050);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#3B5FA0",
      display: "flex",
      alignItems: "center", justifyContent: "center",
      animation: "splashOut 0.35s ease-in forwards 1.7s",
    }}>
      <style>{`
        @keyframes splashOut { to { opacity: 0; pointer-events: none; } }
        @keyframes dw        { to { stroke-dashoffset: 0; } }
        @keyframes ci        { from { opacity: 0; } to { opacity: 1; } }
        .cd {
          fill: none;
          stroke: #fff;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      `}</style>

      <svg viewBox="0 0 200 140" width="280" height="196" style={{ overflow: "visible" }}>

        {/* Left wire: (20,105)→(20,20) — length 85 */}
        <line className="cd" x1="20" y1="105" x2="20" y2="20"
          strokeWidth="2" strokeDasharray="85" strokeDashoffset="85"
          style={{ animation: "dw 0.22s ease forwards 0.05s" }} />

        {/* Top wire left: (20,20)→(68,20) — length 48 */}
        <line className="cd" x1="20" y1="20" x2="68" y2="20"
          strokeWidth="2" strokeDasharray="48" strokeDashoffset="48"
          style={{ animation: "dw 0.13s ease forwards 0.26s" }} />

        {/* Resistor — simple doodle zigzag, 3 teeth only */}
        <path className="cd"
          d="M68,20 L74,20 L78,11 L86,29 L94,11 L102,29 L106,20 L126,20"
          strokeWidth="2" strokeDasharray="105" strokeDashoffset="105"
          style={{ animation: "dw 0.24s ease forwards 0.38s" }} />

        {/* Top wire right: (126,20)→(200,20) — length 74 */}
        <line className="cd" x1="126" y1="20" x2="200" y2="20"
          strokeWidth="2" strokeDasharray="74" strokeDashoffset="74"
          style={{ animation: "dw 0.19s ease forwards 0.60s" }} />

        {/* Right wire top: (200,20)→(200,55) — length 35 */}
        <line className="cd" x1="200" y1="20" x2="200" y2="55"
          strokeWidth="2" strokeDasharray="35" strokeDashoffset="35"
          style={{ animation: "dw 0.10s ease forwards 0.77s" }} />

        {/* Capacitor plate 1 */}
        <line className="cd" x1="188" y1="55" x2="212" y2="55"
          strokeWidth="3" strokeDasharray="24" strokeDashoffset="24"
          style={{ animation: "dw 0.09s ease forwards 0.86s" }} />

        {/* Capacitor plate 2 */}
        <line className="cd" x1="188" y1="66" x2="212" y2="66"
          strokeWidth="3" strokeDasharray="24" strokeDashoffset="24"
          style={{ animation: "dw 0.09s ease forwards 0.94s" }} />

        {/* Right wire bottom: (200,66)→(200,105) — length 39 */}
        <line className="cd" x1="200" y1="66" x2="200" y2="105"
          strokeWidth="2" strokeDasharray="39" strokeDashoffset="39"
          style={{ animation: "dw 0.11s ease forwards 1.02s" }} />

        {/* Bottom wire right: (200,105)→(148,105) — length 52 */}
        <line className="cd" x1="200" y1="105" x2="148" y2="105"
          strokeWidth="2" strokeDasharray="52" strokeDashoffset="52"
          style={{ animation: "dw 0.14s ease forwards 1.12s" }} />

        {/* LED triangle: (148,97)→(148,113)→(136,105)→close */}
        <path className="cd"
          d="M148,97 L148,113 L136,105 Z"
          strokeWidth="2" strokeDasharray="48" strokeDashoffset="48"
          style={{ animation: "dw 0.15s ease forwards 1.25s" }} />

        {/* LED cathode bar */}
        <line className="cd" x1="136" y1="97" x2="136" y2="113"
          strokeWidth="2.5" strokeDasharray="16" strokeDashoffset="16"
          style={{ animation: "dw 0.07s ease forwards 1.39s" }} />

        {/* LED shine rays */}
        <g style={{ opacity: 0, animation: "ci 0.14s ease forwards 1.45s" }}>
          <line className="cd" x1="127" y1="95" x2="122" y2="90" strokeWidth="1.5" />
          <line className="cd" x1="131" y1="91" x2="128" y2="85" strokeWidth="1.5" />
        </g>

        {/* Bottom wire left: (136,105)→(20,105) — length 116 */}
        <line className="cd" x1="136" y1="105" x2="20" y2="105"
          strokeWidth="2" strokeDasharray="116" strokeDashoffset="116"
          style={{ animation: "dw 0.30s ease forwards 1.47s" }} />

        {/* Battery minus plate (shorter) */}
        <line className="cd" x1="12" y1="75" x2="28" y2="75"
          strokeWidth="2" strokeDasharray="16" strokeDashoffset="16"
          style={{ animation: "dw 0.08s ease forwards 0.87s" }} />

        {/* Battery plus plate (longer, thicker) */}
        <line className="cd" x1="10" y1="66" x2="30" y2="66"
          strokeWidth="3.5" strokeDasharray="20" strokeDashoffset="20"
          style={{ animation: "dw 0.08s ease forwards 0.95s" }} />

        {/* + − labels */}
        <g style={{ opacity: 0, animation: "ci 0.12s ease forwards 1.02s" }}>
          <text x="33" y="64" fill="#fff" fontSize="9" fontFamily="monospace" opacity="0.7">+</text>
          <text x="33" y="78" fill="#fff" fontSize="9" fontFamily="monospace" opacity="0.7">−</text>
        </g>

      </svg>
    </div>
  );
}


// ─── DraggableNote ────────────────────────────────────────────────────────────
function DraggableNote({
  note, onBringToFront, onClose,
}: {
  note: Note;
  onBringToFront: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const ref      = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset   = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const parent = el.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const rect   = el.getBoundingClientRect();
    const curX   = rect.left - parent.left;
    const curY   = rect.top  - parent.top;
    el.style.left    = curX + "px";
    el.style.top     = curY + "px";
    offset.current   = { x: clientX - curX, y: clientY - curY };
    dragging.current = true;
    onBringToFront(note.id);
  }, [note.id, onBringToFront]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current || !ref.current) return;
      ref.current.style.left = (ev.clientX - offset.current.x) + "px";
      ref.current.style.top  = (ev.clientY - offset.current.y) + "px";
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [startDrag]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
    const onMove = (ev: TouchEvent) => {
      if (!ref.current) return;
      const tt = ev.touches[0];
      ref.current.style.left = (tt.clientX - offset.current.x) + "px";
      ref.current.style.top  = (tt.clientY - offset.current.y) + "px";
    };
    const onEnd = () => {
      dragging.current = false;
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend",  onEnd);
  }, [startDrag]);

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position: "absolute",
        left: `${note.xPct}vw`,
        top: `calc(43px + ${note.yPct}vh)`,
        width: note.width,
        minHeight: note.minHeight ?? (note.id === "red" ? 200 : undefined),
        backgroundColor: note.color,
        borderRadius: 2,
        padding: "22px 20px 28px",
        cursor: "grab",
        userSelect: "none",
        boxShadow: "3px 5px 16px rgba(0,0,0,0.22)",
        zIndex: note.zIndex,
      }}
    >
      <button
        onClick={() => onClose(note.id)}
        style={{
          position: "absolute", top: 10, right: 12,
          background: "none", border: "none",
          color: note.color === "#F7F6EF" ? "#555" : "#fff",
          fontSize: 16, lineHeight: 1,
          cursor: "pointer", opacity: 0.85,
          fontFamily: FONT, padding: "2px 4px",
        }}
      >✕</button>
      {note.content}
    </div>
  );
}

// ─── NotesSection ─────────────────────────────────────────────────────────────
function NotesSection({
  notes, bringToFront, closeNote, showProjects,
}: {
  notes: Note[];
  bringToFront: (id: string) => void;
  closeNote: (id: string) => void;
  showProjects: boolean;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "#fff",
      transform: showProjects ? "translateY(-100%)" : "translateY(0%)",
      transition: "transform 0.75s cubic-bezier(0.76, 0, 0.24, 1)",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, #A8C8E8 1px, transparent 1.3px)",
        backgroundSize: "18px 18px", backgroundPosition: "13px 13px",
        pointerEvents: "none",
      }} />
      {notes.map(note => (
        <DraggableNote
          key={note.id}
          note={note}
          onBringToFront={bringToFront}
          onClose={closeNote}
        />
      ))}
      <p className="hint-text" style={{
        position: "absolute", bottom: 34, left: "50%",
        transform: "translateX(-50%)",
        fontFamily: FONT, fontSize: 13, color: "#999",
        letterSpacing: "0.05em", zIndex: 2,
        whiteSpace: "nowrap", pointerEvents: "none",
      }}>
        (drag and clear notes)
      </p>
    </div>
  );
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: typeof PROJECTS[number] }) {
  return (
    <div style={{
      width: "100%",
      height: "100%",
      borderRadius: 14,
      background: "#fff",
      boxShadow: "0 20px 60px rgba(0,0,0,0.26)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{
        flex: 1,
        background: "#e8e8e6",
        borderRadius: "14px 14px 0 0",
      }} />
      <div style={{
        padding: "12px 16px 14px",
        borderTop: "1px solid #eaeaea",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: CFONT, fontSize: 14, color: "#111",
            letterSpacing: "0.05em", textTransform: "uppercase",
            marginBottom: 4,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {project.label}
          </p>
          <p style={{
            fontFamily: CFONT, fontSize: 11.5, color: "#777",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {project.cat}
          </p>
        </div>
        {project.href ? (
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flexShrink: 0,
              display: "inline-flex", alignItems: "center",
              padding: "6px 14px", borderRadius: 2,
              border: "1px solid #111", background: "transparent",
              fontFamily: CFONT, fontSize: 10, color: "#111",
              letterSpacing: "0.12em", textTransform: "uppercase",
              textDecoration: "none", whiteSpace: "nowrap",
              cursor: "pointer", transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "#111";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#111";
            }}
          >
            View ↗
          </a>
        ) : (
          <span style={{
            flexShrink: 0,
            display: "inline-flex", alignItems: "center",
            padding: "6px 14px", borderRadius: 2,
            border: "1px solid #ddd",
            fontFamily: CFONT, fontSize: 10, color: "#bbb",
            letterSpacing: "0.12em", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            In Progress
          </span>
        )}
      </div>
    </div>
  );
}

// ─── ProjectsSection ──────────────────────────────────────────────────────────
function ProjectsSection({
  virtualIdx,
  isMobile,
  onBack,
}: {
  virtualIdx: number;
  isMobile: boolean;
  onBack: () => void;
}) {
  const GAP    = 28;
  const WINDOW = 3;

  const [slotPx, setSlotPx] = useState(660);
  const [vw, setVw] = useState(1440);

  useEffect(() => {
    const onResize = () => {
      setSlotPx(Math.min(660, 0.62 * window.innerWidth));
      setVw(window.innerWidth);
    };
    onResize();
    if (isMobile) return;
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobile]);

  const mobileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isMobile) return;
    const frame = requestAnimationFrame(() => {
      const el = mobileRef.current;
      if (!el) return;
      let startY = 0, startTop = 0;
      const onTS = (e: TouchEvent) => { startY = e.touches[0].clientY; startTop = el.scrollTop; };
      const onTE = (e: TouchEvent) => {
        if (startTop <= 5 && e.changedTouches[0].clientY - startY > 55) onBack();
      };
      el.addEventListener("touchstart", onTS, { passive: true });
      el.addEventListener("touchend",   onTE, { passive: true });
      (el as HTMLDivElement & { _cleanup?: () => void })._cleanup = () => {
        el.removeEventListener("touchstart", onTS);
        el.removeEventListener("touchend",   onTE);
      };
    });
    return () => {
      cancelAnimationFrame(frame);
      const el = mobileRef.current as (HTMLDivElement & { _cleanup?: () => void }) | null;
      el?._cleanup?.();
    };
  }, [isMobile, onBack]);

  if (isMobile) {
    return (
      <div ref={mobileRef} className="mobile-projects-scroll" style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: "#3B5FA0", overflowY: "auto", overflowX: "hidden",
      }}>
        <div style={{
          position: "fixed", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1.3px)",
          backgroundSize: "18px 18px", backgroundPosition: "13px 13px",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "relative", zIndex: 1,
          padding: "56px 16px 80px",
          display: "flex", flexDirection: "column", gap: 18,
        }}>
          {PROJECTS.map(project => (
            <div key={project.id} style={{ width: "100%", height: "calc(100vw - 32px)", maxHeight: 400 }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const step = slotPx + GAP;
  const trackCenterX = vw / 2 - slotPx / 2;
  const slotIndices = Array.from({ length: 2 * WINDOW + 1 }, (_, i) => virtualIdx - WINDOW + i);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 150,
      background: "#3B5FA0", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1.3px)",
        backgroundSize: "18px 18px", backgroundPosition: "13px 13px",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        top: "50%",
        left: trackCenterX,
        width: slotPx,
        height: "calc(100vh - 190px)",
        transform: "translateY(-52%)",
      }}>
        {slotIndices.map((slotIdx) => {
          const projIdx  = ((slotIdx % N) + N) % N;
          const offset   = slotIdx - virtualIdx;
          const isActive = offset === 0;
          return (
            <div
              key={slotIdx}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%", height: "100%",
                transform: `translateX(${offset * step}px) scale(${isActive ? 1 : 0.94})`,
                opacity:   isActive ? 1 : 0.5,
                transition: "transform 0.52s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.52s ease",
              }}
            >
              <ProjectCard project={PROJECTS[projIdx]} />
            </div>
          );
        })}
      </div>
      <p style={{
        position: "absolute", bottom: 22, left: "50%",
        transform: "translateX(-50%)",
        fontFamily: CFONT, fontSize: 11,
        color: "rgba(255,255,255,0.50)",
        letterSpacing: "0.14em", zIndex: 30,
        whiteSpace: "nowrap",
      }}>
        ({((virtualIdx % N) + N) % N + 1} OUT OF {N})
      </p>
    </div>
  );
}

// ─── ExploreButton ────────────────────────────────────────────────────────────
function ExploreButton({
  deletedCount, onRestoreCards, onAddCard, onRestart,
}: {
  deletedCount: number;
  onRestoreCards: () => void;
  onAddCard: (text: string) => void;
  onRestart: () => void;
}) {
  const [open,    setOpen]    = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [text,    setText]    = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (addMode && textareaRef.current) textareaRef.current.focus();
  }, [addMode]);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddCard(trimmed);
    setText(""); setAddMode(false); setOpen(false);
  };

  const rowBtn: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    width: "100%", padding: "8px 16px",
    background: "none", border: "none", cursor: "pointer",
    fontFamily: FONT, fontSize: 12,
    letterSpacing: "0.10em", textTransform: "uppercase",
    color: "#111", textAlign: "left",
  };

  return (
    <div
      className="explore-btn"
      style={{ position: "fixed", top: 60, right: 20, zIndex: 600, paddingTop: 8 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setAddMode(false); }}
    >
      <button style={{
        width: 36, height: 36, borderRadius: "50%",
        background: open ? "#3B72C8" : "#fff",
        border: open ? "1px solid #3B72C8" : "1px solid #e0e0e0",
        boxShadow: "2px 3px 8px rgba(0,0,0,0.12)",
        fontFamily: FONT, fontSize: 16, fontWeight: 700,
        color: open ? "#fff" : "#111", cursor: "default",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.18s, color 0.18s, border-color 0.18s",
        position: "relative", zIndex: 602,
      }} title="Explore">!</button>

      <div style={{
        position: "absolute", top: 44, right: 0,
        background: "#fff", border: "1px solid #e0e0e0",
        borderRadius: 2, padding: "8px 0", minWidth: 168,
        boxShadow: "2px 3px 10px rgba(0,0,0,0.12)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transform: open ? "translateY(0)" : "translateY(-6px)",
        transition: "opacity 0.16s ease, transform 0.16s ease",
        zIndex: 601,
      }}>
        <button
          onClick={() => { if (!deletedCount) return; setOpen(false); onRestoreCards(); }}
          style={{ ...rowBtn, cursor: deletedCount > 0 ? "pointer" : "default", color: deletedCount > 0 ? "#111" : "#ccc" }}
          onMouseEnter={e => { if (deletedCount > 0) (e.currentTarget as HTMLElement).style.background = "#f3f3f1"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <span style={{ fontSize: 11, opacity: deletedCount > 0 ? 1 : 0.4 }}>↩</span>
          Restore Cards
          {deletedCount > 0 && (
            <span style={{
              marginLeft: "auto", background: "#3B72C8", color: "#fff",
              borderRadius: "50%", width: 16, height: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, flexShrink: 0,
            }}>{deletedCount}</span>
          )}
        </button>
        <div style={{ height: 1, background: "#ebebea", margin: "4px 0" }} />
        {!addMode ? (
          <button
            onClick={() => setAddMode(true)}
            style={rowBtn}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f3f3f1"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <span style={{ fontSize: 13 }}>+</span>Add a Card
          </button>
        ) : (
          <div style={{ padding: "8px 14px 10px" }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value.slice(0, 100))}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
                if (e.key === "Escape") { setAddMode(false); setText(""); }
              }}
              placeholder="Write something..."
              rows={3}
              style={{
                width: "100%", resize: "none",
                fontFamily: FONT, fontSize: 12, color: "#111",
                border: "1px solid #ddd", borderRadius: 2,
                padding: "6px 8px", outline: "none", lineHeight: 1.6,
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: FONT, fontSize: 10, color: "#aaa" }}>{text.length}/100</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => { setAddMode(false); setText(""); }}
                  style={{ fontFamily: FONT, fontSize: 11, color: "#999", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}
                >Cancel</button>
                <button
                  onClick={handleAdd}
                  disabled={!text.trim()}
                  style={{
                    fontFamily: FONT, fontSize: 11,
                    background: "#3B72C8", color: "#fff",
                    border: "none", borderRadius: 2, padding: "4px 10px",
                    cursor: text.trim() ? "pointer" : "default",
                    opacity: text.trim() ? 1 : 0.4,
                    textTransform: "uppercase",
                  }}
                >Add</button>
              </div>
            </div>
          </div>
        )}
        <div style={{ height: 1, background: "#ebebea", margin: "4px 0" }} />
        <button
          onClick={() => { setOpen(false); setAddMode(false); onRestart(); }}
          style={rowBtn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f3f3f1"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <span style={{ fontSize: 12 }}>⟳</span>Restart
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [mounted,      setMounted]      = useState(false);
  const [splashDone,   setSplashDone]   = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);
  const [notes,        setNotes]        = useState<Note[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [showProjects, setShowProjects] = useState(false);

  const [virtualIdx, setVirtualIdx] = useState(0);

  const colorIndexRef = useRef(0);
  const initKeyRef    = useRef<string | null>(null);

  const topZRef      = useRef(10);
  const [, _setTopZ] = useState(10);
  const setTopZ = useCallback((v: number | ((prev: number) => number)) => {
    _setTopZ(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      topZRef.current = next;
      return next;
    });
  }, []);

  const showProjectsRef = useRef(false);
  const isMobileRef     = useRef(false);
  const cardBusy        = useRef(false);
  const notesBusy       = useRef(false);
  const wheelAccum      = useRef(0);
  const lastFire        = useRef(0);
  const touchStartY     = useRef(0);
  const touchStartX     = useRef(0);

  useEffect(() => { showProjectsRef.current = showProjects; }, [showProjects]);
  useEffect(() => { isMobileRef.current = isMobile; },       [isMobile]);

  const goNext = useCallback(() => {
    if (cardBusy.current) return;
    cardBusy.current = true;
    wheelAccum.current = 0;
    lastFire.current = Date.now();
    setVirtualIdx(i => i + 1);
    setTimeout(() => { cardBusy.current = false; }, 560);
  }, []);

  const goPrev = useCallback(() => {
    if (cardBusy.current) return;
    cardBusy.current = true;
    wheelAccum.current = 0;
    lastFire.current = Date.now();
    setVirtualIdx(i => i - 1);
    setTimeout(() => { cardBusy.current = false; }, 560);
  }, []);

  const goBackToNotes = useCallback(() => {
    if (notesBusy.current) return;
    notesBusy.current = true;
    wheelAccum.current = 0;
    setShowProjects(false);
    showProjectsRef.current = false;
    setTimeout(() => { notesBusy.current = false; }, 850);
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (isMobileRef.current && showProjectsRef.current) {
        const el = document.querySelector(".mobile-projects-scroll");
        if (el && el.scrollTop <= 5 && delta < 0) {
          e.preventDefault();
          wheelAccum.current += delta;
          if (wheelAccum.current <= -60) { wheelAccum.current = 0; goBackToNotes(); }
        } else { wheelAccum.current = 0; }
        return;
      }

      e.preventDefault();
      if (notesBusy.current) return;

      if (!showProjectsRef.current) {
        if (delta <= 0) { wheelAccum.current = Math.max(0, wheelAccum.current - 20); return; }
        wheelAccum.current += delta;
        if (wheelAccum.current > 120) {
          wheelAccum.current = 0;
          notesBusy.current = true;
          setShowProjects(true);
          showProjectsRef.current = true;
          setTimeout(() => { notesBusy.current = false; }, 850);
        }
        return;
      }

      if (cardBusy.current) return;
      if (Date.now() - lastFire.current < 120) return;

      if (delta < 0) {
        wheelAccum.current += delta;
        if (wheelAccum.current <= -80) { wheelAccum.current = 0; goBackToNotes(); }
      } else {
        wheelAccum.current += delta;
        if (wheelAccum.current >= 80) { wheelAccum.current = 0; goNext(); }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const dx = touchStartX.current - e.changedTouches[0].clientX;

      if (isMobileRef.current) {
        if (!showProjectsRef.current && !notesBusy.current) {
          if (dy > 60 && Math.abs(dy) > Math.abs(dx)) {
            notesBusy.current = true;
            setShowProjects(true);
            showProjectsRef.current = true;
            setTimeout(() => { notesBusy.current = false; }, 850);
          }
        }
        return;
      }

      if (notesBusy.current || cardBusy.current) return;
      if (!showProjectsRef.current) {
        if (dy > 60 && Math.abs(dy) > Math.abs(dx)) {
          notesBusy.current = true;
          setShowProjects(true);
          showProjectsRef.current = true;
          setTimeout(() => { notesBusy.current = false; }, 850);
        }
        return;
      }
      if (Math.abs(dx) >= Math.abs(dy)) {
        if (dx >  45) goNext();
        if (dx < -45) goPrev();
      } else {
        if (dy < -45) goBackToNotes();
        if (dy >  45) goNext();
      }
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  });
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, [goNext, goPrev, goBackToNotes]);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const key = isMobile ? "m" : "d";
    if (initKeyRef.current === key) return;
    initKeyRef.current = key;
    setNotes(buildInitialNotes(isMobile));
    setDeletedNotes([]);
    setTopZ(10);
    colorIndexRef.current = 0;
  }, [isMobile, setTopZ]);

  const bringToFront = useCallback((id: string) => {
    setTopZ(z => {
      const next = z + 1;
      setNotes(prev => prev.map(n => n.id === id ? { ...n, zIndex: next } : n));
      return next;
    });
  }, [setTopZ]);

  const closeNote = useCallback((id: string) => {
    setNotes(prev => {
      const removed = prev.find(n => n.id === id);
      if (removed) setDeletedNotes(d => [...d, removed]);
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const restoreCards = useCallback(() => {
    setDeletedNotes(deleted => {
      if (!deleted.length) return deleted;
      const ts    = Date.now();
      const baseZ = topZRef.current;
      const restored = deleted.map((n, i) => ({ ...n, id: `${n.id}-r${ts}-${i}`, zIndex: baseZ + i + 1 }));
      const newZ = baseZ + deleted.length;
      topZRef.current = newZ;
      _setTopZ(newZ);
      setNotes(prev => [...prev, ...restored]);
      return [];
    });
  }, []);

  const addCard = useCallback((text: string) => {
    const color           = USER_CARD_COLORS[colorIndexRef.current % USER_CARD_COLORS.length];
    colorIndexRef.current += 1;
    const sizing          = isMobile ? { width: 140, minHeight: 140 } : cardSizeFromText(text);
    const { xPct, yPct } = randomSpawnPosition(isMobile);
    const z               = topZRef.current + 1;
    topZRef.current       = z;
    _setTopZ(z);
    setNotes(prev => [...prev, {
      id: `user-${Date.now()}`,
      xPct, yPct, color, width: sizing.width, minHeight: sizing.minHeight,
      zIndex: z, isUserAdded: true,
      content: (
        <p style={{ ...bodyStyle, fontSize: 12.5, color: color === "#F7F6EF" ? "#333" : "#fff" }}>
          {text}
        </p>
      ),
    }]);
  }, [isMobile]);

  const handleRestart = useCallback(() => {
    const key = isMobile ? "m" : "d";
    initKeyRef.current = key;
    setNotes(buildInitialNotes(isMobile));
    setDeletedNotes([]);
    topZRef.current = 10;
    _setTopZ(10);
    colorIndexRef.current = 0;
    setShowProjects(false);
    showProjectsRef.current = false;
    setVirtualIdx(0);
    cardBusy.current   = false;
    notesBusy.current  = false;
    wheelAccum.current = 0;
    lastFire.current   = 0;
  }, [isMobile]);

  if (!mounted) {
    return <div style={{ background: "#3B5FA0", width: "100vw", height: "100vh" }} />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #3B5FA0; }
        .mobile-projects-scroll { overflow-y: auto !important; -webkit-overflow-scrolling: touch; }
        @media (max-width: 640px) {
          .explore-btn { top: 52px !important; right: 10px !important; }
          .hint-text   { font-size: 10px !important; bottom: 18px !important; }
          .nav-logo    { font-size: 12px !important; }
          .nav-links   { gap: 14px !important; }
          .nav-link    { font-size: 10px !important; letter-spacing: 0.06em !important; }
        }
      `}</style>

      {/* Splash screen — renders on top of everything, fades out after ~1.9s */}
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      <ProjectsSection virtualIdx={virtualIdx} isMobile={isMobile} onBack={goBackToNotes} />

      <NotesSection
        notes={notes}
        bringToFront={bringToFront}
        closeNote={closeNote}
        showProjects={showProjects}
      />

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 43,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", zIndex: 1000, background: "#fff",
      }}>
        <Link href="/" className="nav-logo" style={{
          fontFamily: FONT, fontWeight: 400, fontSize: 14,
          letterSpacing: "0.10em", color: "#707070", textDecoration: "none",
        }}>KRIS</Link>
        <div className="nav-links" style={{ display: "flex", gap: 40 }}>
          {[
            { label: "WORK",       href: "/"           },
            { label: "PLAYGROUND", href: "/playground" },
            { label: "ABOUT",      href: "#"           },
          ].map(item => (
            <Link key={item.label} href={item.href} className="nav-link" style={{
              fontFamily: FONT, fontWeight: 400, fontSize: 13,
              letterSpacing: "0.14em", color: "#111",
              textDecoration: "none", textTransform: "uppercase",
            }}>{item.label}</Link>
          ))}
        </div>
      </nav>

      <div style={{ position: "fixed", top: 43, left: 0, right: 0, height: 2, background: "#E03030", zIndex: 1000, pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 47, left: 0, right: 0, height: 2, background: "#3B72C8", zIndex: 1000, pointerEvents: "none" }} />

      <div style={{
        opacity: showProjects ? 0 : 1,
        pointerEvents: showProjects ? "none" : "auto",
        transition: "opacity 0.3s ease",
      }}>
        <ExploreButton
          deletedCount={deletedNotes.length}
          onRestoreCards={restoreCards}
          onAddCard={addCard}
          onRestart={handleRestart}
        />
      </div>
    </>
  );
}