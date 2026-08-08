// src/types/dashboard.types.ts
export interface ParentDashboardResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    child: {
      id: string;
      firstName: string;
      lastName: string;
      age: number;
      status: string;
      avatar: string | null;
    };
    stats: {
      totalExercises: number;
      completedExercises: number;
      inProgressExercises: number;
      overdueExercises: number;
      completionRate: number;
      averageScore: number;
      latestScore: number;
      upcomingAppointments: number;
    };
    progressTrend: Array<{
      date: string;
      score: number;
      category: string;
    }>;
    recentExercises: Array<{
      id: string;
      title: string;
      status: string;
      score: number | null;
      dueDate: string;
    }>;
    upcomingAppointments: Array<{
      id: string;
      dateTime: string;
      location: string;
      isVirtual: boolean;
      type: string;
    }>;
    recentNotifications: Array<{
      id: string;
      title: string;
      message: string;
      createdAt: string;
      read: boolean;
      actionUrl: string;
    }>;
    unreadNotifications: number;
  };
}