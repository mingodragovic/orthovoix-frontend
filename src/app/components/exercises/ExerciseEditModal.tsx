// src/components/exercises/ExerciseEditModal.tsx
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExercise, useUpdateExercise, useExerciseCategories } from '@/hooks/useExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle, Upload, X, Music, Image as ImageIcon, Video, Plus } from 'lucide-react';
import { ExerciseCategory, ExerciseDifficulty } from '@/types/exercise.types';
import { FormModal } from '../ui/FormModal';

interface ExerciseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  onSuccess?: () => void;
}

// Edit exercise form schema
const editExerciseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'pronunciation', 'vocabulary', 'grammar', 'comprehension', 
    'fluency', 'articulation', 'phonology', 'language', 
    'social_communication', 'other'
  ]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  materials: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

type EditExerciseFormValues = z.infer<typeof editExerciseSchema>;

export function ExerciseEditModal({ isOpen, onClose, exerciseId, onSuccess }: ExerciseEditModalProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useExercise(exerciseId);
  const updateExercise = useUpdateExercise(exerciseId);
  const { data: categoriesData } = useExerciseCategories();
  
  // File states (for new uploads)
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // File input refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // UI states for adding materials/tags
  const [materialInput, setMaterialInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<EditExerciseFormValues>({
    resolver: zodResolver(editExerciseSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      category: 'pronunciation',
      difficulty: 'beginner',
      instructions: '',
      duration: undefined,
      materials: [],
      tags: [],
      isActive: true,
    },
  });

  const materials = watch('materials') || [];
  const tags = watch('tags') || [];

  const categories = categoriesData?.data?.categories || [];

  // Populate form when data loads
  useEffect(() => {
    if (data) {
      const exercise = data.data;
      reset({
        title: exercise.title,
        description: exercise.description,
        category: exercise.category,
        difficulty: exercise.difficulty,
        instructions: exercise.instructions,
        duration: exercise.duration,
        materials: exercise.materials || [],
        tags: exercise.tags || [],
        isActive: exercise.isActive,
      });
    }
  }, [data, reset]);

  // Add material with proper UI
  const addMaterial = () => {
    if (materialInput.trim()) {
      setValue('materials', [...materials, materialInput.trim()]);
      setMaterialInput('');
    }
  };

  const removeMaterial = (index: number) => {
    setValue('materials', materials.filter((_, i) => i !== index));
  };

  // Add tag with proper UI
  const addTag = () => {
    if (tagInput.trim()) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setValue('tags', tags.filter((_, i) => i !== index));
  };

  // Handle Enter key for input fields
  const handleMaterialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMaterial();
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const removeFile = (setFile: (file: File | null) => void) => {
    setFile(null);
  };

 const onSubmit = async (data: EditExerciseFormValues) => {
  try {
    await updateExercise.mutateAsync({
      title: data.title,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty,
      instructions: data.instructions,
      duration: data.duration,
      materials: data.materials,
      tags: data.tags,
      isActive: data.isActive,
    });

    // Clear files
    setAudioFile(null);
    setImageFile(null);
    setVideoFile(null);
    setMaterialInput('');
    setTagInput('');
    
    onSuccess?.();
    onClose();
  } catch (error) {
    console.error('Exercise update failed:', error);
  }
};

  const handleClose = () => {
    setAudioFile(null);
    setImageFile(null);
    setVideoFile(null);
    reset();
    onClose();
  };

  if (isLoading) {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={() => {}}
        title={t('exercises.edit.title', 'Edit Exercise')}
        isLoading={true}
      >
        <div className="py-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', 'Loading...')}</p>
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={t('exercises.edit.title', 'Edit Exercise')}
      submitText={t('exercises.edit.submit', 'Update Exercise')}
      isLoading={updateExercise.isPending}
      isSubmitDisabled={!isValid || !isDirty || updateExercise.isPending}
      size="xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.title', 'Title')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.title ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateExercise.isPending}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.description', 'Description')} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${
              errors.description ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateExercise.isPending}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('exercises.category', 'Category')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateExercise.isPending}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`exercises.category.${cat}`, cat)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.category.message}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('exercises.difficulty', 'Difficulty')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('difficulty')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateExercise.isPending}
            >
              <option value="beginner">{t('exercises.difficulty.beginner', 'Beginner')}</option>
              <option value="intermediate">{t('exercises.difficulty.intermediate', 'Intermediate')}</option>
              <option value="advanced">{t('exercises.difficulty.advanced', 'Advanced')}</option>
            </select>
            {errors.difficulty && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.difficulty.message}
              </p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.duration', 'Duration (minutes)')}
          </label>
          <input
            type="number"
            {...register('duration', { valueAsNumber: true })}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.duration ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateExercise.isPending}
          />
          {errors.duration && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.duration.message}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.instructions', 'Instructions')} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('instructions')}
            rows={4}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${
              errors.instructions ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateExercise.isPending}
          />
          {errors.instructions && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.instructions.message}
            </p>
          )}
        </div>

        {/* Materials - With proper UI */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.materials', 'Materials')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {materials.map((material, index) => (
              <span key={index} className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-lg text-sm">
                {material}
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={materialInput}
              onChange={(e) => setMaterialInput(e.target.value)}
              onKeyDown={handleMaterialKeyDown}
              placeholder={t('exercises.edit.enterMaterial', 'Enter material name...')}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateExercise.isPending}
            />
            <button
              type="button"
              onClick={addMaterial}
              disabled={!materialInput.trim() || updateExercise.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Tags - With proper UI */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.tags', 'Tags')}
            <span className="text-xs text-muted-foreground ml-2">
              {t('exercises.tags.hint', '(keywords for searching)')}
            </span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={t('exercises.edit.enterTag', 'Enter tag...')}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateExercise.isPending}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || updateExercise.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('exercises.tags.examples', 'Examples: r-sound, tongue-twisters, children')}
          </p>
        </div>

       {/* Status */}
