// src/app/pages/ParentAppointmentDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppointment } from '@/hooks/useAppointments';
import { ArrowLeft, Calendar, Clock, MapPin, Video, User, FileText } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function ParentAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: appointment, isLoading, error } = useAppointment(id!);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !appointment) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => navigate('/parent/appointments')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/parent/appointments')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {t('parent.appointmentDetail.title', 'Appointment Details')}
          </h1>
          <p className="text-sm text-gray-500">
            {t(`appointments.type.${appointment.type}`)}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className={`p-3 rounded-xl border ${
        appointment.status === 'scheduled' ? 'bg-blue-50 border-blue-200' :
        appointment.status === 'completed' ? 'bg-green-50 border-green-200' :
        appointment.status === 'cancelled' ? 'bg-red-50 border-red-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <span className="text-sm font-medium">
          {t(`appointments.status.${appointment.status}`)}
        </span>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">{t('appointments.date', 'Date')}</p>
            <p className="text-sm font-medium">{formatDate(appointment.dateTime)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={18} className="text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">{t('appointments.time', 'Time')}</p>
            <p className="text-sm font-medium">{formatTime(appointment.dateTime)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User size={18} className="text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">{t('appointments.orthophoniste', 'Orthophoniste')}</p>
            <p className="text-sm font-medium">{appointment.orthophonisteName}</p>
          </div>
        </div>

        {appointment.isVirtual ? (
          <div className="flex items-start gap-3">
            <Video size={18} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t('appointments.virtual', 'Virtual')}</p>
              <p className="text-sm font-medium">{t('appointments.virtualMeeting', 'Virtual Meeting')}</p>
              {appointment.meetingLink && (
                <a
                  href={appointment.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {t('appointments.joinMeeting', 'Join Meeting')}
                </a>
              )}
            </div>
          </div>
        ) : appointment.location ? (
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t('appointments.location', 'Location')}</p>
              <p className="text-sm font-medium">{appointment.location}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <FileText size={18} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t('appointments.notes', 'Notes')}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}