import { useState } from 'react';

export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (roomId: string, photoUri: string) => {
    setIsUploading(true);
    // TODO: recognitionApi.upload(roomId, photoUri)
    console.log('업로드:', roomId, photoUri);
    setIsUploading(false);
  };

  return { upload, isUploading };
}
