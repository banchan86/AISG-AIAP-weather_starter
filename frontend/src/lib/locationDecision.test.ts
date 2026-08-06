import { describe, expect, it } from 'vitest';
import {
  decideLocationAction,
  DEDUP_RADIUS_DEGREES,
  type SavedCoordinate,
} from './locationDecision';

const saved = (entries: Array<[number, number, number]>): SavedCoordinate[] =>
  entries.map(([id, latitude, longitude]) => ({ id, latitude, longitude }));

describe('decideLocationAction', () => {
  describe('create', () => {
    it('returns create with raw, unrounded coordinates', () => {
      const decision = decideLocationAction(
        { kind: 'position', latitude: 1.3508234567, longitude: 103.8390123456 },
        [],
      );
      expect(decision).toEqual({
        kind: 'create',
        latitude: 1.3508234567,
        longitude: 103.8390123456,
      });
    });

    it('creates when saved locations exist but none are nearby', () => {
      const decision = decideLocationAction(
        { kind: 'position', latitude: 1.29, longitude: 103.85 },
        saved([[1, 1.44, 103.79]]),
      );
      expect(decision.kind).toBe('create');
    });
  });

  describe('geofence', () => {
    it('accepts coordinates exactly on each boundary', () => {
      const onBoundary: Array<[number, number]> = [
        [1.1, 103.85],
        [1.5, 103.85],
        [1.35, 103.6],
        [1.35, 104.1],
      ];
      for (const [latitude, longitude] of onBoundary) {
        expect(
          decideLocationAction({ kind: 'position', latitude, longitude }, [])
            .kind,
        ).toBe('create');
      }
    });

    it('rejects coordinates just beyond each boundary', () => {
      const beyondBoundary: Array<[number, number]> = [
        [1.0999, 103.85],
        [1.5001, 103.85],
        [1.35, 103.5999],
        [1.35, 104.1001],
      ];
      for (const [latitude, longitude] of beyondBoundary) {
        expect(
          decideLocationAction({ kind: 'position', latitude, longitude }, []),
        ).toEqual({ kind: 'out-of-bounds' });
      }
    });

    it('rejects a far-away position (London)', () => {
      expect(
        decideLocationAction(
          { kind: 'position', latitude: 51.5074, longitude: -0.1278 },
          saved([[1, 1.35, 103.85]]),
        ),
      ).toEqual({ kind: 'out-of-bounds' });
    });
  });

  describe('proximity dedup', () => {
    it('selects an existing location just inside the radius', () => {
      const decision = decideLocationAction(
        { kind: 'position', latitude: 1.35 + 0.009, longitude: 103.85 },
        saved([[7, 1.35, 103.85]]),
      );
      expect(decision).toEqual({ kind: 'select-existing', id: 7 });
    });

    it('creates when the fix is just outside the radius', () => {
      const decision = decideLocationAction(
        { kind: 'position', latitude: 1.35 + 0.0091, longitude: 103.85 },
        saved([[7, 1.35, 103.85]]),
      );
      expect(decision.kind).toBe('create');
    });

    it('picks the nearest when multiple locations qualify', () => {
      const decision = decideLocationAction(
        { kind: 'position', latitude: 1.35, longitude: 103.85 },
        saved([
          [1, 1.353, 103.85],
          [2, 1.351, 103.85],
          [3, 1.35, 103.854],
        ]),
      );
      expect(decision).toEqual({ kind: 'select-existing', id: 2 });
    });

    it('accounts for both axes when measuring distance', () => {
      const offset = DEDUP_RADIUS_DEGREES * 0.9;
      const decision = decideLocationAction(
        {
          kind: 'position',
          latitude: 1.35 + offset,
          longitude: 103.85 + offset,
        },
        saved([[1, 1.35, 103.85]]),
      );
      expect(decision.kind).toBe('create');
    });
  });

  describe('geolocation failures', () => {
    it('maps PERMISSION_DENIED (1) to permission-denied', () => {
      expect(decideLocationAction({ kind: 'error', code: 1 }, [])).toEqual({
        kind: 'failure',
        reason: 'permission-denied',
      });
    });

    it('maps POSITION_UNAVAILABLE (2) to position-unavailable', () => {
      expect(decideLocationAction({ kind: 'error', code: 2 }, [])).toEqual({
        kind: 'failure',
        reason: 'position-unavailable',
      });
    });

    it('maps TIMEOUT (3) to position-unavailable', () => {
      expect(decideLocationAction({ kind: 'error', code: 3 }, [])).toEqual({
        kind: 'failure',
        reason: 'position-unavailable',
      });
    });
  });
});
