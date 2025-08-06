import { Injectable } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { RealtimeData, ChartColors } from '../models/dashboard.types';
import { CHART_COLORS, CHART_CONFIG } from '../constants/dashboard.constants';

// Chart.js 등록
Chart.register(...registerables);

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private chart: Chart | null = null;

  // 차트 초기화
  initChart(
    canvas: HTMLCanvasElement, 
    realtimeData: RealtimeData, 
    isDarkMode: boolean
  ): Chart {
    this.destroyChart();

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('차트 컨텍스트를 가져올 수 없습니다.');
    }

    const colors = this.getChartColors(isDarkMode);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: realtimeData.labels,
        datasets: this.createDatasets(realtimeData, isDarkMode)
      },
      options: this.createChartOptions(colors)
    });

    return this.chart;
  }

  // 차트 업데이트
  updateChart(realtimeData: RealtimeData): void {
    if (!this.chart) {
      console.warn('차트가 초기화되지 않았습니다.');
      return;
    }

    try {
      this.chart.data.labels = realtimeData.labels;
      this.chart.data.datasets[0].data = realtimeData.datasets[0].data;
      this.chart.data.datasets[1].data = realtimeData.datasets[1].data;
      this.chart.data.datasets[2].data = realtimeData.datasets[2].data;
      
      this.chart.update('none');
    } catch (error) {
      console.error('차트 업데이트 중 오류:', error);
    }
  }

  // 다크모드 업데이트
  updateDarkMode(isDarkMode: boolean): void {
    if (!this.chart) return;

    const colors = this.getChartColors(isDarkMode);

    // 차트 옵션 업데이트
    this.chart.options.plugins!.title!.color = colors.textColor;
    this.chart.options.plugins!.legend!.labels!.color = colors.textColor;
    
    // 툴팁 색상 업데이트
    this.chart.options.plugins!.tooltip!.backgroundColor = 
      isDarkMode ? 'rgba(45, 45, 45, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    this.chart.options.plugins!.tooltip!.borderColor = 
      isDarkMode ? colors.gridColor : '#fff';

    // 축 색상 업데이트
    if (this.chart.options.scales) {
      const scales = this.chart.options.scales as any;
      
      if (scales.x) {
        scales.x.title.color = colors.textColor;
        scales.x.grid.color = colors.gridColor;
        scales.x.ticks.color = colors.textColor;
      }
      
      if (scales.y) {
        scales.y.title.color = colors.textColor;
        scales.y.grid.color = colors.gridColor;
        scales.y.ticks.color = colors.textColor;
      }
      
      if (scales.y1) {
        scales.y1.title.color = colors.textColor;
        scales.y1.grid.color = colors.gridColor;
        scales.y1.ticks.color = colors.textColor;
      }
    }

    // 차트 업데이트
    this.chart.update('none');
  }

  // 차트 제거
  destroyChart(): void {
    if (this.chart) {
      try {
        this.chart.destroy();
        console.log('기존 차트 제거 완료');
      } catch (error) {
        console.error('차트 제거 중 오류:', error);
      }
      this.chart = null;
    }
  }

  // 데이터셋 생성
  private createDatasets(realtimeData: RealtimeData, isDarkMode: boolean) {
    return [
      {
        label: '실시간 트래픽',
        data: realtimeData.datasets[0].data,
        borderColor: CHART_COLORS.TRAFFIC,
        backgroundColor: isDarkMode 
          ? 'rgba(255, 71, 87, 0.2)' 
          : 'rgba(255, 71, 87, 0.1)',
        tension: CHART_CONFIG.LINE_TENSION,
        fill: true,
        pointRadius: CHART_CONFIG.POINT_RADIUS,
        pointHoverRadius: CHART_CONFIG.POINT_HOVER_RADIUS,
        yAxisID: 'y'
      },
      {
        label: '활성 사용자',
        data: realtimeData.datasets[1].data,
        borderColor: CHART_COLORS.ACTIVE_USERS,
        backgroundColor: isDarkMode 
          ? 'rgba(46, 213, 115, 0.2)' 
          : 'rgba(46, 213, 115, 0.1)',
        tension: CHART_CONFIG.LINE_TENSION,
        fill: true,
        pointRadius: CHART_CONFIG.POINT_RADIUS,
        pointHoverRadius: CHART_CONFIG.POINT_HOVER_RADIUS,
        yAxisID: 'y'
      },
      {
        label: '실시간 매출',
        data: realtimeData.datasets[2].data,
        borderColor: CHART_COLORS.REVENUE,
        backgroundColor: isDarkMode 
          ? 'rgba(55, 66, 250, 0.2)' 
          : 'rgba(55, 66, 250, 0.1)',
        tension: CHART_CONFIG.LINE_TENSION,
        fill: true,
        pointRadius: CHART_CONFIG.POINT_RADIUS,
        pointHoverRadius: CHART_CONFIG.POINT_HOVER_RADIUS,
        yAxisID: 'y1'
      }
    ];
  }

  // 차트 옵션 생성
  private createChartOptions(colors: ChartColors) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300
      },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: '실시간 트래픽 & 매출 모니터링',
          font: {
            size: 16,
            weight: 'bold' as const
          },
          color: colors.textColor
        },
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 15,
            color: colors.textColor
          }
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#fff',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          type: 'category' as const,
          display: true,
          title: {
            display: true,
            text: '시간',
            color: colors.textColor
          },
          grid: {
            color: colors.gridColor
          },
          ticks: {
            maxTicksLimit: CHART_CONFIG.MAX_TICKS,
            maxRotation: CHART_CONFIG.MAX_ROTATION,
            minRotation: 0,
            autoSkip: true,
            autoSkipPadding: 10,
            color: colors.textColor
          }
        },
        y: {
          type: 'linear' as const,
          display: true,
          title: {
            display: true,
            text: '트래픽 수',
            color: colors.textColor
          },
          beginAtZero: true,
          grid: {
            color: colors.gridColor
          },
          ticks: {
            color: colors.textColor
          }
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: '매출 (원)',
            color: colors.textColor
          },
          beginAtZero: true,
          grid: {
            color: colors.gridColor
          },
          ticks: {
            color: colors.textColor
          }
        }
      },
      elements: {
        point: {
          hoverRadius: 6,
          radius: CHART_CONFIG.POINT_RADIUS
        },
        line: {
          borderWidth: CHART_CONFIG.BORDER_WIDTH
        }
      }
    };
  }

  // 차트 색상 가져오기
  private getChartColors(isDarkMode: boolean): ChartColors {
    return isDarkMode ? {
      textColor: CHART_COLORS.DARK_MODE.TEXT,
      gridColor: CHART_COLORS.DARK_MODE.GRID,
      backgroundColor: CHART_COLORS.DARK_MODE.BACKGROUND
    } : {
      textColor: CHART_COLORS.LIGHT_MODE.TEXT,
      gridColor: CHART_COLORS.LIGHT_MODE.GRID,
      backgroundColor: CHART_COLORS.LIGHT_MODE.BACKGROUND
    };
  }

  // 차트 인스턴스 가져오기
  getChart(): Chart | null {
    return this.chart;
  }
} 