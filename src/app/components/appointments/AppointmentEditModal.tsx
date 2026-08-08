// src/app/components/appointments/AppointmentEditModal.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/app/components/ui/FormModal';
import { useUpdateAppointment } from '@/hooks/useAppointments';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle } from 'lucide-react';
import { Appointment, AppointmentType, AppointmentStatus } from '@/types/appointment.types';

interface AppointmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess?: () => void;
}

const editAppointmentSchema = z.object({
  dateTime: z.string().min(1, 'Date and time are required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  type: z.enum([
    'initial-assessment',
    'follow-up',
    'therapy-session',
    'progress-review',
    'other',
  ]),
  status: z.enum([
    'scheduled',
    'in-progress',
    'completed',
    'cancelled',
    'no-show',
  ]),
  notes: z.string().optional(),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  meetingLink: z.string().optional(),
  cancellationReason: z.string().optional(),
});

type EditAppointmentFormValues = z.infer<typeof editAppointmentSchema>;

export function AppointmentEditModal({ isOpen, onClose, appointment, onSuccess }: AppointmentEditModalProps) {
  const { t } = useTranslation();
  const updateAppointment = useUpdateAppointment(appointment.id);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<EditAppointmentFormValues>({
    resolver: zodResolver(editAppointmentSchema),
    mode: 'onChange',
    defaultValues: {
      dateTime: '',
      duration: 30,
      type: 'therapy-session',
      status: 'scheduled',
      notes: '',
      location: '',
      isVirtual: false,
      meetingLink: '',
      cancellationReason: '',
    },
  });

  const isVirtual = watch('isVirtual');

  useEffect(() => {
    if (appointment) {
      reset({
        dateTime: appointment.dateTime.slice(0, 16),
        duration: appointment.duration,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes || '',
        location: appointment.location || '',
        isVirtual: appointment.isVirtual || false,
        meetingLink: appointment.meetingLink || '',
        cancellationReason: appointment.cancellationReason || '',
      });
    }
  }, [appointment, reset]);

  const onSubmit = async (data: EditAppointmentFormValues) => {
    await updateAppointment.mutateAsync({
      dateTime: data.dateTime,
      duration: data.duration,
      type: data.type,
      status: data.status,
      notes: data.notes || undefined,
      location: data.location || undefined,
      isVirtual: data.isVirtual,
      meetingLink: data.meetingLink || undefined,
      cancellationReason: data.cancellationReason || undefined,
    });

    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={t('appointments.editTitle', 'Edit Appointment')}
      submitText={t('appointments.editSubmit', 'Update Appointment')}
      isLoading={updateAppointment.isPending}
      isSubmitDisabled={!isValid || !isDirty || updateAppointment.isPending}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.dateTime', 'Date & Time')} <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('dateTime')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.dateTime ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateAppointment.isPending}
          />
          {errors.dateTime && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.dateTime.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.duration', 'Duration (minutes)')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register('duration', { valueAsNumber: true })}
            placeholder="30"
            min="15"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.duration ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateAppointment.isPending}
          />
          {errors.duration && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.duration.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.type', 'Type')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('type')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.type ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateAppointment.isPending}
          >
            <option value="initial-assessment">{t('appointments.type.initial-assessment')}</option>
            <option value="follow-up">{t('appointments.type.follow-up')}</option>
            <option value="therapy-session">{t('appointments.type.therapy-session')}</option>
            <option value="progress-review">{t('appointments.type.progress-review')}</option>
            <option value="other">{t('appointments.type.other')}</option>
          </select>
          {errors.type && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.type.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.status', 'Status')} <span className="text-red-500">*</span>
          </label>
          <select
            {...register('status')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.status ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateAppointment.isPending}
          >
            <option value="scheduled">{t('appointments.status.scheduled')}</option>
            <option value="in-progress">{t('appointments.status.in-progress')}</option>
            <option value="completed">{t('appointments.status.completed')}</option>
            <option value="cancelled">{t('appointments.status.cancelled')}</option>
            <option value="no-show">{t('appointments.status.no-show')}</option>
          </select>
          {errors.status && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.status.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.location', 'Location')}
          </label>
          <input
            type="text"
            {...register('location')}
            placeholder="Clinic Room 101"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={updateAppointment.isPending}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...register('isVirtual')}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
              disabled={updateAppointment.isPending}
            />
            {t('appointments.virtual', 'Virtual Meeting')}
          </label>
        </div>

        {isVirtual && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('appointments.meetingLink', 'Meeting Link')}
            </label>
            <input
              type="url"
              {...register('meetingLink')}
              placeholder="https://meet.google.com/..."
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateAppointment.isPending}
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('appointments.notes', 'Notes')}
          </label>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Any special instructions..."
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            disabled={updateAppointment.isPending}
          />
        </div>
      </div>
    </FormModal>
  );
}