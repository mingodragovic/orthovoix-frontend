// src/app/pages/AdminAppointmentDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useAppointment } from '@/hooks/useAppointments';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';

export function AdminAppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const { data: appointment, isLoading, error } = useAppointment(id!);

  const getLocale = () => {
    switch(language) {
      case 'ar': return arSA;
      case 'en': return enUS;
      default: return fr;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no-show': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'no-show': return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  if (error || !appointment) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => navigate('/appointments')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      <Breadcrumb 
        showBack={true} 
        showHome={true}
        items={[
          { label: t('sidebar.appointments'), path: '/appointments' },
          { label: appointment.patientName, path: `/appointments/${appointment.id}` }
        ]}
      />

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/appointments')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('appointments.detailTitle', 'Appointment Details')}
          </h1>
          <p className="text-sm text-gray-500">{appointment.patientName}</p>
        </div>
      </div>

      <div className={`p-3 rounded-xl border ${getStatusColor(appointment.status)}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(appointment.status)}
          <span className="text-sm font-medium">{t(`appointments.status.${appointment.status}`)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">{t('appointments.date')}</p>
            <p className="text-sm font-medium">{formatDate(appointment.dateTime)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">{t('appointments.time')}</p>
            <p className="text-sm font-medium">{formatDate(appointment.dateTime)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">{t('appointments.patient')}</p>
            <p className="text-sm font-medium">{appointment.patientName}</p>
          </div>
        </div>

        {appointment.isVirtual ? (
          <div className="flex items-start gap-3">
            <Video className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t('appointments.virtual')}</p>
              <p className="text-sm font-medium">{t('appointments.virtualMeeting')}</p>
              {appointment.meetingLink && (
                <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {t('appointments.joinMeeting')}
                </a>
              )}
            </div>
          </div>
        ) : appointment.location ? (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t('appointments.location')}</p>
              <p className="text-sm font-medium">{appointment.location}</p>
            </div>
          </div>
        ) : null}

        {appointment.notes && (
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">{t('appointments.notes')}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          </div>
        )}
      </div>

      {appointment.sessionNotes && appointment.sessionNotes.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">{t('appointments.sessionNotes', 'Session Notes')}</h2>
          {appointment.sessionNotes.map((note, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatDate(note.date)}</span>
                {note.duration && <span>• {note.duration} min</span>}
              </div>
              <p className="text-sm text-gray-700 mt-1">{note.notes}</p>
              {note.topics && note.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.topics.map((topic, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}