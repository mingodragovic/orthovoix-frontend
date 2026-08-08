// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import type { Notification, NotificationsResponse } from '@/types/notification.types';

const NOTIFICATIONS_BASE = '/notifications';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page?: number, limit?: number, read?: boolean) =>
    [...notificationKeys.all, 'list', { page, limit, read }] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
};

// Get notifications
export async function getNotifications(
  page = 1,
  limit = 10,
  read?: boolean
): Promise<NotificationsResponse['data']> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (read !== undefined) params.append('read', String(read));

  const response = await apiClient.get<NotificationsResponse>(
    `${NOTIFICATIONS_BASE}?${params.toString()}`
  );
  return response.data.data;
}

// Get unread count
export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<{ data: { count: number } }>(
    `${NOTIFICATIONS_BASE}/unread-count`
  );
  return response.data.data.count;
}

// Mark notification as read
export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await apiClient.put<Notification>(
    `${NOTIFICATIONS_BASE}/${id}/read`
  );
  return response.data;
}

// Mark all as read
export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.put(`${NOTIFICATIONS_BASE}/read-all`);
}

export function useNotifications(page = 1, limit = 10, read?: boolean) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit, read),
    queryFn: () => getNotifications(page, limit, read),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      success(t('notifications.markedRead', 'Notification marked as read'));
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      success(t('notifications.allMarkedRead', 'All notifications marked as read'));
    },
  });
}