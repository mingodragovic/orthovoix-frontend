// src/components/exercises/ExerciseCreateModal.tsx
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateExerciseWithMedia, useExerciseCategories } from '@/hooks/useExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle, Upload, X, Music, Image as ImageIcon, Video, Plus } from 'lucide-react';
import { ExerciseCategory, ExerciseDifficulty } from '@/types/exercise.types';
import { FormModal } from '../ui/FormModal';

interface ExerciseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const createExerciseSchema = z.object({
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
isActive: z.enum(['true', 'false']).default('true').transform((val) => val === 'true'),
});

type CreateExerciseFormValues = z.infer<typeof createExerciseSchema>;

export function ExerciseCreateModal({ isOpen, onClose, onSuccess }: ExerciseCreateModalProps) {
  const { t } = useTranslation();
  const createExercise = useCreateExerciseWithMedia();
  const { data: categoriesData } = useExerciseCategories();
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [materialInput, setMaterialInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting, isValidating },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<CreateExerciseFormValues>({
    resolver: zodResolver(createExerciseSchema),
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
  const isActive = watch('isActive');

  const categories = categoriesData?.data?.categories || [];


  // Force validation when modal opens
  useEffect(() => {
    if (isOpen) {
      trigger();
    }
  }, [isOpen, trigger]);

  const addMaterial = () => {
    if (materialInput.trim()) {
      setValue('materials', [...materials, materialInput.trim()]);
      setMaterialInput('');
      // Re-trigger validation
      trigger('materials');
    }
  };

  const removeMaterial = (index: number) => {
    setValue('materials', materials.filter((_, i) => i !== index));
    trigger('materials');
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
      trigger('tags');
    }
  };

  const removeTag = (index: number) => {
    setValue('tags', tags.filter((_, i) => i !== index));
    trigger('tags');
  };

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

  const onSubmit = async (data: CreateExerciseFormValues) => {
    
    try {
      await createExercise.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        instructions: data.instructions,
        duration: data.duration,
        materials: data.materials,
        tags: data.tags,
        isActive: data.isActive,
        audioFile: audioFile,
        imageFile: imageFile,
        videoFile: videoFile,
      });

      // ✅ Only clear on SUCCESSFUL submission
      setAudioFile(null);
      setImageFile(null);
      setVideoFile(null);
      setMaterialInput('');
      setTagInput('');
      reset(); // Clear form only on success
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('❌ Exercise creation failed:', error);
      // Form stays filled on error
    }
  };

  const handleClose = () => {
    // ✅ Keep form data when closing (don't reset)
    // Only clear files that aren't submitted yet
    setAudioFile(null);
    setImageFile(null);
    setVideoFile(null);
    setMaterialInput('');
    setTagInput('');
    // Don't reset the form - keep user's data
    onClose();
  };

  // Check if button should be disabled
  const isButtonDisabled = !isValid || isSubmitting || isValidating || createExercise.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={t('exercises.create.title')}
      submitText={t('exercises.create.submit')}
      isLoading={createExercise.isPending}
      // ✅ FIX: Only disable when form is invalid or submitting
isSubmitDisabled={!isValid || isSubmitting || createExercise.isPending}
      size="xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
       

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.title')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="Pronunciation Practice - /r/ Sound"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.title ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={createExercise.isPending}
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
            {t('exercises.description')} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Practice the /r/ sound with these tongue twisters and exercises"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${
              errors.description ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={createExercise.isPending}
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
              {t('exercises.category')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={createExercise.isPending}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`exercises.category.${cat}`)}
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
              {t('exercises.difficulty')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('difficulty')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={createExercise.isPending}
            >
              <option value="beginner">{t('exercises.difficulty.beginner')}</option>
              <option value="intermediate">{t('exercises.difficulty.intermediate')}</option>
              <option value="advanced">{t('exercises.difficulty.advanced')}</option>
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
            {t('exercises.duration')}
          </label>
          <input
            type="number"
            {...register('duration', { valueAsNumber: true })}
            placeholder="15"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.duration ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={createExercise.isPending}
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
            {t('exercises.instructions')} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('instructions')}
            rows={4}
            placeholder="Repeat each word 5 times: red, run, rest, round, right..."
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${
              errors.instructions ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={createExercise.isPending}
          />
          {errors.instructions && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.instructions.message}
            </p>
          )}
        </div>

        {/* Materials */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.materials')}
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
              placeholder={t('exercises.create.enterMaterial')}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={createExercise.isPending}
            />
            <button
              type="button"
              onClick={addMaterial}
              disabled={!materialInput.trim() || createExercise.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.tags')}
            <span className="text-xs text-muted-foreground ml-2">
              {t('exercises.tags.hint')}
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
              placeholder={t('exercises.create.enterTag')}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={createExercise.isPending}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || createExercise.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('exercises.tags.examples')}
          </p>
        </div>

        {/* isActive Status */}
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
                disabled={createExercise.isPending}
              />
              <span className="text-sm">{t('exercises.active')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register('isActive')}
                value="false"
                className="w-4 h-4 text-primary"
                disabled={createExercise.isPending}
              />
              <span className="text-sm">{t('exercises.inactive')}</span>
            </label>
          </div>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <Music size={14} />
              {t('exercises.audio')}
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
                {t('exercises.create.uploadAudio')}
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <ImageIcon size={14} />
              {t('exercises.image')}
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
                {t('exercises.create.uploadImage')}
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <Video size={14} />
              {t('exercises.video')}
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
                {t('exercises.create.uploadVideo')}
              </button>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  );
}