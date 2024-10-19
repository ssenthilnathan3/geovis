import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export const validateEmail = (email: string): boolean => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
  };
  
  export const validatePassword = (password: string): boolean => {
    return password.length >= 5;
  };
  
export const handleAuthAction = async (
  action: 'login' | 'register',
  credentials: { email: string; password: string; name?: string },
  onSuccess: () => void,
  onError: (error: string) => void
) => {
  try {
    console.log(`Attempting to ${action} with:`, credentials);
    const result = await signIn('credentials', {
      redirect: false,
      ...credentials,
      action,
    });

    console.log('SignIn result:', result);

    if (result?.error) {
      console.error(`${action} error:`, result.error);
      onError(result.error === 'CredentialsSignin' ? 'Invalid credentials' : result.error);
    } else if (result?.ok) {
      console.log('Authentication successful');
      onSuccess();
    } else {
      onError('An unexpected error occurred');
    }
  } catch (error) {
    console.error(`${action} error:`, error);
    onError(`An error occurred while ${action === 'login' ? 'logging in' : 'creating the user'}`);
  }
};
