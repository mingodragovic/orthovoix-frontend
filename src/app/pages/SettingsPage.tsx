// src/app/pages/SettingsPage.tsx
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Trash2, 
  Save, 
  AlertCircle,
  Shield,
  Briefcase,
  UserCircle,
  UploadCloud,
  Settings
} from 'lucide-react';
import { useProfile, useUpdateProfile, useChangePassword, useUploadAvatar, useRemoveAvatar } from '@/hooks/useProfile';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/useToast';
import { Role } from '@/types/api.types';
import { useAuth } from '@/providers/AuthProvider';
import { validateAvatarFile } from '@/lib/api/profile';
import { Breadcrumb } from '../components/ui/breadcrumb';

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  childName: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
const showToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profile, isLoading, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      specialization: '',
      licenseNumber: '',
      childName: '',
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Load profile data when it changes
  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name || '',
        email: profile.email || '',
        specialization: profile.specialization || '',
        licenseNumber: profile.licenseNumber || '',
        childName: profile.childName || '',
      });
    }
  }, [profile, resetProfile]);

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    const updateData: any = {
      name: data.name,
      email: data.email,
    };

    if (profile?.role === 'orthophoniste') {
      updateData.specialization = data.specialization || null;
      updateData.licenseNumber = data.licenseNumber || null;
    } else if (profile?.role === 'parent') {
      updateData.childName = data.childName || null;
    }

    await updateProfile.mutateAsync(updateData);
    setIsEditing(false);
  };

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    await changePassword.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    resetPassword();
  };
const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  console.log('📁 File input changed, files:', files);
  
  if (files && files.length > 0) {
    const file = files[0];
    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      isFile: file instanceof File,
      constructor: file.constructor.name,
      toString: file.toString()
    });
    
    try {
      // Validate the file
      validateAvatarFile(file);
      
      // If valid, proceed with preview
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showToast.error(error.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  } else {
    console.warn('No file selected');
  }
};

// Update the upload handler with more logging
const handleUploadAvatar = async () => {
  if (!selectedFile) {
    showToast.error('Please select a file first');
    return;
  }
  
  if (!user?.id) {
    showToast.error('User ID not found');
    return;
  }
  
  console.log('🚀 Starting upload process with file:', {
    name: selectedFile.name,
    type: selectedFile.type,
    size: selectedFile.size,
    userId: user.id
  });
  
  try {
    // The hook handles both steps
    await uploadAvatar.mutateAsync({
      file: selectedFile,
      userId: user.id,
    });
    
    // Clear the file input and preview
    setSelectedFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Force refetch the profile to update the UI
    refetch();
  } catch (error) {
    console.error('Avatar upload failed:', error);
  }
};
  const handleRemoveAvatar = async () => {
    if (window.confirm(t('settings.avatar.remove.confirm', 'Are you sure you want to remove your avatar?'))) {
      await removeAvatar.mutateAsync();
    }
  };

  const getRoleLabel = (role: Role) => {
    switch(role) {
      case 'orthophoniste': return t('auth.login.role.orthophoniste', {});
      case 'parent': return t('auth.login.role.parent', {});
      default: return role;
    }
  };

  const getRoleIcon = (role: Role) => {
    switch(role) {
      case 'orthophoniste': return <Briefcase className="w-5 h-5" />;
      case 'parent': return <UserCircle className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', {})}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-red-500">{t('common.error', {})}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-primary hover:underline"
          >
            {t('common.retry', {})}
          </button>
        </div>
      </div>
    );
  }

const currentAvatar = avatarPreview || profile?.avatar || user?.avatar || null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb showBack={true} showHome={true} />

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t('settings.title', 'Settings')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle', 'Manage your account settings and preferences')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
  {user?.avatar ? (
    <img 
      src={user.avatar} 
      alt={user.name}
      className="w-full h-full rounded-full object-cover"
    />
  ) : (
    user?.name?.charAt(0)?.toUpperCase() || 'U'
  )}
</div>

