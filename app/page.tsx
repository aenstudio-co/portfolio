"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

/* ── Desktop note layout ───────────────────────────────────── */
const DESKTOP_NOTES: Omit<Note, "content">[] = [
  { id: "intro",     xPct: 30, yPct: 25, color: "#43669e", width: 235, zIndex: 4 },
  { id: "quote",     xPct: 50, yPct: 20, color: "#2f812f", width: 320, zIndex: 6 },
  { id: "education", xPct: 44, yPct: 33, color: "#c06408", width: 250, zIndex: 8 },
  { id: "red",       xPct: 50, yPct: 45, color: "#b02415", width: 200, zIndex: 5 },
];

/* ── Mobile note layout ────────────────────────────────────── */
/* xPct/yPct are % of viewport, width in px (will render smaller on mobile) */
const MOBILE_NOTES: Omit<Note, "content">[] = [
  { id: "intro",     xPct: 12,  yPct: 28, color: "#43669e", width: 250, zIndex: 4 },
  { id: "quote",     xPct: 26, yPct: 17, color: "#2f812f", width: 275, zIndex: 6 },
  { id: "education", xPct: 38,  yPct: 48, color: "#c06408", width: 225, zIndex: 8 },
  { id: "red",       xPct: 20, yPct: 57, color: "#b02415", width: 200, zIndex: 5 },
];

/* ── Colors for user-added cards (cycles in order) ────────── */
const USER_CARD_COLORS = ["#FFA0BB", "#C9E6EF", "#F1DD77", "#F7F6EF"];

/* ── Card size from text length ────────────────────────────── */
function cardSizeFromText(text: string): { width: number; minHeight: number } {
  const len = text.length;
  if (len <= 30)  return { width: 160, minHeight: 160 };
  if (len <= 60)  return { width: 190, minHeight: 190 };
  if (len <= 80)  return { width: 210, minHeight: 210 };
  return           { width: 230, minHeight: 230 };
}

/* ── Random scatter near the default note cluster ──────────── */
function randomSpawnPosition(isMobile: boolean) {
  if (isMobile) {
    // Scatter within the mobile cluster zone
    const xPct = 4 + Math.random() * 44;
    const yPct = 10 + Math.random() * 55;
    return { xPct, yPct };
  }
  const xPct = 28 + Math.random() * 30;
  const yPct = 28 + Math.random() * 28;
  return { xPct, yPct };
}

