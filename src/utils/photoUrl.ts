import { CONFIG } from '@/src/constants/config';

/**
 * 백엔드가 반환한 photoUrl을 실제 fetch 가능한 URI로 변환.
 * - http(s):// 로 시작하면 (S3 / CDN) 그대로 사용
 * - 그 외 (예: "uploads/xxx.jpg") 는 API_URL과 결합 (로컬 dev 호환)
 */
export function resolvePhotoUri(photoUrl: string): string {
  if (!photoUrl) return photoUrl;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  const base = CONFIG.API_URL.replace(/\/+$/, '');
  const path = photoUrl.replace(/^\/+/, '');
  return `${base}/${path}`;
}
