export interface TimeUnitOption {
  value: 'second' | 'minute' | 'hour';
  label: string;
  interval: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
  pointRadius: number;
  pointHoverRadius: number;
  yAxisID: string;
}

export interface RealtimeData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface AnimationState {
  totalUsers: any | null;
  activeUsers: any | null;
  realtimeTraffic: any | null;
  totalRevenue: any | null;
}

export interface ChartColors {
  textColor: string;
  gridColor: string;
  backgroundColor: string;
}

export interface DataPoint {
  time: Date;
  traffic: number;
  activeUsers: number;
  revenue: number;
}

export type StatType = 'totalUsers' | 'activeUsers' | 'realtimeTraffic' | 'totalRevenue';

export interface AnimationConfig {
  duration: number;
  steps: number;
  minDifference: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  growthRate: number;
  realtimeTraffic: number;
}

export interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
} 