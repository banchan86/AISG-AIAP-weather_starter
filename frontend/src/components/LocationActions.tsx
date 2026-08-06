import { useState } from 'react';
import { useStore } from '../state/store';
import { decideLocationAction } from '../lib/locationDecision';
import type { PositionInput } from '../lib/locationDecision';
import { AddLocationForm } from './AddLocationForm';
import { LocationIcon } from './icons';

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
};

const geolocationSupported =
  typeof navigator !== 'undefined' &&
  'geolocation' in navigator &&
  window.isSecureContext;

type Status = 'idle' | 'locating' | 'adding';

const LABELS: Record<Status, string> = {
  idle: 'Use my location',
  locating: 'Locating…',
  adding: 'Adding…',
};

export function LocationActions() {
  const { locations, isAdding, create, select } = useStore();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const settle = async (input: PositionInput) => {
    const decision = decideLocationAction(input, locations);
    switch (decision.kind) {
      case 'create':
        setStatus('adding');
        try {
          await create({
            latitude: decision.latitude,
            longitude: decision.longitude,
          });
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Could not add location',
          );
        } finally {
          setStatus('idle');
        }
        break;
      case 'select-existing':
        select(decision.id);
        setStatus('idle');
        break;
      case 'out-of-bounds':
        setError(
          "You don't appear to be in Singapore — this tracker only covers Singapore locations.",
        );
        setStatus('idle');
        break;
      case 'failure':
        setError(
          decision.reason === 'permission-denied'
            ? 'Location access is blocked — enable it for this site in your browser settings.'
            : "Couldn't get your position — try again or enter coordinates manually.",
        );
        setStatus('idle');
        break;
    }
  };

  const locate = () => {
    setError(null);
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) =>
        void settle({
          kind: 'position',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (positionError) =>
        void settle({ kind: 'error', code: positionError.code }),
      GEO_OPTIONS,
    );
  };

  return (
    <div className="grid gap-2">
      <div className={isAdding ? 'grid gap-2' : 'flex gap-2'}>
        <AddLocationForm />
        <button
          type="button"
          onClick={locate}
          disabled={!geolocationSupported || status !== 'idle'}
          title={
            geolocationSupported
              ? undefined
              : 'Geolocation is unavailable in this browser or requires a secure (HTTPS) connection'
          }
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-theme bg-surface px-3 py-2.5 text-sm font-medium text-theme-secondary backdrop-blur-xl hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LocationIcon className="h-4 w-4" />
          <span>{LABELS[status]}</span>
        </button>
      </div>
      {error && (
        <p className="rounded-md border border-red-300/30 bg-red-500/15 px-2.5 py-1.5 text-xs text-red-100">
          {error}
        </p>
      )}
    </div>
  );
}
