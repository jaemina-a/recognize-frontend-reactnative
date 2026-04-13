// TODO: 인증/투표 API 구현

export const recognitionApi = {
  getFeed: async (roomId: string) => {
    // TODO: GET /rooms/:roomId/recognitions
  },
  upload: async (roomId: string, photoUri: string) => {
    // TODO: POST /rooms/:roomId/recognitions (multipart)
  },
  vote: async (recognitionId: string, value: 'recognize' | 'reject') => {
    // TODO: POST /recognitions/:id/vote
  },
};
