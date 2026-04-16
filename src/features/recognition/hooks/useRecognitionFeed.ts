import { useCallback, useEffect, useState } from 'react';
import { recognitionApi } from '../api/recognitionApi';
import type { Recognition } from '../types/recognition.types';

export function useRecognitionFeed(roomId: string) {
  const [feed, setFeed] = useState<Recognition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await recognitionApi.getFeed(roomId);
      setFeed(data);
    } catch (error) {
      console.error('피드 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { feed, isLoading, refetch };
}
