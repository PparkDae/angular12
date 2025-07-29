// 대시보드 통계 인터페이스
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  growthRate: number;
}

// 활동 인터페이스
export interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
}

// 차트 데이터 인터페이스
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// 차트 데이터셋 인터페이스
export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill?: boolean;
  yAxisID?: string;
} 