// src/lib/api/exercises.ts
import { apiClient } from './client';
import type {
  Exercise,
  CreateExerciseRequest,
  CreateExerciseWithMediaRequest,
  UpdateExerciseRequest,
  ExerciseFilters,
  ExercisesResponse,
  ExerciseResponse,
  ExerciseCategoriesResponse,
  ExerciseWithMediaResponse,
} from '@/types/exercise.types';
import type { ApiResponse } from '@/types/api.types';

const EXERCISES_BASE = '/exercises';

// Get all exercises with filters
export async function getExercises(filters?: ExerciseFilters): Promise<ExercisesResponse> {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.category) params.append('category', filters.category);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.search) params.append('search', filters.search);
  // ✅ FIX: Only append isActive if it's explicitly provided
  if (filters?.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<ExercisesResponse>(`${EXERCISES_BASE}${query}`);
  return response.data;
}

// Get exercise categories
export async function getExerciseCategories(): Promise<ExerciseCategoriesResponse> {
  const response = await apiClient.get<ExerciseCategoriesResponse>(`${EXERCISES_BASE}/categories`);
  return response.data;
}

// Search exercises
export async function searchExercises(q: string, page?: number, limit?: number): Promise<ExercisesResponse> {
  const params = new URLSearchParams();
  params.append('q', q);
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<ExercisesResponse>(`${EXERCISES_BASE}/search${query}`);
  return response.data;
}

// Get exercise by ID
export async function getExerciseById(id: string): Promise<ExerciseResponse> {
  const response = await apiClient.get<ExerciseResponse>(`${EXERCISES_BASE}/${id}`);
  return response.data;
}

// Create exercise (JSON only)
export async function createExercise(data: CreateExerciseRequest): Promise<Exercise> {
  const response = await apiClient.post<Exercise>(EXERCISES_BASE, data);
  return response.data;
}

// Create exercise with media (multipart/form-data)
export async function createExerciseWithMedia(
  data: CreateExerciseWithMediaRequest
): Promise<ExerciseWithMediaResponse> {
  const formData = new FormData();
  
  // Append all text fields
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('category', data.category);
  formData.append('difficulty', data.difficulty);
  formData.append('instructions', data.instructions);
  
  if (data.duration !== undefined && data.duration !== null) {
    formData.append('duration', String(data.duration));
  }
  
  // ✅ FIX: Always send isActive, default to true if not provided
  const isActive = data.isActive !== undefined ? data.isActive : true;
  formData.append('isActive', String(isActive));
  
  // Send materials and tags as JSON strings (the backend expects arrays)
  if (data.materials && data.materials.length > 0) {
    formData.append('materials', JSON.stringify(data.materials));
  }
  
  if (data.tags && data.tags.length > 0) {
    formData.append('tags', JSON.stringify(data.tags));
  }
  
  // Append files
  const files: File[] = [];
  let audioFileIndex = -1;
  let imageFileIndex = -1;
  let videoFileIndex = -1;
  
  if (data.audioFile) {
    files.push(data.audioFile);
    audioFileIndex = files.length - 1;
  }
  
  if (data.imageFile) {
    files.push(data.imageFile);
    imageFileIndex = files.length - 1;
  }
  
  if (data.videoFile) {
    files.push(data.videoFile);
    videoFileIndex = files.length - 1;
  }
  
  // Append files array
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  // Append file indices
  if (audioFileIndex >= 0) {
    formData.append('audioFileIndex', String(audioFileIndex));
  }
  
  if (imageFileIndex >= 0) {
    formData.append('imageFileIndex', String(imageFileIndex));
  }
  
  if (videoFileIndex >= 0) {
    formData.append('videoFileIndex', String(videoFileIndex));
  }
  
  const response = await apiClient.post<ExerciseWithMediaResponse>(
    `${EXERCISES_BASE}/with-media`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

// Update exercise
export async function updateExercise(id: string, data: UpdateExerciseRequest): Promise<Exercise> {
  const response = await apiClient.put<Exercise>(`${EXERCISES_BASE}/${id}`, data);
  return response.data;
}

// Delete exercise (soft delete)
export async function deleteExercise(id: string): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(`${EXERCISES_BASE}/${id}`);
  return response.data;
}