<div className="relative">

 
</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profile.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
              </div>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-gray-50'
                }`}
              >
                <User size={18} />
                {t('settings.tabs.profile', 'Profile')}
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-gray-50'
                }`}
              >
                <Lock size={18} />
                {t('settings.tabs.password', 'Password')}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-gray-50'
                }`}
              >
                <Shield size={18} />
                {t('settings.tabs.security', 'Security')}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {t('settings.profile.title', 'Profile Information')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.profile.subtitle', 'Update your personal information')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            // Reset to original values
                            if (profile) {
                              resetProfile({
                                name: profile.name || '',
                                email: profile.email || '',
                                specialization: profile.specialization || '',
                                licenseNumber: profile.licenseNumber || '',
                                childName: profile.childName || '',
                              });
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 transition-colors"
                        >
                          {t('common.cancel', {})}
                        </button>
                        <button
                          form="profileForm"
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                        >
                          {t('common.save', {})}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                      >
                        {t('common.edit', {})}
                      </button>
                    )}
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-6">
                <div className="relative">
  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold overflow-hidden">
    {currentAvatar ? (
      <img 
        src={currentAvatar} 
        alt={profile.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback if image fails to load
          (e.target as HTMLImageElement).style.display = 'none';
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            parent.innerHTML = profile.name?.charAt(0)?.toUpperCase() || 'U';
          }
        }}
      />
    ) : (
      profile.name?.charAt(0)?.toUpperCase() || 'U'
    )}
  </div>
  {isEditing && (
    <div className="absolute -bottom-2 -right-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
        title={t('settings.avatar.upload', 'Upload avatar')}
      >
        <Camera size={16} className="text-gray-600" />
      </button>
    </div>
  )}
</div>
                    <div>
                      <p className="text-sm font-medium">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
                          {getRoleLabel(profile.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Avatar Actions */}
                  {isEditing && selectedFile && (
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={handleUploadAvatar}
                        disabled={uploadAvatar.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {uploadAvatar.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t('common.loading', {})}
                          </>
                        ) : (
                          <>
                            <UploadCloud size={16} />
                            {t('settings.avatar.upload', 'Upload')}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setAvatarPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {t('common.cancel', {})}
                      </button>
                    </div>
                  )}

                  {!isEditing && profile.avatar && (
                    <div className="mt-4">
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={removeAvatar.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        {t('settings.avatar.remove', 'Remove avatar')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Form */}
                <form id="profileForm" onSubmit={handleSubmitProfile(handleProfileSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        {t('settings.profile.name', 'Full Name')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...registerProfile('name')}
                        disabled={!isEditing || updateProfile.isPending}
                        className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                          profileErrors.name ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                        } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                      {profileErrors.name && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={14} /> {profileErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        {t('settings.profile.email', 'Email Address')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        {...registerProfile('email')}
                        disabled={!isEditing || updateProfile.isPending}
                        className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                          profileErrors.email ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                        } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                      />
                      {profileErrors.email && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle size={14} /> {profileErrors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Role-specific fields */}
                    {profile.role === 'orthophoniste' && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            {t('settings.profile.specialization', 'Specialization')}
                          </label>
                          <input
                            type="text"
                            {...registerProfile('specialization')}
                            disabled={!isEditing || updateProfile.isPending}
                            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                              profileErrors.specialization ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                            } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                            {t('settings.profile.licenseNumber', 'License Number')}
                          </label>
                          <input
                            type="text"
                            {...registerProfile('licenseNumber')}
                            disabled={!isEditing || updateProfile.isPending}
                            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                              profileErrors.licenseNumber ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                            } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                          />
                        </div>
                      </>
                    )}

                    {profile.role === 'parent' && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          {t('settings.profile.childName', 'Child Name')}
                        </label>
                        <input
                          type="text"
                          {...registerProfile('childName')}
                          disabled={!isEditing || updateProfile.isPending}
                          className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                            profileErrors.childName ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                          } ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        />
                      </div>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {t('settings.password.title', 'Change Password')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.password.subtitle', 'Update your password to keep your account secure')}
                  </p>
                </div>

                <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className="space-y-4 max-w-md">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {t('settings.password.current', 'Current Password')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword')}
                      placeholder="••••••••"
                      disabled={changePassword.isPending}
                      className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        passwordErrors.currentPassword ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                      }`}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {t('settings.password.new', 'New Password')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword')}
                      placeholder="••••••••"
                      disabled={changePassword.isPending}
                      className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        passwordErrors.newPassword ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                      }`}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {t('settings.password.confirm', 'Confirm Password')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword')}
                      placeholder="••••••••"
                      disabled={changePassword.isPending}
                      className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        passwordErrors.confirmPassword ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
                      }`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={14} /> {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={changePassword.isPending}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {changePassword.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('common.loading', {})}
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {t('settings.password.update', 'Update Password')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {t('settings.security.title', 'Security')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.security.subtitle', 'Manage your account security settings')}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Account Information */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium mb-3">
                      {t('settings.security.accountInfo', 'Account Information')}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('settings.security.role', 'Role')}</span>
                        <span className="text-sm font-medium">{getRoleLabel(profile.role)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('settings.security.status', 'Status')}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          profile.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {profile.isActive ? t('users.active', {}) : t('users.inactive', {})}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('settings.security.memberSince', 'Member Since')}</span>
                        <span className="text-sm">{new Date(profile.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{t('settings.security.lastLogin', 'Last Login')}</span>
                        <span className="text-sm">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Session Management */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium mb-3">
                      {t('settings.security.session', 'Session Management')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('settings.security.sessionDescription', 'Manage your active sessions across devices')}
                    </p>
                    <button
                      className="text-primary text-sm hover:underline"
                      onClick={() => showToast.info(t('settings.security.logoutAll', 'Logging out from all devices...'))}
                    >
                      {t('settings.security.logoutAllDevices', 'Logout from all devices')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}