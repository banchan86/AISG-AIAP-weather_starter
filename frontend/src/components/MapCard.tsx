import { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { DivIcon } from 'leaflet';
import { useStore } from '../state/store';
import type { Location } from '../types';

const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const DEFAULT_ZOOM = 12;

function buildPinIcon(label: string, isSelected: boolean): DivIcon {
  const dot = isSelected
    ? `<div style="
        width:14px;height:14px;border-radius:50%;
        background:rgba(255,255,255,0.95);border:2px solid white;
        box-shadow:0 0 0 3px rgba(255,255,255,0.35),0 2px 6px rgba(0,0,0,0.5);
        flex-shrink:0;
      "></div>`
    : `<div style="
        width:10px;height:10px;border-radius:50%;
        background:rgba(255,255,255,0.55);border:1.5px solid rgba(255,255,255,0.8);
        box-shadow:0 1px 4px rgba(0,0,0,0.4);flex-shrink:0;
      "></div>`;

  const labelStyle = isSelected
    ? `font-size:11px;font-weight:600;color:rgba(255,255,255,0.95);
       background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);
       padding:2px 6px;border-radius:6px;border:1px solid rgba(255,255,255,0.2);
       white-space:nowrap;margin-bottom:4px;font-family:inherit;`
    : `font-size:10px;font-weight:500;color:rgba(255,255,255,0.75);
       background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);
       padding:1px 5px;border-radius:5px;border:1px solid rgba(255,255,255,0.12);
       white-space:nowrap;margin-bottom:3px;font-family:inherit;`;

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
      <div style="${labelStyle}">${label}</div>
      ${dot}
    </div>
  `;

  const width = isSelected ? 120 : 100;
  const height = isSelected ? 38 : 32;

  return divIcon({
    html,
    className: '',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  });
}

function pinLabel(loc: Location): string {
  const area =
    loc.weather?.area ??
    `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`;
  const temp =
    loc.weather?.temperature_c != null
      ? ` ${Math.round(loc.weather.temperature_c)}°`
      : '';
  return `${area}${temp}`;
}

interface MapFlyToProps {
  lat: number;
  lng: number;
  zoom: number;
}

function MapFlyTo({ lat, lng, zoom }: MapFlyToProps) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      map.setView([lat, lng], zoom, { animate: false });
      isFirstRender.current = false;
    } else {
      map.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  }, [lat, lng, zoom, map]);

  return null;
}

interface MapPinsProps {
  locations: Location[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function MapPins({ locations, selectedId, onSelect }: MapPinsProps) {
  return (
    <>
      {locations.map((loc) => {
        const isSelected = loc.id === selectedId;
        const icon = buildPinIcon(pinLabel(loc), isSelected);
        return (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={icon}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(loc.id) }}
          />
        );
      })}
    </>
  );
}

function MapIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function ExpandIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

interface FullscreenMapModalProps {
  locations: Location[];
  selectedId: number | null;
  selected: Location;
  onSelect: (id: number) => void;
  onClose: () => void;
}

function FullscreenMapModal({
  locations,
  selectedId,
  selected,
  onSelect,
  onClose,
}: FullscreenMapModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(20,30,46,0.92)', backdropFilter: 'blur(2px)' }}
    >
      <div
        className="flex shrink-0 items-center justify-between px-5 py-3 backdrop-blur-xl"
        style={{
          borderBottom: '1px solid var(--border-soft)',
          backgroundColor: 'var(--sidebar-bg)',
        }}
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-theme-muted">
          <MapIcon className="h-3.5 w-3.5" />
          <span>Map</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close fullscreen map"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-theme bg-surface text-theme-muted transition hover:bg-surface-hover hover:text-theme"
        >
          ×
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <MapContainer
          center={[selected.latitude, selected.longitude]}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          zoomControl
          attributionControl
        >
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <MapFlyTo
            lat={selected.latitude}
            lng={selected.longitude}
            zoom={DEFAULT_ZOOM}
          />
          <MapPins
            locations={locations}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        </MapContainer>
      </div>
    </div>
  );
}

export function MapCard() {
  const { locations, selectedId, select } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selected =
    locations.find((l) => l.id === selectedId) ?? locations[0] ?? null;

  const handleSelect = useCallback(
    (id: number) => {
      select(id);
    },
    [select],
  );

  if (!selected) {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border border-theme bg-surface p-4 backdrop-blur-xl">
        <header className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-theme-muted">
          <MapIcon className="h-3.5 w-3.5" />
          <span>Map</span>
        </header>
        <div
          className="flex h-[220px] items-center justify-center rounded-xl text-sm text-theme-faint"
          style={{ backgroundColor: 'var(--surface-faint)' }}
        >
          No locations to display
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-3 rounded-2xl border border-theme bg-surface p-4 backdrop-blur-xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-theme-muted">
            <MapIcon className="h-3.5 w-3.5" />
            <span>Map</span>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="Expand map"
            className="rounded-md p-1 text-theme-faint transition hover:bg-surface-hover hover:text-theme-secondary"
          >
            <ExpandIcon className="h-3.5 w-3.5" />
          </button>
        </header>
        <div className="overflow-hidden rounded-xl">
          <MapContainer
            center={[selected.latitude, selected.longitude]}
            zoom={DEFAULT_ZOOM}
            className="h-[220px] w-full"
            scrollWheelZoom={false}
            zoomControl={false}
            attributionControl
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            <MapFlyTo
              lat={selected.latitude}
              lng={selected.longitude}
              zoom={DEFAULT_ZOOM}
            />
            <MapPins
              locations={locations}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </MapContainer>
        </div>
      </section>

      {isFullscreen &&
        ReactDOM.createPortal(
          <FullscreenMapModal
            locations={locations}
            selectedId={selectedId}
            selected={selected}
            onSelect={handleSelect}
            onClose={() => setIsFullscreen(false)}
          />,
          document.body,
        )}
    </>
  );
}
