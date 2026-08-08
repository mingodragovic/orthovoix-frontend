// src/app/pages/ExercisePractice.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useExercise } from '@/hooks/useExercises';
import { usePatientExercises } from '@/hooks/usePatientExercises';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import {
  useUploadRecording,
  useCreateRecording,
  useRecordingsByAssignment,
} from '@/hooks/useRecordings';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Play, Square, Mic, CheckCircle, ArrowLeft, Volume2, Send, CheckCircle2, Sparkles } from 'lucide-react';

export function ExercisePractice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: dashboard } = useParentDashboard();
  const childId = dashboard?.child.id;

  const { data: assignmentsData, isLoading: assignmentsLoading } = usePatientExercises(childId || '');
  const assignment = assignmentsData?.data?.find((a: any) => a.id === id);
  const assignmentId = assignment?.id;
  const exerciseId = assignment?.exerciseId;

  const { data: exerciseData, isLoading: exerciseLoading } = useExercise(exerciseId || '');

  const { data: recordingsData, refetch: refetchRecordings } = useRecordingsByAssignment(assignmentId || '');

  const uploadRecording = useUploadRecording();
  const createRecording = useCreateRecording();

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    error,
  } = useMediaRecorder({
    onError: (err) => {
      console.error('Recording error:', err);
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingSaved, setRecordingSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const exercise = exerciseData?.data;

const handleSubmitRecording = async () => {
  if (!audioBlob || !childId || !exerciseId || !assignmentId) {
    setStatusMessage(t('exercisePractice.missingData', 'Missing required data'));
    return;
  }

  setIsSubmitting(true);
  setStatusMessage('');

  try {
    const uploadResult = await uploadRecording.mutateAsync({
      file: audioBlob,
      patientId: childId,
      exerciseId: exerciseId,
      assignmentId: assignmentId,
    });

    await createRecording.mutateAsync({
      assignmentId: assignmentId,
      data: {
        recordingUrl: uploadResult.url,
        recordingKey: uploadResult.key,
        duration: duration,
        notes: t('exercisePractice.recordingNotes', 'Practice recording'),
      },
    });

    setRecordingSaved(true);
    setStatusMessage(t('exercisePractice.success', '🎉 Recording submitted successfully!'));
    
    // ✅ Show animation
    setShowSuccessAnimation(true);
    
    // Hide animation after 3 seconds
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 3000);

    refetchRecordings();
    resetRecording();
  } catch (err: any) {
    setStatusMessage(err.response?.data?.message || t('exercisePractice.error', 'Failed to submit recording'));
  } finally {
    setIsSubmitting(false);
  }
};

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (assignmentsLoading || exerciseLoading || !childId) {
    return <LoadingSpinner />;
  }

  if (!assignment || !exerciseId) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => navigate('/parent/exercises')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => navigate('/parent/exercises')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  // ✅ Use the full media URLs from the exercise
  const imageUrl = exercise.imageUrl || null;
  const audioUrlExercise = exercise.audioUrl || null;
  const videoUrl = exercise.videoUrl || null;

  // Check if this exercise already has a recording submitted
  const hasSubmitted = recordingsData && recordingsData.length > 0;
  const latestRecording = recordingsData?.[0];

  return (
<div className="space-y-6 pb-20 mx-auto px-4 md:px-6 lg:px-8 max-w-4xl relative">
      {/* Success Animation Overlay */}
  {showSuccessAnimation && (
  <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
    {/* Remove bg-green-500/10 backdrop-blur-sm */}
    <div className="animate-in zoom-in duration-500 rounded-2xl p-8 text-center">
      <div className="text-6xl mb-4 animate-bounce">🎉</div>
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-2" />
        <p className="text-xl font-bold text-gray-900">
          {t('exercisePractice.submitted', 'Submitted!')}
        </p>
        <p className="text-sm text-gray-600">
          {t('exercisePractice.waitingForReview', 'Waiting for review')}
        </p>
      </div>
    </div>
    {/* Confetti particles (keep these) */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" />
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-sparkle" />
      <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-sparkle" />
      <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-pink-400 rounded-full animate-sparkle" />
    </div>
  </div>
)}

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/parent/exercises')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{exercise.title}</h1>
          <p className="text-sm text-gray-500">{exercise.category}</p>
        </div>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={exercise.title}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Video (if available) */}
      {videoUrl && (
        <div className="rounded-2xl overflow-hidden bg-gray-100">
          <video controls className="w-full">
            <source src={videoUrl} type="video/mp4" />
            {t('exercises.videoNotSupported')}
          </video>
        </div>
      )}

      {/* Target Word */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-600 mb-1">{t('exercisePractice.sayTheWord', 'Say the word:')}</p>
        <h2 className="text-4xl font-bold text-gray-900">{exercise.title}</h2>
        {audioUrlExercise && (
          <button
            onClick={() => {
              const audio = new Audio(audioUrlExercise);
              audio.play();
            }}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <Volume2 size={18} className="text-primary" />
            <span className="text-sm font-medium">{t('exercisePractice.listen', 'Listen to pronunciation')}</span>
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <h3 className="text-sm font-medium text-blue-900 mb-1">{t('exercises.instructions')}</h3>
        <p className="text-sm text-blue-800">{exercise.instructions}</p>
      </div>

      {/* Recording Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">
            {recordingSaved || hasSubmitted
              ? t('exercisePractice.submitted', 'Submitted!')
              : t('exercisePractice.recordYourself', 'Record yourself')}
          </h3>
          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-500 font-medium">
                {t('exercisePractice.recording', 'Recording...')}
              </span>
            </div>
          )}
          {recordingSaved && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <CheckCircle size={12} />
              {t('exercisePractice.pendingReview', 'Pending review')}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* Duration */}
          <div className="text-2xl font-mono text-gray-700">
            {formatDuration(duration)}
          </div>

          {/* Record Button (Disabled after submission) */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={recordingSaved || hasSubmitted}
            className={`
              w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200
              ${isRecording
                ? 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-primary text-white shadow-md hover:shadow-lg active:scale-95'
              }
              ${(recordingSaved || hasSubmitted) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isRecording ? (
              <Square size={32} />
            ) : (
              <Mic size={32} />
            )}
          </button>

          {/* Controls (hidden after submission) */}
          {!recordingSaved && !hasSubmitted && (
            <div className="flex items-center gap-3">
              {isRecording && !isPaused && (
                <button
                  onClick={pauseRecording}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('exercisePractice.pause', 'Pause')}
                </button>
              )}
              {isPaused && (
                <button
                  onClick={resumeRecording}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('exercisePractice.resume', 'Resume')}
                </button>
              )}
              {audioUrl && !isRecording && (
                <button
                  onClick={() => {
                    const audio = new Audio(audioUrl);
                    audio.play();
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <Play size={16} className="inline mr-1" />
                  {t('exercisePractice.play', 'Play')}
                </button>
              )}
              {audioUrl && !isRecording && (
                <button
                  onClick={resetRecording}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  {t('exercisePractice.reset', 'Reset')}
                </button>
              )}
            </div>
          )}

          {/* Playback of submitted recording */}
          {(recordingSaved || hasSubmitted) && latestRecording && (
            <div className="w-full p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">
                {t('exercisePractice.yourSubmission', 'Your submission')}
              </p>
              <div className="flex items-center gap-3">
                <audio controls className="flex-1">
                  <source src={latestRecording.recordingUrl} type="audio/webm" />
                  {t('exercises.audioNotSupported')}
                </audio>
                <span className="text-xs text-gray-500">
                  {latestRecording.duration.toFixed(1)}s
                </span>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="text-center text-sm font-medium">
              {statusMessage}
            </div>
          )}
        </div>
      </div>

      {/* Previous Recordings */}
      {recordingsData && recordingsData.length > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            {t('exercisePractice.previousRecordings', 'Previous recordings')}
          </h3>
          <div className="space-y-2">
            {recordingsData.slice(0, 3).map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t('exercisePractice.recording', 'Recording')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(recording.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const audio = new Audio(recording.recordingUrl);
                    audio.play();
                  }}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <Play size={16} className="text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button (only if not already submitted) */}
      {!recordingSaved && !hasSubmitted && audioBlob && (
        <button
          onClick={handleSubmitRecording}
          disabled={isSubmitting || uploadRecording.isPending || createRecording.isPending}
          className="w-full py-4 rounded-2xl bg-green-600 text-white font-medium text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting || uploadRecording.isPending || createRecording.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('exercisePractice.submitting', 'Submitting...')}
            </>
          ) : (
            <>
              <Send size={20} />
              {t('exercisePractice.submit', 'Submit Recording')}
            </>
          )}
        </button>
      )}

      {/* Already submitted message */}
      {(recordingSaved || hasSubmitted) && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm">
            <CheckCircle2 size={16} />
            {t('exercisePractice.alreadySubmitted', 'Already submitted')}
          </div>
        </div>
      )}
    </div>
  );
}