import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { DashboardService } from '../../service/dashboard.service';
import { LogoutService } from '../../service/logout.service';
import { DashboardStats, Activity } from '../../models/dashboard.model';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';

// Chart.js 등록
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  public realtimeSubscription: Subscription | null = null;
  
  // 대시보드 데이터
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    growthRate: 0
  };

  recentActivities: Activity[] = [];
  loading = true;

  // 시간 단위 선택 옵션
  timeUnitOptions = [
    { value: 'second', label: '초단위', interval: 1000 },
    { value: 'minute', label: '분단위', interval: 60000 },
    { value: 'hour', label: '시단위', interval: 3600000 }
  ];
  selectedTimeUnit = 'second';

  // 실시간 트래픽 데이터
  realtimeData = {
    labels: [] as string[],
    datasets: [
      {
        label: '실시간 트래픽',
        data: [] as number[],
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4
      },
      {
        label: '활성 사용자',
        data: [] as number[],
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 4
      }
    ]
  };

  constructor(
    private authService: AuthService, 
    private dashboardService: DashboardService,
    private logoutService: LogoutService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.initializeRealtimeData();
  }

  ngAfterViewInit(): void {
    // 차트 초기화는 데이터 로드 후에 수행
    setTimeout(() => {
      this.initChart();
    }, 1500);
  }

  ngOnDestroy(): void {
    // 컴포넌트가 파괴될 때 구독 해제
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }
    
    // 차트 제거
    this.destroyChart();
  }

  // 시간 단위 변경
  onTimeUnitChange(): void {
    console.log('시간 단위 변경:', this.selectedTimeUnit);
    
    // 기존 구독 해제
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
    
    // 새로운 시간 단위로 데이터 초기화
    this.initializeRealtimeData();
    
    // 차트 다시 초기화
    setTimeout(() => {
      this.initChart();
    }, 100);
  }

  // 선택된 시간 단위의 간격 가져오기
  getSelectedInterval(): number {
    const option = this.timeUnitOptions.find(opt => opt.value === this.selectedTimeUnit);
    return option ? option.interval : 1000;
  }

  // 시간 형식 가져오기
  getTimeFormat(): any {
    switch (this.selectedTimeUnit) {
      case 'second':
        return { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        };
      case 'minute':
        return { 
          hour: '2-digit', 
          minute: '2-digit' 
        };
      case 'hour':
        return { 
          hour: '2-digit', 
          minute: '2-digit' 
        };
      default:
        return { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        };
    }
  }

  // 실시간 데이터 초기화
  initializeRealtimeData(): void {
    const now = new Date();
    const labels: string[] = [];
    const trafficData: number[] = [];
    const activeData: number[] = [];
    const interval = this.getSelectedInterval();
    const timeFormat = this.getTimeFormat();

    // 최근 10개 데이터 포인트 생성
    for (let i = 9; i >= 0; i--) {
      const time = new Date(now.getTime() - i * interval);
      labels.push(time.toLocaleTimeString('ko-KR', timeFormat));
      
      // 랜덤 트래픽 데이터 생성 (현실적인 패턴)
      const baseTraffic = 30 + Math.random() * 30;
      const noise = (Math.random() - 0.5) * 10;
      trafficData.push(Math.max(0, Math.round(baseTraffic + noise)));
      
      // 활성 사용자 데이터 (트래픽의 60-80%)
      const activeRatio = 0.6 + Math.random() * 0.2;
      activeData.push(Math.round(trafficData[trafficData.length - 1] * activeRatio));
    }

    this.realtimeData.labels = labels;
    this.realtimeData.datasets[0].data = trafficData;
    this.realtimeData.datasets[1].data = activeData;
  }

  // 실시간 업데이트 시작
  startRealtimeUpdates(): void {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }
    
    const updateInterval = this.getSelectedInterval();
    this.realtimeSubscription = interval(updateInterval).subscribe(() => {
      this.updateRealtimeData();
    });
  }

  // 실시간 데이터 업데이트
  updateRealtimeData(): void {
    if (!this.chart || !this.chart.data) {
      console.warn('차트가 준비되지 않았습니다.');
      return;
    }

    const now = new Date();
    const timeFormat = this.getTimeFormat();
    const timeLabel = now.toLocaleTimeString('ko-KR', timeFormat);

    // 새로운 데이터 포인트 생성
    const baseTraffic = 30 + Math.random() * 30;
    const noise = (Math.random() - 0.5) * 10;
    const newTraffic = Math.max(0, Math.round(baseTraffic + noise));
    const activeRatio = 0.6 + Math.random() * 0.2;
    const newActive = Math.round(newTraffic * activeRatio);

    // 데이터 배열 업데이트 (가장 오래된 데이터 제거, 새로운 데이터 추가)
    this.realtimeData.labels.shift();
    this.realtimeData.labels.push(timeLabel);
    
    this.realtimeData.datasets[0].data.shift();
    this.realtimeData.datasets[0].data.push(newTraffic);
    
    this.realtimeData.datasets[1].data.shift();
    this.realtimeData.datasets[1].data.push(newActive);

    try {
      // 차트 업데이트
      this.chart.data.labels = this.realtimeData.labels;
      this.chart.data.datasets[0].data = this.realtimeData.datasets[0].data;
      this.chart.data.datasets[1].data = this.realtimeData.datasets[1].data;
      
      this.chart.update('none'); // 애니메이션 없이 업데이트
    } catch (error) {
      console.error('차트 업데이트 중 오류:', error);
    }
  }

  // 대시보드 데이터 로드
  loadDashboardData(): void {
    this.loading = true;
    
    // 통계 데이터 로드
    this.dashboardService.getUserStats().subscribe(
      (stats: DashboardStats) => {
        this.stats = stats;
        this.loading = false;
      },
      (error: any) => {
        console.error('통계 데이터 로드 실패:', error);
        this.loading = false;
      }
    );

    // 최근 활동 데이터 로드
    this.dashboardService.getRecentActivities().subscribe(
      (activities: Activity[]) => {
        this.recentActivities = activities;
      },
      (error: any) => {
        console.error('활동 데이터 로드 실패:', error);
      }
    );
  }

  // 차트 제거 메서드
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

  // 차트 초기화
  initChart(): void {
    console.log('차트 초기화 시작...');
    
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.warn('차트 캔버스를 찾을 수 없습니다.');
      return;
    }

    // 기존 차트 제거
    this.destroyChart();

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('차트 컨텍스트를 가져올 수 없습니다.');
      return;
    }

    console.log('실시간 데이터:', this.realtimeData);

    const chartConfig: ChartConfiguration = {
      type: 'line' as ChartType,
      data: {
        labels: this.realtimeData.labels,
        datasets: this.realtimeData.datasets
      },
      options: {
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
            text: '실시간 트래픽 모니터링',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            position: 'top' as const,
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            mode: 'index',
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
            type: 'category',
            display: true,
            title: {
              display: true,
              text: '시간'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            type: 'linear',
            display: true,
            title: {
              display: true,
              text: '트래픽 수'
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        elements: {
          point: {
            hoverRadius: 6,
            radius: 2
          },
          line: {
            borderWidth: 2
          }
        }
      }
    };

    try {
      this.chart = new Chart(ctx, chartConfig);
      console.log('차트 생성 완료');
      
      // 차트 생성 후 실시간 업데이트 시작
      setTimeout(() => {
        this.startRealtimeUpdates();
      }, 1000);
      
    } catch (error) {
      console.error('차트 생성 중 오류:', error);
      this.chart = null;
    }
  }



  // 로그아웃
  logout(): void {
    console.log('로그아웃 시작...');
    
    // 간단한 확인 메시지
    if (confirm('정말 로그아웃하시겠습니까?')) {
      this.logoutService.safeLogout();
    }
  }

  // 현재 사용자 정보 가져오기
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  // 실시간 업데이트 일시정지/재개
  toggleRealtimeUpdates(): void {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
      console.log('실시간 업데이트 일시정지');
    } else {
      this.startRealtimeUpdates();
      console.log('실시간 업데이트 재개');
    }
  }

  // 활동 추적 함수
  trackByActivity(index: number, activity: Activity): number {
    return activity.id;
  }

  // 활동 아이콘 가져오기
  getActivityIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'login':
        return 'fas fa-sign-in-alt';
      case 'logout':
        return 'fas fa-sign-out-alt';
      case 'register':
        return 'fas fa-user-plus';
      case 'update':
        return 'fas fa-edit';
      case 'delete':
        return 'fas fa-trash';
      default:
        return 'fas fa-info-circle';
    }
  }

  // 모든 활동 보기
  viewAllActivities(): void {
    console.log('모든 활동 보기 클릭됨');
    alert('모든 활동 페이지로 이동합니다. (실제 구현에서는 라우팅 처리)');
    // 실제 구현에서는 라우터를 통해 활동 목록 페이지로 이동
    // this.router.navigate(['/activities']);
  }

  // 새 사용자 추가
  addNewUser(): void {
    console.log('새 사용자 추가 클릭됨');
    alert('새 사용자 추가 모달을 엽니다. (실제 구현에서는 모달 또는 페이지 이동)');
    // 실제 구현에서는 모달 열기 또는 사용자 추가 페이지로 이동
    // this.openUserModal();
  }

  // 보고서 생성
  generateReport(): void {
    console.log('보고서 생성 클릭됨');
    alert('보고서 생성 중... (실제 구현에서는 API 호출)');
    
    // 로딩 상태 표시
    this.loading = true;
    
    // 시뮬레이션된 보고서 생성
    setTimeout(() => {
      this.loading = false;
      alert('보고서가 성공적으로 생성되었습니다!');
      
      // 실제 구현에서는 파일 다운로드 또는 새 창에서 보고서 표시
      // this.downloadReport();
    }, 2000);
  }

  // 알림 설정
  openNotificationSettings(): void {
    console.log('알림 설정 클릭됨');
    alert('알림 설정 페이지로 이동합니다. (실제 구현에서는 라우팅 처리)');
    // 실제 구현에서는 알림 설정 페이지로 이동
    // this.router.navigate(['/notifications']);
  }

  // 분석 보기
  viewAnalytics(): void {
    console.log('분석 보기 클릭됨');
    alert('상세 분석 페이지로 이동합니다. (실제 구현에서는 라우팅 처리)');
    // 실제 구현에서는 분석 페이지로 이동
    // this.router.navigate(['/analytics']);
  }

  // 통계 카드 클릭 시 상세 정보 표시
  onStatCardClick(statType: string): void {
    console.log(`${statType} 카드가 클릭되었습니다.`);
    
    let message = '';
    let title = '';
    
    switch (statType) {
      case 'totalUsers':
        title = '총 사용자 통계';
        message = `총 사용자: ${this.stats.totalUsers.toLocaleString()}명\n성장률: +${this.stats.growthRate}%`;
        break;
      case 'activeUsers':
        title = '활성 사용자 통계';
        message = `활성 사용자: ${this.stats.activeUsers.toLocaleString()}명\n활성률: ${((this.stats.activeUsers / this.stats.totalUsers) * 100).toFixed(1)}%`;
        break;
      case 'totalRevenue':
        title = '총 매출 통계';
        message = `총 매출: ₩${this.stats.totalRevenue.toLocaleString()}\n월 평균: ₩${(this.stats.totalRevenue / 12).toLocaleString()}`;
        break;
      case 'growthRate':
        title = '성장률 통계';
        message = `현재 성장률: ${this.stats.growthRate}%\n목표 성장률: 15%`;
        break;
      default:
        title = '통계 정보';
        message = '선택된 통계 정보를 확인할 수 없습니다.';
    }
    
    alert(`${title}\n\n${message}`);
    
    // 실제 구현에서는 모달이나 상세 페이지로 이동
    // this.openStatDetailModal(statType);
  }

  // 활동 항목 클릭 시 상세 정보 표시
  onActivityClick(activity: Activity): void {
    console.log('활동 클릭:', activity);
    
    const message = `
활동 상세 정보:
- 사용자: ${activity.user}
- 활동: ${activity.action}
- 시간: ${activity.time}
- ID: ${activity.id}
    `.trim();
    
    alert(message);
    
    // 실제 구현에서는 활동 상세 모달이나 페이지로 이동
    // this.openActivityDetailModal(activity);
  }
} 