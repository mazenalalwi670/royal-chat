'use client';

import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';

/**
 * Admin Page - Owner Only
 * 
 * This page is ONLY accessible on port 4001 via http://localhost:4001/admin
 * Regular users on port 4000 cannot access this page at all.
 * 
 * Flow:
 * 1. If not authenticated -> Show AdminLogin
 * 2. If authenticated as owner (admin/mazen@771885223) -> Show AdminDashboard
 * 3. Otherwise -> Show AdminLogin (blocked)
 */
export default function AdminPage() {
  const { user, isAuthenticated, isLoading, isOwner } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // STRICT PROTECTION: Only owner can access admin dashboard
  // This page is completely separate from regular user app
  // Regular users on port 4000 cannot access this at all
  if (isAuthenticated && user && isOwner && user.role === 'owner' && user.username === 'admin') {
    // Owner is authenticated -> Show Admin Dashboard
    return <AdminDashboard />;
  }

  // Not authenticated or not owner -> Always show Admin Login
  // This is the ONLY page accessible on /admin route when not authenticated
  return <AdminLogin />;
}