<div>
  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
    {t('exercises.status')}
  </label>
  <div className="flex items-center gap-3">
    <label className="flex items-center gap-2">
      <input
        type="radio"
        {...register('isActive')}
        value="true"
        className="w-4 h-4 text-primary"
        disabled={updateExercise.isPending}
      />
      <span className="text-sm">{t('exercises.active')}</span>
    </label>
    <label className="flex items-center gap-2">
      <input
        type="radio"
        {...register('isActive')}
        value="false"
        className="w-4 h-4 text-primary"
        disabled={updateExercise.isPending}
      />
      <span className="text-sm">{t('exercises.inactive')}</span>
    </label>
  </div>
</div>

        {/* File Uploads - Note: This is simplified. In production, you'd need to handle media replacement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Audio Upload */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <Music size={14} />
              {t('exercises.audio', 'Audio')}
            </label>
            <input
              type="file"
              ref={audioInputRef}
              onChange={(e) => handleFileSelect(e, setAudioFile)}
              accept="audio/*"
              className="hidden"
            />
            {audioFile ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-sm truncate max-w-[120px]">{audioFile.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(setAudioFile)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
              >
                {data?.data.audioUrl ? t('exercises.edit.replaceAudio', 'Replace Audio') : t('exercises.edit.uploadAudio', 'Upload Audio')}
              </button>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <ImageIcon size={14} />
              {t('exercises.image', 'Image')}
            </label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleFileSelect(e, setImageFile)}
              accept="image/*"
              className="hidden"
            />
            {imageFile ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-sm truncate max-w-[120px]">{imageFile.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(setImageFile)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
              >
                {data?.data.imageUrl ? t('exercises.edit.replaceImage', 'Replace Image') : t('exercises.edit.uploadImage', 'Upload Image')}
              </button>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <Video size={14} />
              {t('exercises.video', 'Video')}
            </label>
            <input
              type="file"
              ref={videoInputRef}
              onChange={(e) => handleFileSelect(e, setVideoFile)}
              accept="video/*"
              className="hidden"
            />
            {videoFile ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-sm truncate max-w-[120px]">{videoFile.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(setVideoFile)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
              >
                {data?.data.videoUrl ? t('exercises.edit.replaceVideo', 'Replace Video') : t('exercises.edit.uploadVideo', 'Upload Video')}
              </button>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  );
}