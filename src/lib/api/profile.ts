// src/lib/api/profile.ts
import { apiClient } from './client';
import { tokenManager } from '@/utils/tokenManager';
import type {
  Profile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UploadAvatarResponse,
  ProfileResponse,
  PasswordChangeResponse,
} from '@/types/profile.types';

const PROFILE_BASE = '/profile';
const STORAGE_BASE = '/storage';

// Get current user profile
export async function getProfile(): Promise<Profile> {
  const response = await apiClient.get<Profile>(`${PROFILE_BASE}`);
  return response.data;
}

// Update profile
export async function updateProfile(data: UpdateProfileRequest): Promise<Profile> {
  const response = await apiClient.put<Profile>(`${PROFILE_BASE}`, data);
  return response.data;
}

// Change password
export async function changePassword(data: ChangePasswordRequest): Promise<PasswordChangeResponse> {
  const response = await apiClient.patch<PasswordChangeResponse>(`${PROFILE_BASE}/password`, data);
  return response.data;
}

// Validate file before upload
export function validateAvatarFile(file: File): boolean {
  // Check if file exists
  if (!file || !(file instanceof File)) {
    throw new Error('No file selected');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.');
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit.');
  }
  
  return true;
}

// Upload avatar - Using fetch directly to avoid Axios multipart issues
export async function uploadAvatar(file: File, userId: string): Promise<UploadAvatarResponse> {
  try {
    // Validate file first
    validateAvatarFile(file);
    
    // ✅ CORRECT: FormData with field name 'file'
    const formData = new FormData();
    formData.append('file', file); // ← MUST be 'file'
    
    // ✅ CORRECT: folder parameter without trailing slash
    const folder = `avatars/${userId}`;
    const url = `${import.meta.env.VITE_API_URL}${STORAGE_BASE}/upload?folder=${folder}`;
    
    // Get token
    const token = tokenManager.getAccessToken();
    
    console.log('📤 Uploading to:', url);
    console.log('📤 File:', file.name, file.type, file.size);
    console.log('📤 FormData entries:', [...formData.entries()]);
    
    // Use fetch directly - this is more reliable for multipart/form-data
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // DO NOT set Content-Type - let the browser set it with boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Upload failed:', errorData);
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Upload response:', data);
    return data;
  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    throw error;
  }
}

// Remove avatar
export async function removeAvatar(): Promise<Profile> {
  const response = await apiClient.delete<Profile>(`${PROFILE_BASE}/avatar`);
  return response.data;
}