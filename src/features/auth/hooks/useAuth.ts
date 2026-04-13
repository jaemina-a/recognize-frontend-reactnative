import { useAuthStore } from '@/src/stores/authStore';

export function useAuth() {
  const { user, isLoggedIn, setAuth, logout } = useAuthStore();

  return { user, isLoggedIn, setAuth, logout };
}
