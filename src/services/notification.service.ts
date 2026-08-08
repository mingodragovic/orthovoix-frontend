// src/services/notification.service.ts
import { io, Socket } from 'socket.io-client';

class NotificationService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private listeners: {
    onNewNotification?: (notification: any) => void;
    onUnreadCount?: (count: number) => void;
  } = {};

  connect(token: string) {
    if (this.socket) return;
    this.token = token;

    this.socket = io(`${import.meta.env.VITE_API_URL}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('new-notification', (notification) => {
      this.listeners.onNewNotification?.(notification);
    });

    this.socket.on('unread-count', (data) => {
      this.listeners.onUnreadCount?.(data.count);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNewNotification(callback: (notification: any) => void) {
    this.listeners.onNewNotification = callback;
  }

  onUnreadCount(callback: (count: number) => void) {
    this.listeners.onUnreadCount = callback;
  }

  removeListeners() {
    this.listeners = {};
  }
}

export const notificationService = new NotificationService();