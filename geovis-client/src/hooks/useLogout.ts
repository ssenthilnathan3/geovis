import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear local storage
      localStorage.clear();

      // Clear session storage
      sessionStorage.clear();

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return logout;
};
