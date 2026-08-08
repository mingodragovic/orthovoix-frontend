// src/app/pages/ParentExerciseDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useExercise } from '@/hooks/useExercises';
import { usePatientExercise, useUpdateExerciseStatus, useUpdateExerciseProgress } from '@/hooks/usePatientExercises';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Mic, 
  Square, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BookOpen,
  FileText,
  Save,
  X
} from 'lucide-react';
import { BaseModal } from '../components/ui/BaseModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function ParentExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [progressNotes, setProgressNotes] = useState('');
  const [progressScore, setProgressScore] = useState<number>(0);

  const { data: dashboard } = useParentDashboard();
  const childId = dashboard?.child.id;

  const { data: assignmentData, isLoading: assignmentLoading, refetch } = usePatientExercise(id!);
  const { data: exerciseData, isLoading: exerciseLoading } = useExercise(assignmentData?.data?.exerciseId || '');
  const updateStatus = useUpdateExerciseStatus(id!);
  const updateProgress = useUpdateExerciseProgress(id!);

  const assignment = assignmentData?.data;
  const exercise = exerciseData?.data;

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    await updateStatus.mutateAsync({
      status: newStatus as any,
      notes: progressNotes || undefined,
    });

    setStatusModalOpen(false);
    setNewStatus('');
    setProgressNotes('');
    refetch();
  };

  const handleProgressUpdate = async () => {
    await updateProgress.mutateAsync({
      progressLog: {
        notes: progressNotes || 'Progress updated',
        score: progressScore || 0,
      },
    });

    setStatusModalOpen(false);
    setProgressNotes('');
    setProgressScore(0);
    refetch();
  };

  if (assignmentLoading || exerciseLoading) {
    return <LoadingSpinner />;
  }

  if (!assignment || !exercise) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => navigate('/parent/exercises')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'assigned': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/parent/exercises')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{exercise.title}</h1>
          <p className="text-sm text-gray-500">{exercise.category}</p>
        </div>
      </div>

      {/* Image */}
      {exercise.imageUrl && (
        <div className="rounded-2xl overflow-hidden bg-gray-100">
          <img src={exercise.imageUrl} alt={exercise.title} className="w-full h-48 object-cover" />
        </div>
      )}

      {/* Status */}
      <div className={`p-3 rounded-xl border ${getStatusColor(assignment.status)}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {t('patientExercises.status')}: {t(`patientExercises.status.${assignment.status}`)}
          </span>
          <button
            onClick={() => setStatusModalOpen(true)}
            className="text-sm text-primary hover:underline"
          >
            {t('common.update', 'Update')}
          </button>
        </div>
      </div>

      {/* Description & Instructions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-2">
          {t('exercises.description')}
        </h2>
        <p className="text-sm text-gray-600">{exercise.description}</p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <h2 className="text-sm font-medium text-blue-900 mb-2">
          {t('exercises.instructions')}
        </h2>
        <p className="text-sm text-blue-800 whitespace-pre-wrap">{exercise.instructions}</p>
      </div>

      {/* Media */}
      <div className="space-y-3">
        {/* Audio */}
        {exercise.audioUrl && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <audio controls className="w-full">
              <source src={exercise.audioUrl} type="audio/mpeg" />
              {t('exercises.audioNotSupported')}
            </audio>
          </div>
        )}

        {/* Video */}
        {exercise.videoUrl && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <video controls className="w-full">
              <source src={exercise.videoUrl} type="video/mp4" />
              {t('exercises.videoNotSupported')}
            </video>
          </div>
        )}
      </div>

      {/* Materials */}
      {exercise.materials && exercise.materials.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-2">
            {t('exercises.materials')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {exercise.materials.map((material: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {material}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <BaseModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={t('patientExercises.updateStatus.title')}
        size="sm"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('patientExercises.status')}
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">{t('common.select')}</option>
              {['assigned', 'in-progress', 'completed', 'overdue', 'cancelled'].map((status) => (
                <option key={status} value={status}>
                  {t(`patientExercises.status.${status}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('patientExercises.notes')}
            </label>
            <textarea
              value={progressNotes}
              onChange={(e) => setProgressNotes(e.target.value)}
              rows={3}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleStatusUpdate}
              disabled={!newStatus || updateStatus.isPending}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {t('common.save')}
            </button>
            <button
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}