import {
  DashboardStatsResponse,
  DashboardChartsData,
  RecentActivity,
  NotificationsResponse,
  QuickActionType
} from '../types/dashboard';
import { fetchWithAuth } from './httpClient';

class DashboardApiClient {
  public async getStats(): Promise<{ success: boolean; data: DashboardStatsResponse }> {
    const response = await fetchWithAuth('/api/v1/dashboard/stats', {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard metrics.');
    }
    return data;
  }

  public async getChartData(timeframe: string = 'year'): Promise<{ success: boolean; data: DashboardChartsData }> {
    const response = await fetchWithAuth(`/api/v1/dashboard/charts?timeframe=${timeframe}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch chart datasets.');
    }
    return data;
  }

  public async getActivities(limit: number = 10): Promise<{ success: boolean; data: RecentActivity[] }> {
    const response = await fetchWithAuth(`/api/v1/dashboard/activities?limit=${limit}`, {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch activity feed.');
    }
    return data;
  }

  public async getNotifications(): Promise<{ success: boolean; data: NotificationsResponse }> {
    const response = await fetchWithAuth('/api/v1/dashboard/notifications', {
      method: 'GET'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch notifications.');
    }
    return data;
  }

  public async markNotificationRead(id: string): Promise<{ success: boolean; data: NotificationsResponse }> {
    const response = await fetchWithAuth(`/api/v1/dashboard/notifications/${id}/read`, {
      method: 'PATCH'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update notification status.');
    }
    return data;
  }

  public async markAllNotificationsRead(): Promise<{ success: boolean; data: NotificationsResponse }> {
    const response = await fetchWithAuth('/api/v1/dashboard/notifications/read-all', {
      method: 'PATCH'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update notifications.');
    }
    return data;
  }

  public async executeQuickAction(actionType: QuickActionType, payload: any): Promise<{ success: boolean; message: string; data: any }> {
    const response = await fetchWithAuth('/api/v1/dashboard/quick-action', {
      method: 'POST',
      body: JSON.stringify({ actionType, payload })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Quick action execution failed.');
    }
    return data;
  }
}

export const dashboardApi = new DashboardApiClient();
