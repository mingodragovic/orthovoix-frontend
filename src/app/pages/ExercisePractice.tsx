// src/app/pages/ExercisePractice.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, Play, Pause, Volume2, Mic, Square, 
  Check, Star, Clock, Award, ChevronRight,
  RefreshCw, Heart, Smile, ThumbsUp
} from "lucide-react";

export function ExercisePractice() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
const showToast = useToast();
  const { t } = useTranslation();
  
  const [currentWord, setCurrentWord] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPracticeComplete, setIsPracticeComplete] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mock exercise data for practice
  const currentExercise = {
    id: Number(id) || 1,
    titre: "Son SH - Niveau 1",
    instructions: "Répétez les mots suivants en prononçant bien le son 'SH'",
    targetSound: "SH",
    words: ["chat", "chapeau", "cheval", "poisson", "tasse"],
    image: "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?w=600&h=400&fit=crop&auto=format",
    audioUrl: "https://example.com/audio/sh-sound.mp3",
    difficulty: "Facile",
    category: "Sonorité"
  };

  // Mock audio playback
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setTimeout(() => {
        setIsPlaying(false);
      }, 3000);
    }
  };

  // Mock recording
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setAttempts(prev => prev + 1);
      setTimeout(() => {
        showToast.success("🎤 Audio enregistré avec succès !");
      }, 500);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        if (isRecording) {
          setIsRecording(false);
          setAttempts(prev => prev + 1);
          showToast.success("🎤 Audio enregistré avec succès !");
        }
      }, 5000);
    }
  };

  const handleWordComplete = () => {
    if (!completed.includes(currentWord)) {
      setCompleted([...completed, currentWord]);
      setScore(prev => prev + 1);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      
      if (completed.length + 1 === currentExercise.words.length) {
        setIsPracticeComplete(true);
        showToast.success("🎉 Félicitations ! Exercice terminé !");
      }
    }
  };

  const nextWord = () => {
    if (currentWord < currentExercise.words.length - 1) {
      setCurrentWord(prev => prev + 1);
    }
  };

  const resetExercise = () => {
    setCurrentWord(0);
    setCompleted([]);
    setAttempts(0);
    setScore(0);
    setTimeSpent(0);
    setIsPracticeComplete(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Timer
  useEffect(() => {
    if (!isPracticeComplete) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPracticeComplete]);

  const progress = Math.round((completed.length / currentExercise.words.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => navigate("/parent-dashboard")}
          className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Retour</span>
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentExercise.difficulty === "Facile" ? "bg-green-100 text-green-700" :
            currentExercise.difficulty === "Moyen" ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          }`}>
            {currentExercise.difficulty}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={16} />
            <span className="text-sm">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {!isPracticeComplete ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Exercise Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exercise Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border/50">
              {/* Image */}
              {currentExercise.image && (
                <div className="relative h-48 md:h-64 bg-muted">
                  <img 
                    src={currentExercise.image} 
                    alt={currentExercise.titre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-white text-xl font-bold">{currentExercise.titre}</h2>
                    <p className="text-white/90 text-sm">{currentExercise.category}</p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Instructions</h3>
                    <span className="text-sm text-muted-foreground">
                      {currentWord + 1} / {currentExercise.words.length}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{currentExercise.instructions}</p>
                </div>

                {/* Current Word */}
                <div className="bg-muted/30 rounded-2xl p-6 text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Répétez ce mot :</p>
                  <div className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    {currentExercise.words[currentWord]}
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    {/* Audio Button */}
                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center hover:shadow-lg transition-all active:scale-95"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>

                    {/* Record Button */}
                    <button
                      onClick={toggleRecording}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-muted text-foreground hover:bg-primary/20'
                      }`}
                    >
                      {isRecording ? <Square size={24} /> : <Mic size={24} />}
                    </button>

                    {/* Done Button */}
                    <button
                      onClick={handleWordComplete}
                      disabled={completed.includes(currentWord)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        completed.includes(currentWord)
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-foreground hover:bg-green-500/20'
                      }`}
                    >
                      {completed.includes(currentWord) ? <Check size={24} /> : <ChevronRight size={24} />}
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Progress & Stats */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h4 className="font-semibold mb-4">Vos stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mots pratiqués</span>
                  <span className="font-semibold">{completed.length}/{currentExercise.words.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="font-semibold text-primary">{score} pts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Essais</span>
                  <span className="font-semibold">{attempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Temps</span>
                  <span className="font-semibold">{Math.floor(timeSpent / 60)}m {(timeSpent % 60)}s</span>
                </div>
              </div>
            </div>

            {/* Word List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h4 className="font-semibold mb-3">Mots à pratiquer</h4>
              <div className="space-y-2">
                {currentExercise.words.map((word, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      index === currentWord 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : completed.includes(index)
                          ? 'bg-green-50 text-green-700'
                          : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      index === currentWord
                        ? 'bg-primary text-white'
                        : completed.includes(index)
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {completed.includes(index) ? <Check size={12} /> : index + 1}
                    </div>
                    <span>{word}</span>
                    {completed.includes(index) && <Star size={14} className="text-yellow-500 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="text-blue-500 mt-0.5">💡</div>
                <div>
                  <h5 className="font-medium text-sm text-blue-900">Astuce</h5>
                  <p className="text-xs text-blue-700">Regardez-vous dans un miroir en prononçant les sons. Cela aide à visualiser la position de la langue !</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Completion Screen
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border/50 text-center">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <Award size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">🎉 Exercice terminé !</h2>
            <p className="text-muted-foreground mb-6">Super travail ! Vous avez complété tous les mots.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-md mb-8">
              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="text-2xl font-bold text-primary">{score}</div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="text-2xl font-bold text-secondary">{currentExercise.words.length}</div>
                <div className="text-xs text-muted-foreground">Mots</div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="text-2xl font-bold text-accent">{attempts}</div>
                <div className="text-xs text-muted-foreground">Essais</div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="text-2xl font-bold">{Math.floor(timeSpent / 60)}m</div>
                <div className="text-xs text-muted-foreground">Temps</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetExercise}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                <RefreshCw size={18} />
                Recommencer
              </button>
              <button
                onClick={() => navigate("/parent-dashboard")}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-medium hover:shadow-lg transition-all active:scale-95"
              >
                <ThumbsUp size={18} />
                Retour aux exercices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}