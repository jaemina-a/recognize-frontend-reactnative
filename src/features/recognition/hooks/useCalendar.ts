import { useCallback, useEffect, useRef, useState } from 'react';
import { recognitionApi } from '../api/recognitionApi';
import type { CalendarDay } from '../types/recognition.types';

const PREFETCH_RANGE = 6; // ±6 months

function key(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function offsetMonth(year: number, month: number, delta: number) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function useCalendar(roomId: string) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [daysByMonth, setDaysByMonth] = useState<Map<string, CalendarDay[]>>(new Map());
  const cacheRef = useRef<Map<string, CalendarDay[]>>(new Map());
  const inflightRef = useRef<Map<string, Promise<CalendarDay[]>>>(new Map());

  const fetchMonth = useCallback(
    async (y: number, m: number): Promise<CalendarDay[]> => {
      const k = key(y, m);
      const cached = cacheRef.current.get(k);
      if (cached) return cached;

      const inflight = inflightRef.current.get(k);
      if (inflight) return inflight;

      const promise = recognitionApi
        .getCalendar(roomId, y, m)
        .then((data) => {
          cacheRef.current.set(k, data);
          inflightRef.current.delete(k);
          return data;
        })
        .catch((err) => {
          inflightRef.current.delete(k);
          console.error('캘린더 조회 실패:', err);
          return [] as CalendarDay[];
        });

      inflightRef.current.set(k, promise);
      return promise;
    },
    [roomId],
  );

  // Initial prefetch: ±PREFETCH_RANGE months around current month
  useEffect(() => {
    let cancelled = false;
    const tasks: Promise<CalendarDay[]>[] = [];
    for (let delta = -PREFETCH_RANGE; delta <= PREFETCH_RANGE; delta++) {
      const { year: y, month: m } = offsetMonth(year, month, delta);
      tasks.push(fetchMonth(y, m));
    }
    Promise.all(tasks).then(() => {
      if (cancelled) return;
      setDaysByMonth(new Map(cacheRef.current));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // On month change: ensure surrounding months are loaded (cache hit = instant)
  useEffect(() => {
    let cancelled = false;
    const targets: { y: number; m: number }[] = [];
    for (let delta = -1; delta <= 1; delta++) {
      const { year: y, month: m } = offsetMonth(year, month, delta);
      if (!cacheRef.current.has(key(y, m))) targets.push({ y, m });
    }
    if (targets.length === 0) return;

    Promise.all(targets.map(({ y, m }) => fetchMonth(y, m))).then(() => {
      if (cancelled) return;
      setDaysByMonth(new Map(cacheRef.current));
    });
    return () => {
      cancelled = true;
    };
  }, [year, month, fetchMonth]);

  const goToPrevMonth = useCallback(() => {
    const { year: y, month: m } = offsetMonth(year, month, -1);
    setYear(y);
    setMonth(m);
  }, [year, month]);

  const goToNextMonth = useCallback(() => {
    const { year: y, month: m } = offsetMonth(year, month, 1);
    setYear(y);
    setMonth(m);
  }, [year, month]);

  const goToMonth = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  return { year, month, daysByMonth, goToPrevMonth, goToNextMonth, goToMonth };
}
