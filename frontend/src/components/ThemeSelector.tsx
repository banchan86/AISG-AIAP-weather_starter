import { useRef, useState, useEffect } from 'react';
import { THEMES, useTheme } from '../state/theme';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = THEMES.find((t) => t.id === theme)!;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)',
        }}
        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-xl transition hover:opacity-80"
      >
        <PaletteIcon />
        <span>{current.name}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          style={{
            background: 'var(--surface-active)',
            borderColor: 'var(--border)',
            backdropFilter: 'blur(24px)',
          }}
          className="absolute right-0 z-50 mt-1.5 w-40 overflow-hidden rounded-xl border shadow-lg shadow-black/30"
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTheme(t.id); setOpen(false); }}
              style={{
                color: t.id === theme ? 'var(--text)' : 'var(--text-muted)',
                background: t.id === theme ? 'var(--surface-active)' : 'transparent',
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:opacity-80"
            >
              <ThemeSwatch id={t.id} />
              {t.name}
              {t.id === theme && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PaletteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const SWATCH_COLORS: Record<string, string> = {
  'apple': 'linear-gradient(135deg, #6f8aa8, #3c5066)',
  'arctic-glass': 'linear-gradient(135deg, #ddeeff, #98c0e8)',
  'botanical': 'linear-gradient(135deg, #2d4a2d, #152615)',
  'midnight-navy': 'linear-gradient(135deg, #1a2340, #090e1e)',
  'neon-storm': 'linear-gradient(135deg, #0a0a1a, #00ffff88)',
  'desert-sand': 'linear-gradient(135deg, #c8a97a, #6b4e2a)',
  'nordic-frost': 'linear-gradient(135deg, #e8eef4, #a0bcd0)',
  'paper-map': 'linear-gradient(135deg, #e8d8b0, #b8986a)',
  'solar-flare': 'linear-gradient(135deg, #e8600a, #860e08)',
};

function ThemeSwatch({ id }: { id: string }) {
  return (
    <span
      className="inline-block h-3.5 w-3.5 flex-shrink-0 rounded-full border border-white/20"
      style={{ background: SWATCH_COLORS[id] ?? '#888' }}
    />
  );
}
