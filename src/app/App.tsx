// src/app/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useLanguage } from '@/hooks/useLanguage';

// Layout


// Pages
import { LoginScreen } from '@/app/pages/LoginScreen';
import { RegisterScreen } from '@/app/pages/RegisterScreen';
import { ForgotPasswordScreen } from '@/app/pages/ForgotPasswordScreen';
import { VerifyOTPScreen } from '@/app/pages/VerifyOTPScreen';
import { ResetPasswordScreen } from '@/app/pages/ResetPasswordScreen';
import { OrthoDashboard } from '@/app/pages/OrthoDashboard';
import { PatientList } from '@/app/pages/PatientList';
import { PatientDetail } from '@/app/pages/PatientDetail';
import { ExerciseCreate } from '@/app/pages/ExerciseCreate';
import { OrthoProgress } from '@/app/pages/OrthoProgress';
import { ParentDashboard } from '@/app/pages/ParentDashboard';
import { ParentProgress } from '@/app/pages/ParentProgress';
import { ExercisePractice } from '@/app/pages/ExercisePractice';
import { UsersPage } from '@/app/pages/UsersPage';
import { UserDetail } from '@/app/pages/UserDetail';
import { SettingsPage } from '@/app/pages/SettingsPage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading...</p>
      </div>
    </div>
  );
}

// App Content
function AppContent() {
  const { isRTL } = useLanguage();
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: isRTL ? 'rtl:text-right' : 'ltr:text-left',
          duration: 4000,
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/verify-otp" element={<VerifyOTPScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        {/* Protected Routes */}
        <Route element={<AppLayout />}>
          {/* Orthophoniste Routes */}
          <Route
            path="/ortho-dashboard"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <OrthoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <PatientList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-detail/:id"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <PatientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <UserDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercise-create"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <ExerciseCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ortho-progress"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste']}>
                <OrthoProgress />
              </ProtectedRoute>
            }
          />

          {/* Parent Routes */}
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-progress"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercise-practice/:id"
            element={
              <ProtectedRoute allowedRoles={['parent', 'orthophoniste']}>
                <ExercisePractice />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['orthophoniste', 'parent']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

// Root App
export default function App() {
  return (
    <BrowserRouter>
      <QueryProvider>
        <I18nProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </I18nProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}