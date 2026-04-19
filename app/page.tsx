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

type CardPhase = "idle" | "flyingUp" | "staging" | "dropping";

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
  { id: "intro",     xPct: 9, yPct: 25, color: "#43669e", width: 250, zIndex: 7 },
  { id: "quote",     xPct: 26, yPct: 15, color: "#2f812f", width: 275, zIndex: 6 },
  { id: "education", xPct: 40, yPct: 45, color: "#c06408", width: 225, zIndex: 8 },
  { id: "red",       xPct: 20, yPct: 55, color: "#b02415", width: 200, zIndex: 5 },
];

const PROJECTS = [
  {
    id: 0,
    label: "The Render House",
    cat: "An open-source library of designs that transforms everyday graphics into collectible statements.",
    color: "#E03030",
    href: "https://therenderhouse.com",
    btn: "View",
  },
  {
    id: 1,
    label: "The ABC Archive",
    cat: "A curated repository where physical objects, digital systems, and visual narratives converge into a continuum of design.",
    color: "#3B72C8",
    href: "https://theabcarchive.com",
    btn: "View",
  },
  {
    id: 2,
    label: "Generative Thinking",
    cat: "An exploration of generative design processes — where systems, randomness, and authorship blur into something new.",
    color: "#E03030",
    href: null,
    btn: "In Progress",
  },
  {
    id: 3,
    label: "Konsept",
    cat: "A design tool built for quick and easy visualization. Designed for creators of all kinds, it allows you to transform any idea into a clear sketch in just minutes.",
    color: "#3B72C8",
    href: null,
    btn: "In Progress",
  },
];

