// src/app/components/common/BottomNav.tsx
import { Home, Users, BookOpen, BarChart2, User, LogOut } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import { Role, Screen } from '@/types';

interface BottomNavProps {
  role: Role;
  active: string;
  onNavigate: (s: Screen) => void;
  onLogout: () => void;
}

export function BottomNav({ role, active, onNavigate, onLogout }: BottomNavProps) {
  const { t, isRTL } = useTranslation();
  const { direction } = useLanguage();

  const orthoItems = [
    { icon: Home, label: t('sidebar.home'), screen: 'ortho-dashboard' as Screen },
    { icon: Users, label: t('sidebar.patients'), screen: 'patients' as Screen },
    { icon: BookOpen, label: t('sidebar.exercises'), screen: 'exercise-create' as Screen },
    { icon: BarChart2, label: t('sidebar.reports'), screen: 'ortho-progress' as Screen },
  ];

  const parentItems = [
    { icon: Home, label: t('sidebar.home'), screen: 'parent-dashboard' as Screen },
    { icon: BookOpen, label: t('sidebar.exercises'), screen: 'parent-dashboard' as Screen },
    { icon: BarChart2, label: t('sidebar.reports'), screen: 'parent-progress' as Screen },
    { icon: User, label: t('sidebar.settings'), screen: 'parent-dashboard' as Screen },
  ];

  const items = role === 'orthophoniste' ? orthoItems : parentItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around items-center h-16 z-50 px-2"
      style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.06)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {items.map((item) => {
        const isActive = active === item.screen;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.screen)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 transition-all relative"
            style={{ color: isActive ? '#4A90D9' : '#718096' }}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive && (
              <div className="absolute -top-0.5 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        );
      })}

      {/* Logout button on mobile */}
      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-0.5 px-2 py-1 transition-all text-red-500"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium">{t('sidebar.logout')}</span>
      </button>
    </nav>
  );
}