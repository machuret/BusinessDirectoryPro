import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminBusinessesPage from '@/pages/admin/businesses';
import { LoadingState } from '@/components/loading/LoadingState';

export default function AdminDirect() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Automatically authenticate as admin
    const authenticate = async () => {
      try {
        // First try to login with admin credentials
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'admin@businesshub.com',
            password: 'Xola2025'
          }),
          credentials: 'include',
        });

        if (loginResponse.ok) {
          setIsAuthenticated(true);
        } else {
          // If login fails, redirect to regular login
          setLocation('/login');
        }
      } catch (error) {
        console.error('Auto-authentication failed:', error);
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [setLocation]);

  if (isLoading) {
    return <LoadingState variant="spinner" size="lg" message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <LoadingState variant="spinner" size="lg" message="Redirecting to login..." />;
  }

  return (
    <AdminLayout>
      <AdminBusinessesPage />
    </AdminLayout>
  );
}