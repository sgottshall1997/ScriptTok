import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setLocation('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        setLocation('/');
      }
    });
  }, [setLocation]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">Processing authentication...</div>
    </div>
  );
}
