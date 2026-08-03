// src/app/pages/ParentProgress.tsx
import { useAuth } from "@/providers/AuthProvider";
import { Star } from "lucide-react";

export function ParentProgress() {
  const { user } = useAuth();
  
  const total = 10;
  const done = 6;
  const pct = (done / total) * 100;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const badges = [
    { icon: "⭐", label: "Première étoile", desc: "1er exercice terminé", unlocked: true, color: "from-yellow-400 to-yellow-600" },
    { icon: "🏆", label: "Champion", desc: "5 exercices terminés", unlocked: true, color: "from-amber-400 to-amber-600" },
    { icon: "🌟", label: "Superstar", desc: "10 exercices terminés", unlocked: false, color: "from-purple-400 to-purple-600" },
    { icon: "🎯", label: "Précision", desc: "3 jours consécutifs", unlocked: true, color: "from-blue-400 to-blue-600" },
    { icon: "🔥", label: "Enchaînement", desc: "5 jours consécutifs", unlocked: false, color: "from-red-400 to-red-600" },
    { icon: "💪", label: "Déterminé", desc: "15 exercices terminés", unlocked: false, color: "from-green-400 to-green-600" },
  ];

  const historique = [
    { icon: "🏆", titre: "Son SH", date: "15 juillet", score: 5 },
    { icon: "⭐", titre: "Voyelles longues", date: "8 juillet", score: 4 },
    { icon: "🏆", titre: "Son P", date: "3 juillet", score: 5 },
    { icon: "⭐", titre: "Son B", date: "28 juin", score: 3 },
    { icon: "🏆", titre: "Respiration", date: "20 juin", score: 4 },
    { icon: "⭐", titre: "Sons nasaux", date: "15 juin", score: 5 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
          Progrès de {user?.childName || "votre enfant"} 🌟
        </h1>
        <p className="text-muted-foreground">Suivez les progrès et célébrez les réussites !</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Ring */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center shadow-sm border border-border/50">
            <div className="relative mb-4">
              <svg width={150} height={150} viewBox="0 0 130 130">
                <circle cx={65} cy={65} r={r} fill="none" stroke="#EDF2F7" strokeWidth={12} />
                <circle 
                  cx={65} cy={65} r={r} fill="none"
                  stroke="url(#progressGradient)" 
                  strokeWidth={12}
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={circ / 4}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4A90D9" />
                    <stop offset="100%" stopColor="#6EC6A0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground" style={{ fontFamily: "Poppins, sans-serif" }}>{done}/{total}</span>
                <span className="text-xs text-muted-foreground">exercices</span>
              </div>
            </div>
            <p className="text-lg font-semibold text-center" style={{ fontFamily: "Poppins, sans-serif" }}>{done} exercices sur {total} terminés !</p>
            <p className="text-sm text-[#48BB78] font-medium mt-1">Continue comme ça ! 💪</p>
          </div>
        </div>

        {/* Badges and Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badges */}
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>🏅 Badges obtenus</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map((b, i) => (
                <div 
                  key={i} 
                  className={`bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border transition-all ${
                    b.unlocked ? 'border-border/50' : 'border-gray-100 opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${b.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{b.label}</p>
                    <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-border/50">
              <div className="text-2xl font-bold text-primary">85%</div>
              <div className="text-xs text-muted-foreground">Taux de réussite</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-border/50">
              <div className="text-2xl font-bold text-secondary">12</div>
              <div className="text-xs text-muted-foreground">Étoiles gagnées</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-border/50">
              <div className="text-2xl font-bold text-accent">3</div>
              <div className="text-xs text-muted-foreground">Jours d'affilée</div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>📋 Historique des exercices</h2>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50">
          <div className="grid grid-cols-4 text-xs font-semibold text-muted-foreground px-4 py-3 border-b border-border bg-muted/30">
            <span className="col-span-2">Exercice</span>
            <span>Date</span>
            <span className="text-right">Score</span>
          </div>
          {historique.map((h, i) => (
            <div key={i} className="grid grid-cols-4 items-center px-4 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-xl">{h.icon}</span>
                <span className="font-medium">{h.titre}</span>
              </div>
              <span className="text-sm text-muted-foreground">{h.date}</span>
              <div className="flex items-center justify-end gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star 
                    key={index} 
                    size={14} 
                    className={index < h.score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}