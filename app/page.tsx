'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import App from './app';
import { PhoneLogin } from './components/auth/PhoneLogin';
import { useUser } from './contexts/UserContext';

export default function Home() {
  const { isAuthenticated, login, isLoading: userLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [forceShowLogin, setForceShowLogin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    const timeout = setTimeout(() => {
      if (userLoading) {
        setForceShowLogin(true);
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [userLoading]);

  // STRICT PROTECTION: Regular users cannot access /admin at all
  // Admin routes are completely separate on port 4001
  useEffect(() => {
    if (mounted && pathname && pathname.startsWith('/admin')) {
      // Redirect regular users immediately - admin is on separate port
      router.replace('/');
    }
  }, [mounted, pathname, router]);

        const handleLoginSuccess = async (phoneNumber: string) => {
          try {
            await login(phoneNumber);
          } catch (error) {
            // Error handled silently
          }
        };

  // Show simple loading on initial mount
  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #eab308', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ALWAYS show login first - force login page to appear
  // Only show app if user explicitly logged in through PhoneLogin
  if (!isAuthenticated) {
    // Show login immediately if loading is done or timeout occurred
    if (!userLoading || forceShowLogin) {
      return <PhoneLogin onLoginSuccess={handleLoginSuccess} />;
    }
    // Show brief loading while checking authentication (max 500ms)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #eab308', borderTop: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show app only if authenticated (regular users only)
  // This should only happen after successful login through PhoneLogin
  return <App />;
}

