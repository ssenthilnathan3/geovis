"use client";

import { useLogout } from '@/hooks/useLogout';
import { useEffect } from 'react';

export default function LogoutPage() {
  const logout = useLogout();

  useEffect(() => {
    logout();
  }, []);

  return <div>Logging out...</div>;
}
