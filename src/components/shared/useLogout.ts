'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  return () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.replace('/login');
  };
}
