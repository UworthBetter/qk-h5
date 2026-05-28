/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HealthMetric {
  current: number;
  unit: string;
  rangeText: string;
  status: 'normal' | 'warning' | 'danger';
  statusText: string;
  icon: string;
}

export interface Elder {
  id: string;
  name: string;
  role: string;
  room: string;
  checkInDate: string;
  avatar: string;
  metrics: {
    heartRate: HealthMetric;
    oxygen: HealthMetric;
    temp: HealthMetric;
    steps: HealthMetric;
  };
  hasTrends: {
    heartRate: { date: string; value: number }[];
    oxygen: { date: string; value: number }[];
    temp: { date: string; value: number }[];
    steps: { date: string; value: number }[];
  };
  aiAnalysis: string;
}

export interface MessageItem {
  id: string;
  sender: string;
  senderRole: string; // e.g., '平台管理员', '护理人员', '平台通知', '健康服务'
  type: 'alert' | 'system' | 'service';
  tag: string; // e.g., '健康预警', '系统通知', '服务提醒'
  title: string;
  time: string;
  content: string;
  status: 'unread' | 'read' | 'handled';
  statusText: string;
}

export interface HealthService {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: string;
  category: string;
}
