// src/types/exercise.types.ts
export type ExerciseCategory =
  | 'pronunciation'
  | 'vocabulary'
  | 'grammar'
  | 'comprehension'
  | 'fluency'
  | 'articulation'
  | 'phonology'
  | 'language'
  | 'social_communication'
  | 'other';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  instructions: string;
  materials?: string[];
  duration?: number;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  audioKey?: string;
  videoKey?: string;
  imageKey?: string;
  tags?: string[];
  isActive: boolean;
  createdBy: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseRequest {
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  instructions: string;
  materials?: string[];
  duration?: number;
  tags?: string[];
  isActive?: boolean;
}

export interface CreateExerciseWithMediaRequest extends CreateExerciseRequest {
  audioFile?: File | null;
  imageFile?: File | null;
  videoFile?: File | null;
}

export interface UpdateExerciseRequest {
  title?: string;
  description?: string;
  category?: ExerciseCategory;
  difficulty?: ExerciseDifficulty;
  instructions?: string;
  materials?: string[];
  duration?: number;
  tags?: string[];
  isActive?: boolean;
}

export interface ExerciseFilters {
  page?: number;
  limit?: number;
  category?: ExerciseCategory;
  difficulty?: ExerciseDifficulty;
  search?: string;
  isActive?: boolean;
}

export interface ExercisesResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    items: Exercise[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ExerciseResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: Exercise;
}

export interface ExerciseCategoriesResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    categories: ExerciseCategory[];
  };
}

export interface ExerciseWithMediaResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    exercise: Exercise;
    files: {
      audio: 'Uploaded' | 'Not provided';
      image: 'Uploaded' | 'Not provided';
      video: 'Uploaded' | 'Not provided';
    };
  };
}