/* ── Explore Button ────────────────────────────────────────── */
function ExploreButton({
  deletedCount,
  onRestoreCards,
  onAddCard,
  onRestart,
}: {
  deletedCount: number;
  onRestoreCards: () => void;
  onAddCard: (text: string) => void;
  onRestart: () => void;
}) {
  const FONT = "'Courier Prime', 'Courier New', monospace";
  const [open, setOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (addMode && textareaRef.current) textareaRef.current.focus();
  }, [addMode]);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddCard(trimmed);
    setText("");
    setAddMode(false);
    setOpen(false);
  };

  const handleRestart = () => {
    setOpen(false);
    setAddMode(false);
    onRestart();
  };

  const handleRestore = () => {
    if (deletedCount === 0) return;
    setOpen(false);
    onRestoreCards();
  };

  return (
    <div
      style={{ position: "absolute", bottom: 32, left: 32, zIndex: 300, paddingBottom: 8 }}
      className="explore-btn"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setAddMode(false); }}
    >

      {/* Popover menu */}
      <div style={{
        position: "absolute",
        bottom: 44,
        left: 0,
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        padding: "8px 0",
        minWidth: 168,
        boxShadow: "2px 3px 10px rgba(0,0,0,0.12)",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transform: open ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.16s ease, transform 0.16s ease",
      }}>

        {/* Restore Cards */}
        <button
          onClick={handleRestore}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "8px 16px",
            background: "none", border: "none", cursor: deletedCount > 0 ? "pointer" : "default",
            fontFamily: FONT, fontSize: 12, letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: deletedCount > 0 ? "#111" : "#ccc",
            textAlign: "left",
          }}
          onMouseEnter={(e) => { if (deletedCount > 0) (e.currentTarget as HTMLElement).style.background = "#f3f3f1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <span style={{ fontSize: 11, opacity: deletedCount > 0 ? 1 : 0.4 }}>↩</span>
          Restore Cards
          {deletedCount > 0 && (
            <span style={{
              marginLeft: "auto", background: "#3B72C8", color: "#fff",
              borderRadius: "50%", width: 16, height: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontFamily: FONT, flexShrink: 0,
            }}>
              {deletedCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: "#ebebea", margin: "4px 0" }} />

        {/* Add a Card */}
        {!addMode ? (
          <button
            onClick={() => setAddMode(true)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "8px 16px",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: 12, letterSpacing: "0.10em",
              textTransform: "uppercase", color: "#111", textAlign: "left",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f3f1"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <span style={{ fontSize: 13 }}>+</span>
            Add a Card
          </button>
        ) : (
          <div style={{ padding: "8px 14px 10px" }}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 100))}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } if (e.key === "Escape") { setAddMode(false); setText(""); } }}
              placeholder="Write something..."
              rows={3}
              style={{
                width: "100%", resize: "none",
                fontFamily: FONT, fontSize: 12, color: "#111",
                border: "1px solid #ddd", borderRadius: 2,
                padding: "6px 8px", outline: "none",
                lineHeight: 1.6, letterSpacing: "0.03em",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontFamily: FONT, fontSize: 10, color: "#aaa", letterSpacing: "0.06em" }}>
                {text.length}/100
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => { setAddMode(false); setText(""); }}
                  style={{ fontFamily: FONT, fontSize: 11, color: "#999", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!text.trim()}
                  style={{
                    fontFamily: FONT, fontSize: 11, background: "#3B72C8", color: "#fff",
                    border: "none", borderRadius: 2, padding: "4px 10px",
                    cursor: text.trim() ? "pointer" : "default",
                    opacity: text.trim() ? 1 : 0.4,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: "#ebebea", margin: "4px 0" }} />

        {/* Restart */}
        <button
          onClick={handleRestart}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "8px 16px",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: FONT, fontSize: 12, letterSpacing: "0.10em",
            textTransform: "uppercase", color: "#111", textAlign: "left",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f3f1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <span style={{ fontSize: 12 }}>⟳</span>
          Restart
        </button>
      </div>

      {/* "!" circle trigger */}
      <button
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: open ? "#3B72C8" : "#fff",
          border: open ? "1px solid #3B72C8" : "1px solid #e0e0e0",
          boxShadow: "2px 3px 8px rgba(0,0,0,0.12)",
          fontFamily: FONT, fontSize: 16, fontWeight: 700,
          color: open ? "#fff" : "#111",
          cursor: "default", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.18s, color 0.18s, border-color 0.18s",
          letterSpacing: 0,
        }}
        title="Explore"
      >
        !
      </button>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [topZ, setTopZ] = useState(10);
  const [epoch, setEpoch] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const colorIndexRef = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const INITIAL_NOTES = isMobile ? MOBILE_NOTES : DESKTOP_NOTES;

  const buildNotes = useCallback((): Note[] => [
    {
      ...INITIAL_NOTES[0],
      content: (
        <div>
          <p style={titleStyle}>Hi! I'm Kris :)</p>
          <p style={bodyStyle}>
            Working at the intersection of digital and physical culture,
            I explore technology as a space for creative expression.
          </p>
        </div>
      ),
    },
    {
      ...INITIAL_NOTES[1],
      content: (
        <p style={{ ...bodyStyle, whiteSpace: "pre-wrap" }}>
          {`"Carpe Diem," Keating whispered loudly. "Seize the day. Make your lives extraordinary."`}
        </p>
      ),
    },
    {
      ...INITIAL_NOTES[2],
      content: (
        <p style={{ ...bodyStyle, whiteSpace: "pre-wrap" }}>
          {`I am currently pursuing BS Information Technology at Bicol University.`}
        </p>
      ),
    },
    {
      ...INITIAL_NOTES[3],
      content: <div />,
    },
  ], [isMobile]);

  useEffect(() => {
    setNotes(buildNotes());
    setDeletedNotes([]);
    setTopZ(10);
    colorIndexRef.current = 0;
  }, [epoch, isMobile, buildNotes]);

  const bringToFront = useCallback((id: string) => {
    setTopZ((z) => {
      const next = z + 1;
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, zIndex: next } : n)));
      return next;
    });
  }, []);

  const closeNote = (id: string) => {
    setNotes((prev) => {
      const removed = prev.find((n) => n.id === id);
      if (removed) setDeletedNotes((d) => [...d, removed]);
      return prev.filter((n) => n.id !== id);
    });
  };

  const restoreCards = () => {
    // Snapshot deleted notes before clearing — avoids stale closure duplication
    const toRestore = [...deletedNotes];
    if (toRestore.length === 0) return;
    const ts = Date.now();
    setDeletedNotes([]);
    setTopZ((z) => {
      const nextZ = z + toRestore.length;
      const restored = toRestore.map((n, i) => ({
        ...n,
        id: `${n.id}-r${ts}-${i}`,
        zIndex: z + i + 1,
      }));
      setNotes((prev) => [...prev, ...restored]);
      return nextZ;
    });
  };

  const addCard = (text: string) => {
    // Cycle through colors in order
    const color = USER_CARD_COLORS[colorIndexRef.current % USER_CARD_COLORS.length];
    colorIndexRef.current += 1;

    const { width, minHeight } = isMobile
      ? { width: 140, minHeight: 140 }
      : cardSizeFromText(text);
    const { xPct, yPct } = randomSpawnPosition(isMobile);

    const newNote: Note = {
      id: `user-${Date.now()}`,
      xPct,
      yPct,
      color,
      width,
      zIndex: topZ + 1,
      isUserAdded: true,
      content: <p style={{ ...bodyStyle, fontSize: 12.5, color: color === "#F7F6EF" ? "#333" : "#fff" }}>{text}</p>,
    };
    setTopZ((z) => z + 1);
    setNotes((prev) => [...prev, { ...newNote, minHeight }]);
  };

  const restart = () => setEpoch((e) => e + 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #fff; }
        @media (max-width: 640px) {
          .explore-btn { bottom: 20px !important; left: 16px !important; }
          .hint-text { font-size: 11px !important; bottom: 22px !important; }
          .nav-logo { font-size: 12px !important; }
          .nav-links { gap: 16px !important; }
          .nav-link { font-size: 10px !important; letter-spacing: 0.08em !important; }
        }
      `}</style>

      <div style={pageStyle}>
        {/* Dot grid */}
        <div style={dotGridStyle} />

        {/* Breadboard header lines */}
        <div style={{ position: "absolute", top: 43, left: 0, right: 0, height: 2, background: "#E03030", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 47, left: 0, right: 0, height: 2, background: "#3B72C8", zIndex: 2, pointerEvents: "none" }} />

        {/* Navbar */}
        <nav style={navStyle}>
          <Link href="/" style={logoStyle} className="nav-logo">KRIS</Link>
          <div style={{ display: "flex", gap: 40 }} className="nav-links">
            {[
              { label: "WORK", href: "/" },
              { label: "PLAYGROUND", href: "/playground" },
              { label: "LIBRARY", href: "#" },
              { label: "ABOUT", href: "#" },
            ].map((item) => (
              <Link key={item.label} href={item.href} style={navLinkStyle} className="nav-link">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Notes */}
        {notes.map((note) => (
          <DraggableNote key={`${epoch}-${note.id}`} note={note} onBringToFront={bringToFront} onClose={closeNote} />
        ))}

        {/* Explore Button — bottom left */}
        <ExploreButton
          deletedCount={deletedNotes.length}
          onRestoreCards={restoreCards}
          onAddCard={addCard}
          onRestart={restart}
        />

        <p style={hintStyle} className="hint-text">(drag and clear notes)</p>
      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */
const FONT = "'Courier Prime', 'Courier New', monospace";

const pageStyle: React.CSSProperties = {
  position: "relative",
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  background: "#ffffff",
};

const dotGridStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage: "radial-gradient(circle, #A8C8E8 1px, transparent 1.3px)",
  backgroundSize: "18px 18px",
  backgroundPosition: "13px 13px",
  zIndex: 0,
  pointerEvents: "none",
};

const navStyle: React.CSSProperties = {
  position: "absolute",
  top: 0, left: 0, right: 0,
  height: 43,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 20px",
  zIndex: 100,
  background: "#ffffff",
};

const logoStyle: React.CSSProperties = {
  fontFamily: FONT, fontWeight: 400, fontSize: 14,
  letterSpacing: "0.10em", color: "#707070", textDecoration: "none",
};

const navLinkStyle: React.CSSProperties = {
  fontFamily: FONT, fontWeight: 400, fontSize: 13,
  letterSpacing: "0.14em", color: "#111",
  textDecoration: "none", textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  color: "#fff", fontFamily: FONT, fontWeight: 400,
  fontSize: 14, marginBottom: 14, letterSpacing: "0.02em",
};

const bodyStyle: React.CSSProperties = {
  color: "#fff", fontFamily: FONT, fontWeight: 400,
  fontSize: 13.5, lineHeight: 1.8, letterSpacing: "0.01em",
};

const hintStyle: React.CSSProperties = {
  position: "absolute", bottom: 34, left: "50%",
  transform: "translateX(-50%)",
  fontFamily: FONT, fontSize: 13, color: "#999",
  letterSpacing: "0.05em", zIndex: 2,
  whiteSpace: "nowrap", pointerEvents: "none",
};

/* ── Draggable Note ─────────────────────────────────────────── */
function DraggableNote({
  note,
  onBringToFront,
  onClose,
}: {
  note: Note;
  onBringToFront: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    // Sync pos.current from rendered CSS position so dragging starts correctly
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const parentRect = ref.current.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 };
      pos.current = {
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top,
      };
    }
  }, [note.xPct, note.yPct]);

  const startDrag = (clientX: number, clientY: number) => {
    dragging.current = true;
    offset.current = { x: clientX - pos.current.x, y: clientY - pos.current.y };
    onBringToFront(note.id);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    startDrag(e.clientX, e.clientY);
    e.preventDefault();
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      pos.current = { x: ev.clientX - offset.current.x, y: ev.clientY - offset.current.y };
      if (ref.current) { ref.current.style.left = pos.current.x + "px"; ref.current.style.top = pos.current.y + "px"; }
    };
    const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
    const onMove = (ev: TouchEvent) => {
      const tt = ev.touches[0];
      pos.current = { x: tt.clientX - offset.current.x, y: tt.clientY - offset.current.y };
      if (ref.current) { ref.current.style.left = pos.current.x + "px"; ref.current.style.top = pos.current.y + "px"; }
    };
    const onEnd = () => { dragging.current = false; window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className="note-card"
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
      >
        ✕
      </button>
      {note.content}
    </div>
  );
}