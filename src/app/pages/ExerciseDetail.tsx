// src/app/pages/ExerciseDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useExercise } from '@/hooks/useExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Clock, 
  Tag, 
  Music, 
  Image as ImageIcon, 
  Video,
  FileText,
  AlertCircle,
  Play
} from 'lucide-react';
import { useState } from 'react';
import { ExerciseCategory, ExerciseDifficulty } from '@/types/exercise.types';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ExerciseEditModal } from '../components/exercises/ExerciseEditModal';

export function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useExercise(id!);

  const getDifficultyLabel = (difficulty: ExerciseDifficulty) => {
    switch(difficulty) {
      case 'beginner': return t('exercises.difficulty.beginner', 'Beginner');
      case 'intermediate': return t('exercises.difficulty.intermediate', 'Intermediate');
      case 'advanced': return t('exercises.difficulty.advanced', 'Advanced');
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: ExerciseDifficulty) => {
    switch(difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryLabel = (category: ExerciseCategory) => {
    const labels: Record<ExerciseCategory, string> = {
      pronunciation: t('exercises.category.pronunciation', 'Pronunciation'),
      vocabulary: t('exercises.category.vocabulary', 'Vocabulary'),
      grammar: t('exercises.category.grammar', 'Grammar'),
      comprehension: t('exercises.category.comprehension', 'Comprehension'),
      fluency: t('exercises.category.fluency', 'Fluency'),
      articulation: t('exercises.category.articulation', 'Articulation'),
      phonology: t('exercises.category.phonology', 'Phonology'),
      language: t('exercises.category.language', 'Language'),
      social_communication: t('exercises.category.social_communication', 'Social Communication'),
      other: t('exercises.category.other', 'Other'),
    };
    return labels[category] || category;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-red-500">{t('common.error', 'Error')}</p>
          <button
            onClick={() => navigate('/exercises')}
            className="mt-2 text-primary hover:underline"
          >
            {t('common.back', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  const exercise = data.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        showBack={true} 
        showHome={true}
        items={[
          { label: t('sidebar.exercises', 'Exercises'), path: '/exercises' },
          { label: exercise.title, path: `/exercises/${exercise.id}` }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            {exercise.imageUrl ? (
              <img 
                src={exercise.imageUrl} 
                alt={exercise.title}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <BookOpen size={32} />
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {exercise.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
                {getDifficultyLabel(exercise.difficulty)}
              </span>
              <span className="text-sm text-gray-600">
                {getCategoryLabel(exercise.category)}
              </span>
              {exercise.duration && (
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock size={14} />
                  {exercise.duration} {t('exercises.minutes', 'min')}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setEditModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
        >
          <Edit size={16} />
          {t('common.edit', 'Edit')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <FileText size={20} />
                {t('exercises.description', 'Description')}
              </h2>
              <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <Play size={20} />
                {t('exercises.instructions', 'Instructions')}
              </h2>
              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 whitespace-pre-wrap">
                {exercise.instructions}
              </div>
            </div>
          </div>

          {/* Materials */}
          {exercise.materials && exercise.materials.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Tag size={20} />
                  {t('exercises.materials', 'Materials')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {exercise.materials.map((material, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image */}
          {exercise.imageUrl && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon size={16} />
                  {t('exercises.image', 'Image')}
                </h3>
              </div>
              <div className="p-4">
                <img 
                  src={exercise.imageUrl} 
                  alt={exercise.title}
                  className="w-full rounded-lg object-cover aspect-video"
                />
              </div>
            </div>
          )}

          {/* Audio */}
          {exercise.audioUrl && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Music size={16} />
                  {t('exercises.audio', 'Audio')}
                </h3>
              </div>
              <div className="p-4">
                <audio controls className="w-full">
                  <source src={exercise.audioUrl} type="audio/mpeg" />
                  {t('exercises.audioNotSupported', 'Your browser does not support the audio element')}
                </audio>
              </div>
            </div>
          )}

          {/* Video */}
          {exercise.videoUrl && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Video size={16} />
                  {t('exercises.video', 'Video')}
                </h3>
              </div>
              <div className="p-4">
                <video controls className="w-full rounded-lg">
                  <source src={exercise.videoUrl} type="video/mp4" />
                  {t('exercises.videoNotSupported', 'Your browser does not support the video element')}
                </video>
              </div>
            </div>
          )}

          {/* Tags */}
          {exercise.tags && exercise.tags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Tag size={16} />
                  {t('exercises.tags', 'Tags')}
                </h3>
              </div>
              <div className="p-4 flex flex-wrap gap-1">
                {exercise.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium">{t('exercises.metadata', 'Metadata')}</h3>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('exercises.createdBy', 'Created By')}</span>
                <span>{exercise.creatorName || exercise.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('exercises.createdAt', 'Created At')}</span>
                <span>{new Date(exercise.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('exercises.updatedAt', 'Updated At')}</span>
                <span>{new Date(exercise.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('exercises.status', 'Status')}</span>
                <span className={exercise.isActive ? 'text-green-600' : 'text-red-600'}>
                  {exercise.isActive ? t('exercises.active', 'Active') : t('exercises.inactive', 'Inactive')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ExerciseEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        exerciseId={exercise.id}
        onSuccess={() => {
          refetch();
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}