const N = PROJECTS.length;
const ANIM = 520; // ms — card animation duration

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
function ProjectCard({
  project, style,
}: {
  project: typeof PROJECTS[number];
  style: React.CSSProperties;
}) {
  return (
    <div style={style} className="project-card">
      <div style={{
        width: "100%", height: "100%",
        borderRadius: 14,
        background: "#fff",
        boxShadow: "0 24px 72px rgba(0,0,0,0.28)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Image area */}
        <div style={{
          flex: 1,
          background: "#e8e8e6",
          borderRadius: "14px 14px 0 0",
          position: "relative",
        }} />

        {/* Info strip */}
        <div style={{
          padding: "12px 16px 14px",
          borderTop: "1px solid #eaeaea",
          background: "#fff",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px 12px",
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

          {/* Action button — pill, not circle */}
          {project.href ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flexShrink: 0,
                display: "inline-flex", alignItems: "center",
                padding: "6px 14px",
                borderRadius: 2,
                border: "1px solid #111",
                background: "transparent",
                fontFamily: CFONT, fontSize: 10,
                color: "#111", letterSpacing: "0.12em",
                textTransform: "uppercase",
                textDecoration: "none",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
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
              padding: "6px 14px",
              borderRadius: 2,
              border: "1px solid #ddd",
              fontFamily: CFONT, fontSize: 10,
              color: "#bbb", letterSpacing: "0.12em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              In Progress
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ProjectsSection ──────────────────────────────────────────────────────────
function ProjectsSection({
  topIdx, phase, stagingIdx,
}: {
  topIdx: number;
  phase: CardPhase;
  stagingIdx: number | null;
}) {
  const slots = [0, 1, 2].map(o => (topIdx + o) % N);
  const showStaging = (phase === "staging" || phase === "dropping") && stagingIdx !== null;

  const restingTransform = (slot: number) => {
    const peekY     = slot * 18;
    const peekScale = 1 - slot * 0.04;
    // shift center slightly up so stacked cards peek below without clipping
    return `translateX(-50%) translateY(calc(-52% + ${peekY}px)) scale(${peekScale})`;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 150,
      background: "#3B5FA0",
      overflow: "hidden",
      perspective: "1200px",
      perspectiveOrigin: "50% 50%",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1.3px)",
        backgroundSize: "18px 18px", backgroundPosition: "13px 13px",
        pointerEvents: "none",
      }} />

      {[...slots].reverse().map((projectIdx, ri) => {
        const slot       = slots.length - 1 - ri;
        const isTop      = slot === 0;
        const isFlyingUp = phase === "flyingUp" && isTop;
        const effectiveSlot = showStaging && !isFlyingUp ? slot + 1 : slot;

        let transform:  string;
        let transition: string;
        let opacity     = 1;

        if (isFlyingUp) {
          transform  = `translateX(-50%) translateY(calc(-50% - 115vh)) rotateX(-25deg) scale(1.02)`;
          transition = `transform ${ANIM}ms cubic-bezier(0.4, 0, 1, 1)`;
        } else {
          transform  = restingTransform(effectiveSlot);
          if (effectiveSlot > 2) opacity = 0;
          transition = phase !== "idle"
            ? `transform ${ANIM}ms cubic-bezier(0.32, 1.2, 0.5, 1), opacity 0.2s ease`
            : `transform 0.35s cubic-bezier(0.32, 1, 0.5, 1), opacity 0.2s ease`;
        }

        return (
          <ProjectCard
            key={projectIdx}
            project={PROJECTS[projectIdx]}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: "min(700px, 74vw)",
              height: "calc(100vh - 190px)",
              transform,
              transition,
              opacity,
              zIndex: 10 - slot,
              willChange: "transform, opacity",
              transformStyle: "preserve-3d",
            }}
          />
        );
      })}

      {showStaging && stagingIdx !== null && (() => {
        const isStaging  = phase === "staging";
        const transform  = isStaging
          ? `translateX(-50%) translateY(calc(-50% - 115vh)) rotateX(20deg) scale(1.02)`
          : restingTransform(0);
        const transition = isStaging
          ? "none"
          : `transform ${ANIM}ms cubic-bezier(0.22, 1.4, 0.36, 1)`;
        return (
          <ProjectCard
            key={`staging-${stagingIdx}`}
            project={PROJECTS[stagingIdx]}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: "min(700px, 74vw)",
              height: "calc(100vh - 190px)",
              transform,
              transition,
              zIndex: 20,
              willChange: "transform",
              transformStyle: "preserve-3d",
            }}
          />
        );
      })()}

      <p style={{
        position: "absolute", bottom: 22, left: "50%",
        transform: "translateX(-50%)",
        fontFamily: CFONT, fontSize: 11,
        color: "rgba(255,255,255,0.50)",
        letterSpacing: "0.14em", zIndex: 30,
        whiteSpace: "nowrap",
      }}>
        ({topIdx + 1} OUT OF {N})
      </p>

      <div style={{
        position: "absolute", right: 24, top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column",
        gap: 8, zIndex: 30,
      }}>
        {PROJECTS.map((_, i) => (
          <div key={i} style={{
            width: 6, borderRadius: 3,
            height: i === topIdx ? 22 : 6,
            background: i === topIdx ? "#fff" : "rgba(255,255,255,0.3)",
            transition: "height 0.3s ease, background 0.3s ease",
          }} />
        ))}
      </div>
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
        fontFamily: FONT, fontSize: 16, fontWeight: 700, lineHeight: 1,
        color: open ? "#fff" : "#111", cursor: "default",
        display: "flex", alignItems: "center", justifyContent: "center",
        paddingBottom: 2,
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
  const [isMobile,     setIsMobile]     = useState(false);
  const [notes,        setNotes]        = useState<Note[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [showProjects, setShowProjects] = useState(false);

  const [topIdx,     setTopIdx]     = useState(0);
  const [cardPhase,  setCardPhase]  = useState<CardPhase>("idle");
  const [stagingIdx, setStagingIdx] = useState<number | null>(null);

  const colorIndexRef = useRef(0);
  const initKeyRef    = useRef<string | null>(null);

  const topZRef             = useRef(10);
  const [topZ, _setTopZ]    = useState(10);
  const setTopZ = useCallback((v: number | ((prev: number) => number)) => {
    _setTopZ(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      topZRef.current = next;
      return next;
    });
  }, []);

  const showProjectsRef = useRef(false);
  const topIdxRef       = useRef(0);
  const cardBusy        = useRef(false);
  const notesBusy       = useRef(false);
  const wheelAccum      = useRef(0);
  const lastFire        = useRef(0);
  const touchStartY     = useRef(0);

  useEffect(() => { showProjectsRef.current = showProjects; }, [showProjects]);
  useEffect(() => { topIdxRef.current = topIdx; }, [topIdx]);

  const goNext = useCallback(() => {
    cardBusy.current = true;
    wheelAccum.current = 0;
    lastFire.current = Date.now();
    setCardPhase("flyingUp");
    setTimeout(() => {
      setTopIdx(i => {
        const next = (i + 1) % N;
        topIdxRef.current = next;
        return next;
      });
      setCardPhase("idle");
      cardBusy.current = false;
    }, ANIM);
  }, []);

  const goPrev = useCallback(() => {
    const cur = topIdxRef.current;
    if (cur === 0) {
      notesBusy.current = true;
      wheelAccum.current = 0;
      setShowProjects(false);
      showProjectsRef.current = false;
      setTimeout(() => { notesBusy.current = false; }, 850);
      return;
    }
    cardBusy.current = true;
    wheelAccum.current = 0;
    lastFire.current = Date.now();
    const incoming = (cur - 1 + N) % N;
    setStagingIdx(incoming);
    setCardPhase("staging");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTopIdx(incoming);
        topIdxRef.current = incoming;
        setCardPhase("dropping");
        setTimeout(() => {
          setCardPhase("idle");
          setStagingIdx(null);
          cardBusy.current = false;
        }, ANIM);
      });
    });
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (notesBusy.current || cardBusy.current) return;
      if (!showProjectsRef.current) {
        if (e.deltaY <= 0) {
          wheelAccum.current = Math.max(0, wheelAccum.current - 20);
          return;
        }
        wheelAccum.current += e.deltaY;
        if (wheelAccum.current > 120) {
          wheelAccum.current = 0;
          notesBusy.current  = true;
          setShowProjects(true);
          showProjectsRef.current = true;
          setTimeout(() => { notesBusy.current = false; }, 850);
        }
        return;
      }
      const now = Date.now();
      if (now - lastFire.current < 120) return;
      wheelAccum.current += e.deltaY;
      if (wheelAccum.current >= 80) { wheelAccum.current = 0; goNext(); }
      else if (wheelAccum.current <= -80) { wheelAccum.current = 0; goPrev(); }
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      if (notesBusy.current || cardBusy.current) return;
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (!showProjectsRef.current) {
        if (dy > 60) {
          notesBusy.current = true;
          setShowProjects(true);
          showProjectsRef.current = true;
          setTimeout(() => { notesBusy.current = false; }, 850);
        }
        return;
      }
      if (dy >  45) goNext();
      if (dy < -45) goPrev();
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  });
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
    };
  }, [goNext, goPrev]);

  useEffect(() => {
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
      const restoredNotes = deleted.map((n, i) => ({
        ...n,
        id: `${n.id}-r${ts}-${i}`,
        zIndex: baseZ + i + 1,
      }));
      const newZ = baseZ + deleted.length;
      topZRef.current = newZ;
      _setTopZ(newZ);
      setNotes(prev => [...prev, ...restoredNotes]);
      return [];
    });
  }, []);

  const addCard = useCallback((text: string) => {
    const color          = USER_CARD_COLORS[colorIndexRef.current % USER_CARD_COLORS.length];
    colorIndexRef.current += 1;
    const sizing         = isMobile ? { width: 140, minHeight: 140 } : cardSizeFromText(text);
    const { xPct, yPct } = randomSpawnPosition(isMobile);
    const z              = topZRef.current + 1;
    topZRef.current      = z;
    _setTopZ(z);
    setNotes(prev => [...prev, {
      id: `user-${Date.now()}`,
      xPct, yPct,
      color, width: sizing.width, minHeight: sizing.minHeight,
      zIndex: z,
      isUserAdded: true,
      content: (
        <p style={{ ...bodyStyle, fontSize: 12.5, color: color === "#F7F6EF" ? "#333" : "#fff" }}>
          {text}
        </p>
      ),
    }]);
  }, [isMobile]);

  const handleRestart = useCallback(() => {
    initKeyRef.current    = null;
    const key             = isMobile ? "m" : "d";
    initKeyRef.current    = key;
    const freshNotes      = buildInitialNotes(isMobile);
    setNotes(freshNotes);
    setDeletedNotes([]);
    topZRef.current       = 10;
    _setTopZ(10);
    colorIndexRef.current = 0;
    setShowProjects(false);
    showProjectsRef.current = false;
    setTopIdx(0);
    topIdxRef.current     = 0;
    setCardPhase("idle");
    setStagingIdx(null);
    cardBusy.current      = false;
    notesBusy.current     = false;
    wheelAccum.current    = 0;
    lastFire.current      = 0;
  }, [isMobile]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #3B5FA0; }
        @media (max-width: 640px) {
          .explore-btn { top: 56px !important; right: 12px !important; }
          .hint-text   { font-size: 11px !important; bottom: 22px !important; }
          .nav-logo    { font-size: 12px !important; }
          .nav-links   { gap: 16px !important; }
          .nav-link    { font-size: 10px !important; letter-spacing: 0.08em !important; }
          .project-card { width: 88vw !important; height: 52vw !important; }
        }
      `}</style>

      <ProjectsSection topIdx={topIdx} phase={cardPhase} stagingIdx={stagingIdx} />

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