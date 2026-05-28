/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Elder, MessageItem, HealthService } from './types';

// Generate last N days' short date strings (MM-DD) ending today
function recentDays(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${mm}-${dd}`);
  }
  return days;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const trendDates = recentDays(7);

// Relative time helpers for messages
const now = new Date();
const todayStr = `今天 ${formatTime(now)}`;
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = `昨天 ${formatTime(yesterday)}`;
const twoDaysAgo = new Date(now);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = `${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')} ${formatTime(twoDaysAgo)}`;

export const mockElders: Elder[] = [
  {
    id: 'zhang',
    name: '张爷爷',
    role: '长者',
    room: '朝阳社区2号楼201',
    checkInDate: '2023-06-12',
    avatar: '/avatar-zhang.png',
    metrics: {
      heartRate: {
        current: 72,
        unit: '次/分',
        rangeText: '60-100次/分',
        status: 'normal',
        statusText: '正常',
        icon: 'heart'
      },
      oxygen: {
        current: 97,
        unit: '%',
        rangeText: '95%-100%',
        status: 'normal',
        statusText: '正常',
        icon: 'droplet'
      },
      temp: {
        current: 36.5,
        unit: '°C',
        rangeText: '36.0°C-37.3°C',
        status: 'normal',
        statusText: '正常',
        icon: 'thermometer'
      },
      steps: {
        current: 3280,
        unit: '步',
        rangeText: '目标5000步',
        status: 'normal',
        statusText: '正常',
        icon: 'footprints'
      }
    },
    hasTrends: {
      heartRate: trendDates.map((date, i) => ({ date, value: [70, 68, 71, 69, 73, 72, 72][i] })),
      oxygen: trendDates.map((date, i) => ({ date, value: [98, 97, 97, 98, 97, 96, 97][i] })),
      temp: trendDates.map((date, i) => ({ date, value: [36.4, 36.5, 36.6, 36.5, 36.4, 36.5, 36.5][i] })),
      steps: trendDates.map((date, i) => ({ date, value: [4120, 5080, 3450, 4300, 6100, 3890, 3280][i] })),
    },
    aiAnalysis: '今日各项体征平稳，整体状态良好，请放心。心率和血氧饱和度均在优质区间，步数稳定增长，建议下午阳光柔和时到室外散步15分钟，并适当补充水分。'
  },
  {
    id: 'li',
    name: '李奶奶',
    role: '长者',
    room: '幸福小区5号楼302',
    checkInDate: '2023-08-15',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200',
    metrics: {
      heartRate: {
        current: 68,
        unit: '次/分',
        rangeText: '60-100次/分',
        status: 'normal',
        statusText: '正常',
        icon: 'heart'
      },
      oxygen: {
        current: 98,
        unit: '%',
        rangeText: '95%-100%',
        status: 'normal',
        statusText: '正常',
        icon: 'droplet'
      },
      temp: {
        current: 36.2,
        unit: '°C',
        rangeText: '36.0°C-37.3°C',
        status: 'normal',
        statusText: '正常',
        icon: 'thermometer'
      },
      steps: {
        current: 4820,
        unit: '步',
        rangeText: '目标5000步',
        status: 'normal',
        statusText: '正常',
        icon: 'footprints'
      }
    },
    hasTrends: {
      heartRate: trendDates.map((date, i) => ({ date, value: [64, 67, 66, 68, 65, 69, 68][i] })),
      oxygen: trendDates.map((date, i) => ({ date, value: [98, 98, 99, 98, 97, 98, 98][i] })),
      temp: trendDates.map((date, i) => ({ date, value: [36.2, 36.1, 36.2, 36.3, 36.2, 36.2, 36.2][i] })),
      steps: trendDates.map((date, i) => ({ date, value: [4800, 4200, 3100, 5200, 4600, 5300, 4820][i] })),
    },
    aiAnalysis: '李奶奶今日身体机能反馈非常积极。体温非常平稳，心率保持在最佳舒缓范围。今日步数已接近5000步的目标，建议适度休息，可在暖廊进行轻微的拉伸运动以维护肌肉活力。'
  },
  {
    id: 'wang',
    name: '王爷爷',
    role: '长者',
    room: '春风雅苑3号楼108',
    checkInDate: '2024-01-10',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
    metrics: {
      heartRate: {
        current: 102,
        unit: '次/分',
        rangeText: '60-100次/分',
        status: 'warning',
        statusText: '偏高',
        icon: 'heart'
      },
      oxygen: {
        current: 94,
        unit: '%',
        rangeText: '95%-100%',
        status: 'danger',
        statusText: '偏低',
        icon: 'droplet'
      },
      temp: {
        current: 37.5,
        unit: '°C',
        rangeText: '36.0°C-37.3°C',
        status: 'warning',
        statusText: '偏高',
        icon: 'thermometer'
      },
      steps: {
        current: 1200,
        unit: '步',
        rangeText: '目标5000步',
        status: 'danger',
        statusText: '偏少',
        icon: 'footprints'
      }
    },
    hasTrends: {
      heartRate: trendDates.map((date, i) => ({ date, value: [88, 92, 90, 95, 102, 104, 102][i] })),
      oxygen: trendDates.map((date, i) => ({ date, value: [96, 95, 96, 94, 93, 94, 94][i] })),
      temp: trendDates.map((date, i) => ({ date, value: [36.8, 37.0, 36.9, 37.2, 37.6, 37.7, 37.5][i] })),
      steps: trendDates.map((date, i) => ({ date, value: [1500, 1800, 1300, 1600, 800, 600, 1200][i] })),
    },
    aiAnalysis: '【需要关注】王爷爷今天的心率持续偏高（102 次/分），且血氧饱和度略低于正常水平（94%），脑部血氧可能有轻微不足。体温处于低烧边缘（37.5°C）。建议社区护士或网格员尽快上门进行体温核查与血压检测，督促居家静养，避免剧烈活动，并指导合理膳食与吸氧协助。'
  }
];

export const mockMessages: MessageItem[] = [
  {
    id: 'msg-1',
    sender: '平台管理员',
    senderRole: '健康预警',
    type: 'alert',
    tag: '健康预警',
    title: '张爷爷心率异常预警',
    time: todayStr,
    content: '系统监测到张爷爷近10分钟心率持续偏高，当前最高 112 次/分。平台已同步通知网格专员，请及时关注。',
    status: 'unread',
    statusText: '待查看'
  },
  {
    id: 'msg-2',
    sender: '护理人员',
    senderRole: '健康预警',
    type: 'alert',
    tag: '健康预警',
    title: '张爷爷心率异常已处置',
    time: todayStr,
    content: '社区网格员已上门检查，张爷爷状态平稳，当前心率 84 次/分，请继续关注。',
    status: 'handled',
    statusText: '已处理'
  },
  {
    id: 'msg-3',
    sender: '平台通知',
    senderRole: '系统通知',
    type: 'system',
    tag: '系统通知',
    title: '智能手表电量偏低提醒',
    time: yesterdayStr,
    content: '张爷爷的智能手表当前电量为 15%，建议尽快充电以确保监测不中断。',
    status: 'unread',
    statusText: '待查看'
  },
  {
    id: 'msg-4',
    sender: '健康服务',
    senderRole: '服务提醒',
    type: 'service',
    tag: '服务提醒',
    title: '护理服务预约提醒',
    time: twoDaysAgoStr,
    content: '您已为张爷爷预约上门家属陪同会诊及上门理发服务。服务时间：2023-06-18 (周日) 10:00-11:00。',
    status: 'read',
    statusText: '已查看'
  }
];

export const mockServices: HealthService[] = [
  {
    id: 'srv-1',
    name: '医生上门问诊',
    icon: 'Stethoscope',
    description: '三甲医院全科医生提供上门健康核查、开药指导及日常慢病管理指导。',
    price: '¥ 199 /次',
    category: '医疗健康'
  },
  {
    id: 'srv-2',
    name: '专业护士助浴',
    icon: 'ShowerHead',
    description: '配备两人专业护理组提供安全细致的上门助浴，防止跌倒与感冒。',
    price: '¥ 120 /次',
    category: '生活护理'
  },
  {
    id: 'srv-3',
    name: '陪同就医服务',
    icon: 'UserCheck',
    description: '专业护理陪护，提供排队挂号、取药、诊间陪同及诊后交代。',
    price: '¥ 150 /半天',
    category: '医疗健康'
  },
  {
    id: 'srv-4',
    name: '康复理疗针灸',
    icon: 'Activity',
    description: '专业中医师上门，提供针灸、推拿、肢体康复理疗，改善关节强直。',
    price: '¥ 180 /小时',
    category: '康复理疗'
  },
  {
    id: 'srv-5',
    name: '居家卫生保洁',
    icon: 'Sparkles',
    description: '专为高龄老人居家服务，包含床单除螨、家中全面清洁与消杀。',
    price: '¥ 80 /小时',
    category: '生活护理'
  },
  {
    id: 'srv-6',
    name: '老人爱心送餐',
    icon: 'Utensils',
    description: '低盐低脂、营养师定制配餐送餐上门，保障膳食科学营养。',
    price: '¥ 25 /餐',
    category: '生活护理'
  }
];
