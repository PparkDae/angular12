import { Injectable } from '@angular/core';
import { RealtimeData, DataPoint, TimeUnitOption } from '../models/dashboard.types';
import { DATA_GENERATION_CONFIG, TIME_UNIT_OPTIONS } from '../constants/dashboard.constants';

@Injectable({
  providedIn: 'root'
})
export class DataGenerationService {

  // 실시간 데이터 초기화
  initializeRealtimeData(selectedTimeUnit: string): RealtimeData {
    const now = new Date();
    const interval = this.getSelectedInterval(selectedTimeUnit);
    const timeFormat = this.getTimeFormat(selectedTimeUnit);
    const dataPoints = DATA_GENERATION_CONFIG.DATA_POINTS;

    const labels: string[] = [];
    const trafficData: number[] = [];
    const activeData: number[] = [];
    const revenueData: number[] = [];

    // 데이터 포인트 생성
    for (let i = dataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * interval);
      labels.push(time.toLocaleTimeString('ko-KR', timeFormat));
      
      const dataPoint = this.generateDataPoint();
      trafficData.push(dataPoint.traffic);
      activeData.push(dataPoint.activeUsers);
      revenueData.push(dataPoint.revenue);
    }

    return {
      labels,
      datasets: [
        {
          label: '실시간 트래픽',
          data: trafficData,
          borderColor: '#FF4757',
          backgroundColor: 'rgba(255, 71, 87, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4,
          yAxisID: 'y'
        },
        {
          label: '활성 사용자',
          data: activeData,
          borderColor: '#2ED573',
          backgroundColor: 'rgba(46, 213, 115, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4,
          yAxisID: 'y'
        },
        {
          label: '실시간 매출',
          data: revenueData,
          borderColor: '#3742FA',
          backgroundColor: 'rgba(55, 66, 250, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 4,
          yAxisID: 'y1'
        }
      ]
    };
  }

  // 새로운 데이터 포인트 생성
  generateNewDataPoint(): DataPoint {
    return this.generateDataPoint();
  }

  // 데이터 포인트 생성 (내부 메서드)
  private generateDataPoint(): DataPoint {
    // 트래픽 데이터 생성
    const baseTraffic = DATA_GENERATION_CONFIG.TRAFFIC.BASE_MIN + 
      Math.random() * (DATA_GENERATION_CONFIG.TRAFFIC.BASE_MAX - DATA_GENERATION_CONFIG.TRAFFIC.BASE_MIN);
    const trafficNoise = (Math.random() - 0.5) * DATA_GENERATION_CONFIG.TRAFFIC.NOISE_RANGE;
    const traffic = Math.max(0, Math.round(baseTraffic + trafficNoise));

    // 활성 사용자 데이터 (트래픽의 60-80%)
    const activeRatio = DATA_GENERATION_CONFIG.ACTIVE_USERS.MIN_RATIO + 
      Math.random() * (DATA_GENERATION_CONFIG.ACTIVE_USERS.MAX_RATIO - DATA_GENERATION_CONFIG.ACTIVE_USERS.MIN_RATIO);
    const activeUsers = Math.round(traffic * activeRatio);

    // 매출 데이터
    const baseRevenue = DATA_GENERATION_CONFIG.REVENUE.BASE_MIN + 
      Math.random() * (DATA_GENERATION_CONFIG.REVENUE.BASE_MAX - DATA_GENERATION_CONFIG.REVENUE.BASE_MIN);
    const revenueNoise = (Math.random() - 0.5) * DATA_GENERATION_CONFIG.REVENUE.NOISE_RANGE;
    const revenue = Math.max(0, Math.round(baseRevenue + revenueNoise));

    return {
      time: new Date(),
      traffic,
      activeUsers,
      revenue
    };
  }

  // 실시간 업데이트용 데이터 포인트 생성
  generateRealtimeDataPoint(): DataPoint {
    // 실시간 업데이트용으로 더 높은 활성 사용자 비율 사용
    const baseTraffic = DATA_GENERATION_CONFIG.TRAFFIC.BASE_MIN + 
      Math.random() * (DATA_GENERATION_CONFIG.TRAFFIC.BASE_MAX - DATA_GENERATION_CONFIG.TRAFFIC.BASE_MIN);
    const trafficNoise = (Math.random() - 0.5) * DATA_GENERATION_CONFIG.TRAFFIC.NOISE_RANGE;
    const traffic = Math.max(0, Math.round(baseTraffic + trafficNoise));

    const activeRatio = DATA_GENERATION_CONFIG.ACTIVE_USERS.REALTIME_MIN_RATIO + 
      Math.random() * (DATA_GENERATION_CONFIG.ACTIVE_USERS.REALTIME_MAX_RATIO - DATA_GENERATION_CONFIG.ACTIVE_USERS.REALTIME_MIN_RATIO);
    const activeUsers = Math.round(traffic * activeRatio);

    const baseRevenue = DATA_GENERATION_CONFIG.REVENUE.BASE_MIN + 
      Math.random() * (DATA_GENERATION_CONFIG.REVENUE.BASE_MAX - DATA_GENERATION_CONFIG.REVENUE.BASE_MIN);
    const revenueNoise = (Math.random() - 0.5) * DATA_GENERATION_CONFIG.REVENUE.NOISE_RANGE;
    const revenue = Math.max(0, Math.round(baseRevenue + revenueNoise));

    return {
      time: new Date(),
      traffic,
      activeUsers,
      revenue
    };
  }

  // 선택된 시간 단위의 간격 가져오기
  getSelectedInterval(selectedTimeUnit: string): number {
    const option = TIME_UNIT_OPTIONS.find(opt => opt.value === selectedTimeUnit);
    return option ? option.interval : 1000;
  }

  // 시간 형식 가져오기
  getTimeFormat(selectedTimeUnit: string): Intl.DateTimeFormatOptions {
    switch (selectedTimeUnit) {
      case 'second':
        return { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false
        };
      case 'minute':
        return { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        };
      case 'hour':
        return { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false
        };
      default:
        return { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false
        };
    }
  }

  // 매출 계산 (트래픽 기반)
  calculateRevenueFromTraffic(traffic: number): number {
    return traffic * DATA_GENERATION_CONFIG.REVENUE.PER_TRAFFIC;
  }

  // 성장률 계산
  calculateGrowthRate(activeUsers: number, totalUsers: number): number {
    if (totalUsers <= 0) return 0;
    return Math.round((activeUsers / totalUsers) * 100);
  }
} 