// src/app/components/parent/AppointmentCreateModal.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/app/components/ui/FormModal';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle } from 'lucide-react';
import { AppointmentType } from '@/types/appointment.types';

interface AppointmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const createAppointmentSchema = z.object({
  dateTime: z.string().min(1, 'Date and time are required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  type: z.enum([
    'initial-assessment',
    'follow-up',
    'therapy-session',
    'progress-review',
    'other',
  ]),
  notes: z.string().optional(),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  meetingLink: z.string().optional(),
});

type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

export function AppointmentCreateModal({ isOpen, onClose, onSuccess }: AppointmentCreateModalProps) {
  const { t } = useTranslation();
  const { data: dashboard } = useParentDashboard();
  const createAppointment = useCreateAppointment();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    mode: 'onChange',
    defaultValues: {
      dateTime: '',
      duration: 30,
      type: 'therapy-session',
      notes: '',
      location: '',
      isVirtual: false,
      meetingLink: '',
    },
  });

  const isVirtual = watch('isVirtual');

  const onSubmit = async (data: CreateAppointmentFormValues) => {
    if (!dashboard?.child.id) return;

    await createAppointment.mutateAsync({
      patientId: dashboard.child.id,
      dateTime: data.dateTime,
      duration: data.duration,
      type: data.type,
      notes: data.notes || undefined,
      location: data.location || undefined,
      isVirtual: data.isVirtual,
      meetingLink: data.meetingLink || undefined,
    });

    reset();
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
      title={t('appointments.createTitle', 'Schedule Appointment')}
      submitText={t('appointments.createSubmit', 'Schedule')}
      isLoading={createAppointment.isPending}
      isSubmitDisabled={!isValid || !isDirty || createAppointment.isPending}
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
            disabled={createAppointment.isPending}
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
            disabled={createAppointment.isPending}
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
            disabled={createAppointment.isPending}
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
            {t('appointments.location', 'Location')}
          </label>
          <input
            type="text"
            {...register('location')}
            placeholder="Clinic Room 101"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={createAppointment.isPending}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...register('isVirtual')}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
              disabled={createAppointment.isPending}
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
              disabled={createAppointment.isPending}
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
            disabled={createAppointment.isPending}
          />
        </div>
      </div>
    </FormModal>
  );
}