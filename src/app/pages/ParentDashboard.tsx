// src/app/pages/ParentDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Play, Volume2, CheckCircle, Award, Star, 
  Calendar, TrendingUp, Clock, ChevronRight,
  Smile, Sparkles, Trophy
} from "lucide-react";
import { Avatar } from "../components/common/Avatar";
import { exercisesParent } from "../../data/mockData";
import { useAuth } from "@/providers/AuthProvider";
import { LanguageSelector } from "../components/common/LanguageSelector";

export function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
const showToast = useToast();
  const { t } = useTranslation();
  
  const [done, setDone] = useState<number[]>([1]);
  const [streak, setStreak] = useState(3);
  const [stars, setStars] = useState(12);

  const totalExercises = exercisesParent.length;
  const completedCount = done.length;
  const progress = Math.round((completedCount / totalExercises) * 100);

  // Weekly progress data
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const weekData = [2, 1, 3, 0, 2, 1, 0];

  const handleStartExercise = (exerciseId: number) => {
    navigate(`/exercise-practice/${exerciseId}`);
    showToast.success("🎯 Commençons l'exercice !");
  };

  const handleMarkDone = (id: number) => {
    if (!done.includes(id)) {
      setDone([...done, id]);
      setStars(stars + 1);
      showToast.success("🌟 Super travail ! +1 étoile !");
      
      // Update streak
      setStreak(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
  <div>
    <p className="text-sm text-muted-foreground">{t('dashboard.greeting')},</p>
    <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
      {user?.name || "Parent"} 👋
    </h1>
    {user?.childName && (
      <p className="text-sm text-muted-foreground mt-0.5">
        Exercices pour <span className="font-medium text-primary">{user.childName}</span>
      </p>
    )}
  </div>
 <div className="flex items-center gap-3">
  <LanguageSelector />
  {user?.avatar ? (
    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
      <img 
        src={user.avatar} 
        alt={user.name || 'Parent'}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-base">${user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>`;
          }
        }}
      />
    </div>
  ) : (
    <Avatar initials={user?.name?.charAt(0)?.toUpperCase() || "P"} size={48} />
  )}
</div>
</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{completedCount}/{totalExercises}</div>
          <div className="text-xs text-muted-foreground">Exercices faits</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stars} ⭐</div>
          <div className="text-xs text-muted-foreground">Étoiles gagnées</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{streak}🔥</div>
          <div className="text-xs text-muted-foreground">Jours d'affilée</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{progress}%</div>
          <div className="text-xs text-muted-foreground">Progression</div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Activité de la semaine</h3>
          <span className="text-sm text-muted-foreground">📊 Cette semaine</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {weekDays.map((day, index) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full max-w-12">
                <div 
                  className="w-full rounded-lg bg-primary/20 transition-all duration-500 hover:bg-primary/30"
                  style={{ 
                    height: `${(weekData[index] / 3) * 80 + 10}px`,
                    backgroundColor: weekData[index] > 0 ? '#4A90D9' : '#E5E7EB'
                  }}
                />
                {weekData[index] > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-primary">
                    {weekData[index]}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Exercises */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>
            📚 Exercices à faire
          </h2>
          <button 
            onClick={() => navigate("/parent-progress")}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            Voir tout
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {exercisesParent.filter((ex) => !done.includes(ex.id)).map((ex) => (
            <div 
              key={ex.id} 
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-border/50 group"
            >
              {ex.image && (
                <div className="relative h-48 bg-muted">
                  <img src={ex.image} alt={ex.titre} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                      🎯 {ex.titre}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{ex.titre}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    Assigné le {ex.dateAssignation}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ex.instructions}</p>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStartExercise(ex.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white font-medium hover:shadow-lg transition-all active:scale-95"
                  >
                    <Play size={18} />
                    Commencer
                  </button>
                  <button
                    onClick={() => handleMarkDone(ex.id)}
                    className="py-2.5 px-4 rounded-xl border border-border hover:bg-green-50 hover:border-green-300 transition-all text-sm font-medium text-muted-foreground hover:text-green-600"
                  >
                    ✅ Fait
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {exercisesParent.filter((ex) => !done.includes(ex.id)).length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">Tous les exercices sont terminés !</h3>
            <p className="text-muted-foreground">Bravo pour ce super travail !</p>
          </div>
        )}
      </div>

      {/* Completed Exercises */}
      {done.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            ✅ Exercices terminés
            <span className="text-sm font-normal text-muted-foreground">— Super travail ! 🌟</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exercisesParent.filter((ex) => done.includes(ex.id)).map((ex) => (
              <div key={ex.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-green-100">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{ex.titre}</p>
                  <p className="text-xs text-muted-foreground">{ex.dateRealisation || "Aujourd'hui"}</p>
                </div>
                <Star size={16} className="text-yellow-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}