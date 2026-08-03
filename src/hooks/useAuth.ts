// src/hooks/useAuth.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { tokenManager } from '@/utils/tokenManager';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  login,
  register,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from '@/lib/api/auth';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyOTPRequest,
  ResetPasswordRequest,
} from '@/types/auth.types';
import { toast } from 'sonner';
export const authKeys = {
  user: ['auth', 'user'] as const,
};

// === LOGIN ===
export function useLogin() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const { refetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data!;

      // Store tokens
      tokenManager.setAccessToken(accessToken);
      tokenManager.setRefreshToken(refreshToken);
      tokenManager.setUser(user);

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      refetch();

      success(t('auth.login.success', { name: user.name }));

      const role = user.role;
      if (role === 'orthophoniste') {
        navigate('/ortho-dashboard');
      } else {
        navigate('/parent-dashboard');
      }
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('auth.login.error');
      error(message);
    },
  });
}

// === LOGOUT ===
export function useLogout() {
  const navigate = useNavigate();
  const { success } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      tokenManager.clearAll();
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      success(t('auth.logout.success'));
      navigate('/login');
    },
    onError: () => {
      tokenManager.clearAll();
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      navigate('/login');
    },
  });
}

// === REGISTER ===
export function useRegister() {
  const navigate = useNavigate();
  const { success, error, loading } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onMutate: () => loading(t('auth.register.loading')),
    onSuccess: () => {
      toast.dismiss();
      success(t('auth.register.success'));
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (err: any) => {
      toast.dismiss();
      let message = err.response?.data?.message || t('auth.register.error');
      if (err.response?.status === 409) {
        message = t('auth.register.emailExists');
      }
      error(message);
    },
  });
}

// === FORGOT PASSWORD ===
export function useForgotPassword() {
  const navigate = useNavigate();
  const { success, error, loading } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => forgotPassword(data),
    onMutate: () => loading(t('auth.forgotPassword.loading')),
    onSuccess: () => {
      toast.dismiss();
      success(t('auth.forgotPassword.success'));
      setTimeout(() => navigate('/verify-otp'), 2000);
    },
    onError: (err: any) => {
      toast.dismiss();
      let message = err.response?.data?.message || t('auth.forgotPassword.error');
      if (err.response?.status === 404) {
        message = t('auth.forgotPassword.emailNotFound');
      }
      error(message);
    },
  });
}

// === VERIFY OTP ===
export function useVerifyOTP() {
  const navigate = useNavigate();
  const { success, error, loading } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => verifyOTP(data),
    onMutate: () => loading(t('auth.verifyOTP.loading')),
    onSuccess: () => {
      toast.dismiss();
      success(t('auth.verifyOTP.success'));
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (err: any) => {
      toast.dismiss();
      let message = err.response?.data?.message || t('auth.verifyOTP.error');
      if (err.response?.status === 400) {
        message = t('auth.verifyOTP.invalidOTP');
      }
      error(message);
    },
  });
}

// === RESET PASSWORD ===
export function useResetPassword() {
  const navigate = useNavigate();
  const { success, error, loading } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => resetPassword(data),
    onMutate: () => loading(t('auth.resetPassword.loading')),
    onSuccess: () => {
      toast.dismiss();
      success(t('auth.resetPassword.success'));
      setTimeout(() => navigate('/login'), 2000);
    },
    onError: (err: any) => {
      toast.dismiss();
      let message = err.response?.data?.message || t('auth.resetPassword.error');
      if (err.response?.status === 401) {
        message = t('auth.resetPassword.invalidToken');
      }
      error(message);
    },
  });
}