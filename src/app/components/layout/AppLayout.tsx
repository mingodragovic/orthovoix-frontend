// src/components/layout/AppLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useLogout } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Sidebar } from '@/app/components/common/Sidebar';
import { BottomNav } from '@/app/components/common/BottomNav';
import { Toast } from '@/app/components/common/Toast';
import { Role } from '@/types';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const logout = useLogout();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout.mutate();
  };

  const isParent = user?.role === 'parent';
  
  // ✅ CORRECT: Hide sidebar on mobile, only show for orthophoniste on desktop
  const showSidebar = !isMobile && !isParent && isAuthenticated;
  const showBottomNav = isMobile && isAuthenticated;

  // Calculate sidebar width for margin (only on desktop)
  const sidebarWidth = showSidebar 
    ? (sidebarOpen ? '240px' : '72px') 
    : '0px';

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="flex min-h-screen relative">
        {/* Sidebar - only for orthophoniste on DESKTOP */}
        {showSidebar && (
          <Sidebar
            active={location.pathname}
            onNavigate={(path: string) => navigate(path)}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            user={user || null}
            onLogout={handleLogout}
          />
        )}

        {/* Main Content */}
        <main
          className={`
            flex-1 min-h-screen transition-all duration-300
            ${isMobile ? 'pb-20' : 'pb-6'}
          `}
          style={{
            // Only apply margin on desktop when sidebar is shown
            marginLeft: isRTL ? '0' : (showSidebar ? sidebarWidth : '0'),
            marginRight: isRTL ? (showSidebar ? sidebarWidth : '0') : '0',
          }}
        >
          <div className="container mx-auto px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-7xl">
            <Outlet context={{ showToast }} />
          </div>
        </main>

        {/* Bottom Navigation - Mobile Only */}
        {showBottomNav && (
          <BottomNav
            role={user?.role as Role}
            active={location.pathname}
            onNavigate={(path: string) => navigate(path)}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}