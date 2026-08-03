// src/app/pages/PatientDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, CheckCircle, Circle, Plus } from "lucide-react";
import { Avatar } from "../components/common/Avatar";
import { exercisesOrtho, patients } from "../../data/mockData";

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const patient = patients.find(p => p.id === Number(id));
  
  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Patient non trouvé</h2>
        <button 
          onClick={() => navigate('/patients')}
          className="mt-4 text-primary hover:underline"
        >
          Retour à la liste des patients
        </button>
      </div>
    );
  }

  const completedExercises = exercisesOrtho.filter(ex => ex.statut === "terminé").length;
  const totalExercises = exercisesOrtho.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-2 rounded-xl transition-colors">
        <ArrowLeft size={18} /> 
        <span className="font-medium">Retour à la liste</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <div className="flex flex-col items-center text-center">
              <Avatar initials={patient.avatar} size={72} />
              <h2 className="text-xl font-bold mt-3" style={{ fontFamily: "Poppins, sans-serif" }}>{patient.nom}</h2>
              <p className="text-muted-foreground">{patient.age} ans</p>
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                patient.statut === "Actif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}>
                {patient.statut}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progression</span>
                <span className="text-sm font-medium">{patient.progression}/{patient.total}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(patient.progression / patient.total) * 100}%`, background: "linear-gradient(90deg, #4A90D9, #6EC6A0)" }} />
              </div>
            </div>

            <button
              onClick={() => navigate('/exercise-create')}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-medium hover:shadow-lg transition-all active:scale-95"
            >
              <Plus size={18} />
              Assigner un exercice
            </button>
          </div>
        </div>

        {/* Exercises List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Exercices assignés</h3>
            
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-primary">{totalExercises}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-green-600">{completedExercises}</div>
                <div className="text-xs text-muted-foreground">Terminés</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-yellow-600">{totalExercises - completedExercises}</div>
                <div className="text-xs text-muted-foreground">En cours</div>
              </div>
            </div>

            <div className="space-y-3">
              {exercisesOrtho.map((ex) => (
                <div key={ex.id} className="flex items-center gap-3 p-4 rounded-xl hover:bg-muted/20 transition-colors border border-border/30">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    ex.statut === "terminé" ? "bg-green-100 text-green-600" :
                    ex.statut === "assigné" ? "bg-yellow-100 text-yellow-600" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {ex.statut === "terminé" ? <CheckCircle size={20} /> :
                     ex.statut === "assigné" ? <Clock size={20} /> :
                     <Circle size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ex.titre}</p>
                    <p className="text-xs text-muted-foreground">Assigné le {ex.dateAssignation}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    ex.statut === "terminé" ? "bg-green-100 text-green-700" :
                    ex.statut === "assigné" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {ex.statut}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}