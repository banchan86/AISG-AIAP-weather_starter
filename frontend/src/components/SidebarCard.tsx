import { useStore } from '../state/store';
import { CloudIcon, HomeIcon } from './icons';
import { formatTemperature, formatTime } from './format';
import React, { type KeyboardEvent } from 'react';
import type { Location } from '../types';

interface SidebarCardProps {
  location: Location;
  isHome: boolean;
}

export function SidebarCard({ location, isHome }: SidebarCardProps) {
  const { selectedId, select, remove } = useStore();
  const isSelected = selectedId === location.id;
  const observed = formatTime(location.weather.observed_at);
  const area =
    location.weather.area || `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`;
  const condition = location.weather.condition || '-';
  const temperature = formatTemperature(location.weather.temperature_c);
  const high = formatTemperature(location.weather.forecast_high_c);
  const low = formatTemperature(location.weather.forecast_low_c);

  const onSelect = () => select(location.id);
  const onDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    void remove(location.id);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      aria-pressed={isSelected}
      className="relative w-full cursor-pointer overflow-hidden rounded-2xl border text-left backdrop-blur-xl transition"
      style={{
        borderColor: isSelected ? 'var(--border-active)' : 'var(--border-soft)',
        backgroundColor: isSelected ? 'var(--surface-active)' : 'var(--surface)',
        boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.2)' : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface)';
      }}
    >
      <button
        onClick={onDelete}
        aria-label="Remove location"
        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-theme-muted transition hover:bg-surface-hover hover:text-theme"
      >
        ×
      </button>
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold leading-tight text-theme">{area}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-theme-muted">
            {isHome ? (
              <>
                <span>My Location</span>
                <span className="text-theme-faint">·</span>
                <HomeIcon className="h-3 w-3" />
                <span>Home</span>
              </>
            ) : observed ? (
              <span>{observed}</span>
            ) : (
              <span className="text-theme-faint">Not refreshed</span>
            )}
          </div>
        </div>
        <div className="text-3xl font-light tabular-nums text-theme-secondary">{temperature}</div>
      </div>
      <div
        className="mt-3 flex items-center justify-between px-4 py-2 text-xs"
        style={{ borderTop: '1px solid var(--border-soft)' }}
      >
        <div className="flex items-center gap-2 text-theme-secondary">
          <CloudIcon className="h-4 w-4 text-theme-muted" />
          <span>{condition}</span>
        </div>
        <div className="tabular-nums text-theme-muted">
          H:{high} L:{low}
        </div>
      </div>
    </div>
  );
}
