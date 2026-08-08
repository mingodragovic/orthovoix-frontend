// src/app/pages/ParentExercises.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { usePatientExercises } from '@/hooks/usePatientExercises';
import { ExerciseCard } from '../components/parent/ExerciseCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Search, Filter } from 'lucide-react';
import { PatientExerciseStatus } from '@/types/patient-exercise.types';

export function ParentExercises() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: dashboard } = useParentDashboard();
  const childId = dashboard?.child.id;

  const { data: exercisesData, isLoading, error } = usePatientExercises(
    childId || '',
    statusFilter as PatientExerciseStatus || undefined
  );

  const exercises = exercisesData?.data || [];

  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: t('common.all', 'All') },
    { value: 'assigned', label: t('patientExercises.status.assigned') },
    { value: 'in-progress', label: t('patientExercises.status.inProgress') },
    { value: 'completed', label: t('patientExercises.status.completed') },
    { value: 'overdue', label: t('patientExercises.status.overdue') },
    { value: 'cancelled', label: t('patientExercises.status.cancelled') },
  ];

  const filteredExercises = exercises.filter((exercise: any) =>
    exercise.exerciseTitle.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !childId) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
      </div>
    );
  }

  return (
<div className="space-y-4 pb-20 mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('parent.exercises.title', 'Exercises')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('parent.exercises.subtitle', 'Practice and track your progress')}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('parent.exercises.search', 'Search exercises...')}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white rounded-xl pl-9 pr-8 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Exercise List */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">
            {t('parent.exercises.empty', 'No exercises found')}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('parent.exercises.emptyDescription', 'Complete your first exercise to see it here!')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
        {filteredExercises.map((exercise: any) => {
  const hasSubmitted = exercise.recordings && exercise.recordings.length > 0;
  return (
    <div key={exercise.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{exercise.exerciseTitle}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              exercise.status === 'completed' ? 'bg-green-100 text-green-700' :
              exercise.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
              exercise.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {exercise.status}
            </span>
            {exercise.performance?.score !== null && (
              <span className="text-xs text-gray-500">Score: {exercise.performance?.score}%</span>
            )}
          </div>
        </div>
        {hasSubmitted ? (
          <button
            onClick={() => navigate(`/parent/exercises/${exercise.id}/practice`)}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
          >
            📋 View Submission
          </button>
        ) : (
          <button
            onClick={() => navigate(`/parent/exercises/${exercise.id}/practice`)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            🎤 Practice
          </button>
        )}
      </div>
    </div>
  );
})}
        </div>
      )}
    </div>
  );
}