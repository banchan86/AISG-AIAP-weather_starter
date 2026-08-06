import { useMemo, useState } from 'react';
import { useStore } from '../state/store';
import { SearchIcon } from './icons';
import { SidebarCard } from './SidebarCard';
import { LocationActions } from './LocationActions';

export function Sidebar() {
  const { locations, isLoading } = useStore();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((location) => {
      const area = location.weather.area?.toLowerCase() ?? '';
      const condition = location.weather.condition?.toLowerCase() ?? '';
      return area.includes(q) || condition.includes(q);
    });
  }, [locations, query]);

  return (
    <aside
      className="flex w-[22rem] shrink-0 flex-col gap-3 border-r p-4 backdrop-blur-2xl"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
      }}
    >
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full rounded-lg border border-theme-soft bg-surface py-2 pl-9 pr-3 text-sm text-theme placeholder:text-theme-placeholder"
        />
      </div>

      <LocationActions />

      <div className="flex flex-col gap-2 overflow-y-auto pr-1">
        {isLoading && locations.length === 0 ? (
          <p className="rounded-2xl border border-theme-soft bg-surface-subtle p-4 text-sm text-theme-muted">
            Loading locations…
          </p>
        ) : filtered.length === 0 && locations.length > 0 ? (
          <p className="rounded-2xl border border-theme-soft bg-surface-subtle p-4 text-center text-sm text-theme-muted">
            No matches
          </p>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-theme bg-surface-faint p-6 text-center text-sm text-theme-muted">
            No locations yet. Add one above.
          </p>
        ) : (
          filtered.map((location) => (
            <SidebarCard
              key={location.id}
              location={location}
              isHome={location.id === locations[0].id}
            />
          ))
        )}
      </div>
    </aside>
  );
}
