// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
  validateAvatarFile,
} from '@/lib/api/profile';
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile.types';
import { tokenManager } from '@/utils/tokenManager';

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// === QUERIES ===

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: tokenManager.hasValidSession(),
  });
}

// === MUTATIONS ===

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      success(t('profile.update.success', 'Profile updated successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('profile.update.error', 'Failed to update profile');
      error(message);
    },
  });
}

export function useChangePassword() {
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: () => {
      success(t('profile.password.success', 'Password changed successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('profile.password.error', 'Failed to change password');
      error(message);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { success, error, loading } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      console.log('📤 Starting avatar upload with file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        userId: userId
      });
      
      // Validate file first
      validateAvatarFile(file);
      
      // Step 1: Upload file to storage
      console.log('📤 Uploading file to storage...');
      const uploadResult = await uploadAvatar(file, userId);
      console.log('✅ File uploaded:', uploadResult);
      
      // ✅ FIX: UploadAvatarResponse is already the data object, not wrapped
      const avatarUrl = uploadResult.url;
      console.log('📤 Updating profile with avatar URL:', avatarUrl);
      
      // Get current profile data
      const currentProfile = queryClient.getQueryData<any>(profileKeys.detail());
      
      // Update profile with the new avatar URL
      const updateData: UpdateProfileRequest = {
        avatar: avatarUrl,
      };
      
      // If we have current profile data, preserve other fields
      if (currentProfile) {
        updateData.name = currentProfile.name;
        updateData.email = currentProfile.email;
        if (currentProfile.role === 'orthophoniste') {
          updateData.specialization = currentProfile.specialization;
          updateData.licenseNumber = currentProfile.licenseNumber;
        } else if (currentProfile.role === 'parent') {
          updateData.childName = currentProfile.childName;
        }
      }
      
      // Update profile
      console.log('📤 Updating profile...');
      const updatedProfile = await updateProfile(updateData);
      console.log('✅ Profile updated:', updatedProfile);
      
      return {
        uploadResult,
        updatedProfile,
      };
    },
    onMutate: () => {
      return loading(t('profile.avatar.uploading', 'Uploading avatar...'));
    },
    onSuccess: (result) => {
      toast.dismiss();
      
      // Update cache with the updated profile
      queryClient.setQueryData(profileKeys.detail(), result.updatedProfile);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      
      success(t('profile.avatar.success', 'Avatar uploaded successfully'));
    },
    onError: (err: any) => {
      toast.dismiss();
      console.error('❌ Avatar upload error:', err);
      
      // Handle validation errors
      if (err.message) {
        error(err.message);
      } else {
        const message = err.response?.data?.message || t('profile.avatar.error', 'Failed to upload avatar');
        error(message);
      }
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: removeAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      success(t('profile.avatar.remove.success', 'Avatar removed successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('profile.avatar.remove.error', 'Failed to remove avatar');
      error(message);
    },
  });
}