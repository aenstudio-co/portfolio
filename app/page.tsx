"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link"; // Added for navigation

interface Note {
  id: string;
  xPct: number;
  yPct: number;
  color: string;
  width: number;
  zIndex: number;
  content: React.ReactNode;
}

const INITIAL: Omit<Note, "content">[] = [
  { id: "intro",     xPct: 30,  yPct: 30,  color: "#43669e", width: 235, zIndex: 4 },
  { id: "quote",     xPct: 50,  yPct: 30,  color: "#2f812f", width: 320, zIndex: 6 },
  { id: "education", xPct: 44,  yPct: 42,  color: "#c06408", width: 250, zIndex: 8 },
  { id: "red",       xPct: 50,  yPct: 53,  color: "#b02415", width: 200, zIndex: 5 },
];

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [topZ, setTopZ] = useState(10);

  useEffect(() => {
    setNotes([
      {
        ...INITIAL[0],
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
        ...INITIAL[1],
        content: (
          <p style={{ ...bodyStyle, whiteSpace: "pre-wrap" }}>
            {`“Carpe Diem,” Keating whispered loudly. “Seize the day. Make your lives extraordinary.”`}
          </p>
        ),
      },
      {
        ...INITIAL[2],
        content: (
          <p style={{ ...bodyStyle, whiteSpace: "pre-wrap" }}>
            {`I am currently pursuing BS Information Technology at Bicol University.`}
          </p>
        ),
      },
      {
        ...INITIAL[3],
        content: <div />,
      },
    ]);
  }, []);

  const bringToFront = useCallback((id: string) => {
    setTopZ((z) => {
      const next = z + 1;
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, zIndex: next } : n)));
      return next;
    });
  }, []);

  const closeNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #fff; }
      `}</style>

      <div style={pageStyle}>
        {/* Dot grid */}
        <div style={dotGridStyle} />

        {/* Breadboard header lines */}
        <div style={{ position: "absolute", top: 43, left: 0, right: 0, height: 2, background: "#E03030", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 47, left: 0, right: 0, height: 2, background: "#3B72C8", zIndex: 2, pointerEvents: "none" }} />

        {/* Navbar */}
        <nav style={navStyle}>
          <Link href="/" style={logoStyle}>KRIS</Link>
          <div style={{ display: "flex", gap: 40 }}>
            {/* Updated navigation array to include Playground */}
            {[
              { label: "WORK", href: "/" },
              { label: "PLAYGROUND", href: "/playground" },
              { label: "LIBRARY", href: "#" },
              { label: "ABOUT", href: "#" }
            ].map((item) => (
              <Link key={item.label} href={item.href} style={navLinkStyle}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Notes */}
        {notes.map((note) => (
          <DraggableNote key={note.id} note={note} onBringToFront={bringToFront} onClose={closeNote} />
        ))}

        <p style={hintStyle}>(drag and clear notes)</p>
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
  padding: "0 36px",
  zIndex: 100,
  background: "#ffffff",
};

const logoStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: 14,
  letterSpacing: "0.10em",
  color: "#707070",
  textDecoration: "none",
};

const navLinkStyle: React.CSSProperties = {
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: 13,
  letterSpacing: "0.14em",
  color: "#111",
  textDecoration: "none",
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  color: "#fff",
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: 14,
  marginBottom: 14,
  letterSpacing: "0.02em",
};

const bodyStyle: React.CSSProperties = {
  color: "#fff",
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: 13.5,
  lineHeight: 1.8,
  letterSpacing: "0.01em",
};

const hintStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 34,
  left: "50%",
  transform: "translateX(-50%)",
  fontFamily: FONT,
  fontSize: 13,
  color: "#999",
  letterSpacing: "0.05em",
  zIndex: 2,
  whiteSpace: "nowrap",
  pointerEvents: "none",
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const x = (note.xPct / 100) * window.innerWidth;
    const y = (note.yPct / 100) * window.innerHeight;
    pos.current = { x, y };
    if (ref.current) {
      ref.current.style.left = x + "px";
      ref.current.style.top = y + "px";
    }
    setReady(true);
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
      style={{
        position: "absolute",
        left: 0, top: 0,
        width: note.width,
        minHeight: note.id === "red" ? 200 : undefined,
        backgroundColor: note.color,
        borderRadius: 2,
        padding: "22px 20px 28px",
        cursor: "grab",
        userSelect: "none",
        boxShadow: "3px 5px 16px rgba(0,0,0,0.22)",
        zIndex: note.zIndex,
        visibility: ready ? "visible" : "hidden",
      }}
    >
      <button
        onClick={() => onClose(note.id)}
        style={{
          position: "absolute", top: 10, right: 12,
          background: "none", border: "none",
          color: "#fff", fontSize: 16, lineHeight: 1,
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