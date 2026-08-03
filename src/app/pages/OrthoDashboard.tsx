// src/app/pages/OrthoDashboard.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Bell, TrendingUp, Users, CheckCircle, Clock } from "lucide-react";
import { Avatar } from "../components/common/Avatar";
import { useAuth } from '@/providers/AuthProvider';
import { LanguageSelector } from '../components/common/LanguageSelector';

export function OrthoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const activite = [
    { nom: "Emma Martin", action: "a terminé", exercice: "Son SH", statut: "✅", temps: "il y a 2h", avatar: "EM" },
    { nom: "Noah Dupont", action: "en attente", exercice: "Son R", statut: "⏳", temps: "il y a 5h", avatar: "ND" },
    { nom: "Léa Bernard", action: "a terminé", exercice: "Voyelles longues", statut: "✅", temps: "hier", avatar: "LB" },
    { nom: "Chloé Petit", action: "a commencé", exercice: "Son S", statut: "⏳", temps: "aujourd'hui", avatar: "CP" },
  ];
  
  const stats = [
    { label: t('dashboard.totalPatients'), val: 12, color: "#4A90D9", bg: "#EBF4FF", icon: Users },
    { label: t('dashboard.pending'), val: 8, color: "#F5A623", bg: "#FFFAF0", icon: Clock },
    { label: t('dashboard.completed'), val: 24, color: "#48BB78", bg: "#F0FFF4", icon: CheckCircle },
    { label: t('dashboard.successRate'), val: "85%", color: "#9B59B6", bg: "#F5F0FF", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <LanguageSelector />

        <div>
          <p className="text-sm text-muted-foreground">{t('dashboard.greeting')},</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
            {user?.name || "Dr. Sarah"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Voici votre aperçu aujourd'hui</p>
        </div>
<div className="flex items-center gap-3">
  <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
    <Bell size={22} className="text-foreground" />
    <span className="absolute top-1 right-1 w-4 h-4 bg-[#F5A623] rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
  </button>
  {user?.avatar ? (
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
      <img 
        src={user.avatar} 
        alt={user.name || 'User'}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">${user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>`;
          }
        }}
      />
    </div>
  ) : (
    <Avatar initials={user?.name?.charAt(0)?.toUpperCase() || "DS"} size={42} />
  )}
</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <span className="text-2xl md:text-3xl font-bold" style={{ color: s.color, fontFamily: "Poppins, sans-serif" }}>{s.val}</span>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: "👤", label: t('patients.add'), color: "#EBF4FF", path: "/patients" },
            { icon: "📝", label: t('sidebar.exercises'), color: "#F0FFF4", path: "/exercise-create" },
            { icon: "📋", label: t('sidebar.patients'), color: "#FFFAF0", path: "/patients" },
            { icon: "📊", label: t('sidebar.reports'), color: "#FFF5F5", path: "/ortho-progress" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-white shadow-sm hover:shadow-md active:scale-95 transition-all text-left border border-border/50"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0" style={{ background: a.color }}>{a.icon}</div>
              <span className="text-sm md:text-base font-medium text-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>{t('dashboard.recentActivity')}</h2>
          <button className="text-sm text-primary font-medium hover:underline">Voir tout</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {activite.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-5 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow border border-border/50">
              <Avatar initials={a.avatar} size={44} />
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium truncate">
                  <span className="font-semibold">{a.nom}</span> {a.action} <span className="text-primary">'{a.exercice}'</span>
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{a.temps}</p>
              </div>
              <span className="text-2xl">{a.statut}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}