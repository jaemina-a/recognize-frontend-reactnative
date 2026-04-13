import { useState } from 'react';

export function useVote() {
  const [isVoting, setIsVoting] = useState(false);

  const vote = async (recognitionId: string, value: 'recognize' | 'reject') => {
    setIsVoting(true);
    // TODO: recognitionApi.vote(recognitionId, value)
    console.log('투표:', recognitionId, value);
    setIsVoting(false);
  };

  return { vote, isVoting };
}
