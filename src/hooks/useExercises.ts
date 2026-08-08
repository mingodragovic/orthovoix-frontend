// src/hooks/useExercises.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getExercises,
  getExerciseCategories,
  searchExercises,
  getExerciseById,
  createExercise,
  createExerciseWithMedia,
  updateExercise,
  deleteExercise,
} from '@/lib/api/exercises';
import type {
  ExerciseFilters,
  CreateExerciseRequest,
  CreateExerciseWithMediaRequest,
  UpdateExerciseRequest,
} from '@/types/exercise.types';
import { useRef } from 'react';

export const exerciseKeys = {
  all: ['exercises'] as const,
  lists: () => [...exerciseKeys.all, 'list'] as const,
  list: (filters?: ExerciseFilters) => [...exerciseKeys.lists(), filters] as const,
  categories: () => [...exerciseKeys.all, 'categories'] as const,
  search: (q: string) => [...exerciseKeys.all, 'search', q] as const,
  details: () => [...exerciseKeys.all, 'detail'] as const,
  detail: (id: string) => [...exerciseKeys.details(), id] as const,
};

// === QUERIES ===

export function useExercises(filters?: ExerciseFilters) {
  return useQuery({
    queryKey: exerciseKeys.list(filters),
    queryFn: () => getExercises(filters),
    staleTime: 0, // Always refetch
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useExerciseCategories() {
  return useQuery({
    queryKey: exerciseKeys.categories(),
    queryFn: getExerciseCategories,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - categories don't change often
  });
}

export function useSearchExercises(q: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: exerciseKeys.search(q),
    queryFn: () => searchExercises(q, page, limit),
    enabled: q.length > 0,
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => getExerciseById(id),
    enabled: !!id,
  });
}

// === MUTATIONS ===

export function useCreateExercise() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateExerciseRequest) => createExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      success(t('exercises.create.success', '✅ Exercise created successfully!'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('exercises.create.error', '❌ Failed to create exercise');
      error(message);
    },
  });
}

export function useCreateExerciseWithMedia() {
  const queryClient = useQueryClient();
  const { success, error } = useToast(); // ✅ FIX: Don't destructure loading
  const { t } = useTranslation();
  const toastIdRef = useRef<string | number | undefined>(undefined);

  return useMutation({
    mutationFn: (data: CreateExerciseWithMediaRequest) => createExerciseWithMedia(data),
    onMutate: () => {
      // ✅ FIX: Use toast directly from sonner and store the ID
      toastIdRef.current = toast.loading(t('exercises.create.loading', 'Creating exercise...'));
      return toastIdRef.current;
    },
    onSuccess: () => {
      // ✅ FIX: Dismiss loading toast first
      if (toastIdRef.current !== undefined) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = undefined;
      }
      
      // Show success toast
      success(t('exercises.create.success', '✅ Exercise created successfully!'), {
        duration: 3000,
        position: 'top-center',
      });
      
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
    },
    onError: (err: any) => {
      // ✅ FIX: Dismiss loading toast on error
      if (toastIdRef.current !== undefined) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = undefined;
      }
      
      const message = err.response?.data?.message || t('exercises.create.error', '❌ Failed to create exercise');
      error(message, {
        duration: 4000,
        position: 'top-center',
      });
    },
  });
}

export function useUpdateExercise(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateExerciseRequest) => updateExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(id) });
      success(t('exercises.update.success', '✅ Exercise updated successfully!'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('exercises.update.error', '❌ Failed to update exercise');
      error(message);
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      success(t('exercises.delete.success', '✅ Exercise deleted successfully!'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('exercises.delete.error', '❌ Failed to delete exercise');
      error(message);
    },
  });
}