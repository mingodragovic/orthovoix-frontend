// src/app/pages/ParentHome.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { useUnreadCount } from '@/hooks/useNotifications';
import { ChildHeader } from '../../components/parent/ChildHeader';
import { StatCard } from '../../components/parent/StatCard';
import { ExerciseCard } from '../../components/parent/ExerciseCard';
import { AppointmentCard } from '../../components/parent/AppointmentCard';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Bell
} from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';

export function ParentHome() {
   const { user } = useAuth();
  const isParent = user?.role === 'parent';

  const navigate = useNavigate();
  const { t } = useTranslation();
const { data: dashboard, isLoading, error } = useParentDashboard({
    enabled: isParent,
  });  const { data: unreadCount } = useUnreadCount();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <p className="text-red-500">{t('common.error')}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary hover:underline"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  const { child, stats, progressTrend, recentExercises, upcomingAppointments, recentNotifications } = dashboard;

  return (
<div className="space-y-6 pb-20 mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('parent.dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('parent.dashboard.subtitle', 'Welcome back!')}
          </p>
        </div>
        <button
          onClick={() => navigate('/parent/notifications')}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Child Info */}
      <ChildHeader
        firstName={child.firstName}
        lastName={child.lastName}
        age={child.age}
        status={child.status}
        avatar={child.avatar}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t('parent.dashboard.stats.totalExercises', 'Total Exercises')}
          value={stats.totalExercises}
          icon={BookOpen}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          label={t('parent.dashboard.stats.completed', 'Completed')}
          value={stats.completedExercises}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          label={t('parent.dashboard.stats.inProgress', 'In Progress')}
          value={stats.inProgressExercises}
          icon={Clock}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label={t('parent.dashboard.stats.overdue', 'Overdue')}
          value={stats.overdueExercises}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs text-gray-500">{t('parent.dashboard.stats.completionRate', 'Completion Rate')}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.completionRate}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-primary" />
            <span className="text-xs text-gray-500">{t('parent.dashboard.stats.upcomingAppointments', 'Upcoming Appointments')}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
        </div>
      </div>

      {/* Recent Exercises */}
      {recentExercises.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">
              {t('parent.dashboard.recentExercises', 'Recent Exercises')}
            </h2>
            <button
              onClick={() => navigate('/parent/exercises')}
              className="text-xs text-primary hover:underline"
            >
              {t('common.viewAll', 'View all')}
            </button>
          </div>
          <div className="space-y-2">
            {recentExercises.slice(0, 3).map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                id={exercise.id}
                title={exercise.title}
                status={exercise.status}
                score={exercise.score}
                dueDate={exercise.dueDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">
              {t('parent.dashboard.upcomingAppointments', 'Upcoming Appointments')}
            </h2>
            <button
              onClick={() => navigate('/parent/appointments')}
              className="text-xs text-primary hover:underline"
            >
              {t('common.viewAll', 'View all')}
            </button>
          </div>
          <div className="space-y-2">
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                id={appointment.id}
                dateTime={appointment.dateTime}
                location={appointment.location}
                isVirtual={appointment.isVirtual}
                type={appointment.type}
                status="scheduled"
                orthophonisteName=""
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}