import { useCallback, useEffect, useState } from 'react';
import { recognitionApi } from '../api/recognitionApi';
import type { CalendarDay } from '../types/recognition.types';

export function useCalendar(roomId: string) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await recognitionApi.getCalendar(roomId, year, month);
      console.log('[Calendar] raw data:', JSON.stringify(data));
      setDays(data);
    } catch (error) {
      console.error('캘린더 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, year, month]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return { year, month, days, isLoading, goToPrevMonth, goToNextMonth, refetch };
}
