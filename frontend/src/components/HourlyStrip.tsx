import { CloudIcon, SunIcon } from './icons';
import type { ForecastPeriod } from '../types';

interface HourlyStripProps {
  periods?: ForecastPeriod[];
}

function shortenLabel(label: string): string {
  if (!label) return '';
  const start = label.split(' to ')[0];
  return start.replace(/\s\d{4}\b/, '');
}

export function HourlyStrip({ periods = [] }: HourlyStripProps) {
  if (periods.length === 0) {
    return (
      <section className="rounded-2xl border border-theme bg-surface backdrop-blur-xl">
        <p className="border-b border-theme-soft px-4 py-2 text-[12px] text-theme-secondary">
          Forecast unavailable from this data source.
        </p>
        <div className="flex min-h-[5rem] items-center justify-center text-sm text-theme-faint">
          --
        </div>
      </section>
    );
  }

  const slots = periods.map((period, index) => ({
    key: `${period.label}-${index}`,
    label: index === 0 ? 'Now' : shortenLabel(period.label),
    forecast: period.forecast,
  }));

  return (
    <section className="rounded-2xl border border-theme bg-surface backdrop-blur-xl">
      <p className="border-b border-theme-soft px-4 py-2 text-[12px] text-theme-secondary">
        24-hour regional forecast.
      </p>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))`,
        }}
      >
        {slots.map((slot, i) => {
          const isFair = slot.forecast?.toLowerCase().includes('fair');
          return (
            <div
              key={slot.key}
              className="flex flex-col items-center gap-2 px-2 py-4 text-center"
              style={
                i > 0
                  ? { borderLeft: '1px solid var(--border-soft)' }
                  : undefined
              }
            >
              <div className="text-xs font-medium text-theme-secondary">
                {slot.label}
              </div>
              {isFair ? (
                <SunIcon className="h-7 w-7 text-amber-300" />
              ) : (
                <CloudIcon className="h-7 w-7 text-theme-secondary" />
              )}
              <div className="text-xs leading-snug text-theme-secondary">
                {slot.forecast}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
