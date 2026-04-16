import { useState } from 'react';
import { recognitionApi } from '../api/recognitionApi';

export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (roomId: string, photoUri: string) => {
    try {
      setIsUploading(true);
      const result = await recognitionApi.uploadPhoto(roomId, photoUri);
      return result;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}
