import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../service/auth.service';
import { DashboardService } from '../../service/dashboard.service';
import { LogoutService } from '../../service/logout.service';
import { DashboardStats, Activity, ChartData } from '../../models/dashboard.model';
import { trigger, transition, style, animate } from '@angular/animations';

// Chart.js 등록
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('numberAnimation', [
      transition('* => *', [
        style({ transform: 'translateY(-10px)', opacity: 0.7 }),
        animate('500ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  public realtimeSubscription: Subscription | null = null;
  
  // 애니메이션 추적을 위한 변수들
  private totalUsersAnimation: any = null;
  private activeUsersAnimation: any = null;
  private realtimeTrafficAnimation: any = null;
  private totalRevenueAnimation: any = null;
  
  // 활성 사용자 누적치 추적
  private activeUsersSum = 0;
  
  // 대시보드 데이터
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    growthRate: 0,
    realtimeTraffic: 0
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
        data: [] as number[],
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
        data: [] as number[],
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
      this.realtimeSubscription = null;
    }

    // 진행 중인 애니메이션 정리
    if (this.totalUsersAnimation) {
      clearInterval(this.totalUsersAnimation);
      this.totalUsersAnimation = null;
    }
    if (this.activeUsersAnimation) {
      clearInterval(this.activeUsersAnimation);
      this.activeUsersAnimation = null;
    }
    if (this.realtimeTrafficAnimation) {
      clearInterval(this.realtimeTrafficAnimation);
      this.realtimeTrafficAnimation = null;
    }
    if (this.totalRevenueAnimation) {
      clearInterval(this.totalRevenueAnimation);
      this.totalRevenueAnimation = null;
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

  // 실시간 데이터 초기화
  initializeRealtimeData(): void {
    const now = new Date();
    const labels: string[] = [];
    const trafficData: number[] = [];
    const activeData: number[] = [];
    const revenueData: number[] = []; // 실시간 매출 데이터
    const interval = this.getSelectedInterval();
    const timeFormat = this.getTimeFormat();

    // 시간 단위에 따라 데이터 포인트 수 조정 (항상 60개 표시)
    let dataPoints = 60;
    if (this.selectedTimeUnit === 'minute') {
      dataPoints = 60; // 60분
    } else if (this.selectedTimeUnit === 'hour') {
      dataPoints = 60; // 60시간
    }

    // 데이터 포인트 생성
    for (let i = dataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * interval);
      labels.push(time.toLocaleTimeString('ko-KR', timeFormat));
      
      // 랜덤 트래픽 데이터 생성 (현실적인 패턴)
      const baseTraffic = 40 + Math.random() * 40;
      const noise = (Math.random() - 0.5) * 10;
      trafficData.push(Math.max(0, Math.round(baseTraffic + noise)));
      
      // 활성 사용자 데이터 (트래픽의 60-80%)
      const activeRatio = 0.6 + Math.random() * 0.2;
      activeData.push(Math.round(trafficData[trafficData.length - 1] * activeRatio));

      // 실시간 매출 데이터 (트래픽의 50-70%)
      const baseRevenue = 10000 + Math.random() * 20000; // 1만원 ~ 3만원
      const revenueNoise = (Math.random() - 0.5) * 5000;
      revenueData.push(Math.max(0, Math.round(baseRevenue + revenueNoise)));
    }

    this.realtimeData.labels = labels;
    this.realtimeData.datasets[0].data = trafficData;
    this.realtimeData.datasets[1].data = activeData;
    this.realtimeData.datasets[2].data = revenueData; // 실시간 매출 데이터 추가

    // 초기 통계 값 설정
    if (this.stats.realtimeTraffic === 0) {
      // 실시간 트래픽: 가장 최근 값
      this.stats.realtimeTraffic = trafficData[trafficData.length - 1];
      
      // 활성 사용자: 가장 최근 값
      this.stats.activeUsers = activeData[activeData.length - 1];
      
      // 활성 사용자 누적치 초기화
      this.activeUsersSum = activeData.reduce((sum, value) => sum + value, 0);
      
      // 총 사용자: 활성 사용자 누적치
      this.stats.totalUsers = this.activeUsersSum;
      
      // 총매출 초기화 (실시간 매출 데이터 기반)
      this.stats.totalRevenue = revenueData.reduce((sum, value) => sum + value, 0);
      
      // 성장률 계산
      if (this.stats.totalUsers > 0) {
        this.stats.growthRate = Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100);
      }
    }
  }

  // 실시간 업데이트 시작
  startRealtimeUpdates(): void {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
    }
    
    const updateInterval = Math.max(this.getSelectedInterval(), 2000); // 최소 2초 간격
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

    // 새로운 데이터 포인트 생성 (50을 넘는 활성 사용자 데이터 포함)
    const baseTraffic = 40 + Math.random() * 40; // 40-80 범위로 증가
    const noise = (Math.random() - 0.5) * 10;
    const newTraffic = Math.max(0, Math.round(baseTraffic + noise));
    const activeRatio = 0.7 + Math.random() * 0.3; // 70-100% 범위로 증가
    const newActive = Math.round(newTraffic * activeRatio);

    // 데이터 배열 업데이트 (가장 오래된 데이터 제거, 새로운 데이터 추가)
    this.realtimeData.labels.shift();
    this.realtimeData.labels.push(timeLabel);
    
    this.realtimeData.datasets[0].data.shift();
    this.realtimeData.datasets[0].data.push(newTraffic);
    
    this.realtimeData.datasets[1].data.shift();
    this.realtimeData.datasets[1].data.push(newActive);

    // 실시간 매출 데이터 업데이트
    const baseRevenue = 10000 + Math.random() * 20000; // 1만원 ~ 3만원
    const revenueNoise = (Math.random() - 0.5) * 5000;
    const newRevenue = Math.max(0, Math.round(baseRevenue + revenueNoise));
    this.realtimeData.datasets[2].data.shift();
    this.realtimeData.datasets[2].data.push(newRevenue);

    // 실시간 트래픽 값 업데이트 (현재 트래픽 값)
    this.animateNumber('realtimeTraffic', this.stats.realtimeTraffic, newTraffic);

    // 활성 사용자 값 업데이트 (현재 활성 사용자 값)
    this.animateNumber('activeUsers', this.stats.activeUsers, newActive);

    // 활성 사용자 누적치 업데이트
    this.activeUsersSum += newActive;
    
    // 총 사용자 값 업데이트 (활성 사용자 누적치)
    this.animateNumber('totalUsers', this.stats.totalUsers, this.activeUsersSum);

    // 총매출 계산 (실시간 트래픽 기반)
    const revenuePerTraffic = 50000; // 트래픽당 5만원
    const newRevenueTotal = newTraffic * revenuePerTraffic;
    this.stats.totalRevenue += newRevenueTotal;
    
    // 총매출 애니메이션 (누적 방식)
    this.animateNumber('totalRevenue', this.stats.totalRevenue - newRevenueTotal, this.stats.totalRevenue);

    // 활성 사용자 비율 업데이트
    if (this.stats.totalUsers > 0) {
      this.stats.growthRate = Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100);
    }

    try {
      // 차트 업데이트
      this.chart.data.labels = this.realtimeData.labels;
      this.chart.data.datasets[0].data = this.realtimeData.datasets[0].data;
      this.chart.data.datasets[1].data = this.realtimeData.datasets[1].data;
      this.chart.data.datasets[2].data = this.realtimeData.datasets[2].data; // 실시간 매출 데이터 업데이트
      
      this.chart.update('none'); // 애니메이션 없이 업데이트
    } catch (error) {
      console.error('차트 업데이트 중 오류:', error);
    }
  }



  // 숫자 애니메이션 (룰렛 효과)
  animateNumber(statType: 'totalUsers' | 'activeUsers' | 'realtimeTraffic' | 'totalRevenue', startValue: number, endValue: number): void {
    // 이미 진행 중인 애니메이션이 있으면 중단
    if (statType === 'totalUsers' && this.totalUsersAnimation) {
      clearInterval(this.totalUsersAnimation);
      this.totalUsersAnimation = null;
    }
    if (statType === 'activeUsers' && this.activeUsersAnimation) {
      clearInterval(this.activeUsersAnimation);
      this.activeUsersAnimation = null;
    }
    if (statType === 'realtimeTraffic' && this.realtimeTrafficAnimation) {
      clearInterval(this.realtimeTrafficAnimation);
      this.realtimeTrafficAnimation = null;
    }
    if (statType === 'totalRevenue' && this.totalRevenueAnimation) {
      clearInterval(this.totalRevenueAnimation);
      this.totalRevenueAnimation = null;
    }

    // 증가량이 너무 작으면 애니메이션 생략
    const difference = endValue - startValue;
    if (Math.abs(difference) < 1) {
      return;
    }

    const duration = 1500; // 1.5초로 조정
    const steps = 20; // 단계 수 조정
    const stepDuration = duration / steps;
    const increment = difference / steps;
    
    let currentStep = 0;
    let currentValue = startValue;

    // 애니메이션 시작 시 CSS 클래스 추가
    let element: HTMLElement | null = null;
    
    switch (statType) {
      case 'realtimeTraffic':
        element = document.querySelector('.stat-card:nth-child(1) .stat-number') as HTMLElement;
        break;
      case 'activeUsers':
        element = document.querySelector('.stat-card:nth-child(2) .stat-number') as HTMLElement;
        break;
      case 'totalUsers':
        element = document.querySelector('.stat-card:nth-child(3) .stat-number') as HTMLElement;
        break;
      case 'totalRevenue':
        element = document.querySelector('.stat-card:nth-child(4) .stat-number') as HTMLElement;
        break;
    }
    
    if (element) {
      element.classList.add('rolling');
      setTimeout(() => {
        if (element) {
          element.classList.remove('rolling');
        }
      }, 800);
    }

    const animation = setInterval(() => {
      currentStep++;
      currentValue += increment;

      // 마지막 단계에서는 정확한 목표 값으로 설정
      if (currentStep >= steps) {
        currentValue = endValue;
        clearInterval(animation);
        
        // 애니메이션 완료 시 추적 변수 초기화
        if (statType === 'totalUsers') {
          this.totalUsersAnimation = null;
        } else if (statType === 'activeUsers') {
          this.activeUsersAnimation = null;
        } else if (statType === 'realtimeTraffic') {
          this.realtimeTrafficAnimation = null;
        } else if (statType === 'totalRevenue') {
          this.totalRevenueAnimation = null;
        }
      }

      // 통계 값 업데이트
      if (statType === 'totalUsers') {
        this.stats.totalUsers = Math.round(currentValue);
        this.totalUsersAnimation = animation;
      } else if (statType === 'activeUsers') {
        this.stats.activeUsers = Math.round(currentValue);
        this.activeUsersAnimation = animation;
      } else if (statType === 'realtimeTraffic') {
        this.stats.realtimeTraffic = Math.round(currentValue);
        this.realtimeTrafficAnimation = animation;
      } else if (statType === 'totalRevenue') {
        this.stats.totalRevenue = Math.round(currentValue);
        this.totalRevenueAnimation = animation;
      }

      // 성장률도 함께 업데이트 (활성 사용자 비율)
      if (this.stats.totalUsers > 0) {
        this.stats.growthRate = Math.round((this.stats.activeUsers / this.stats.totalUsers) * 100);
      }

    }, stepDuration);
  }

  // 대시보드 데이터 로드
  loadDashboardData(): void {
    this.loading = true;
    
    // 통계 데이터 로드
    this.dashboardService.getUserStats().subscribe({
      next: (stats: DashboardStats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('통계 데이터 로드 실패:', error);
        this.loading = false;
      }
    });

    // 최근 활동 데이터 로드
    this.dashboardService.getRecentActivities().subscribe({
      next: (activities: Activity[]) => {
        this.recentActivities = activities;
      },
      error: (error: any) => {
        console.error('활동 데이터 로드 실패:', error);
      }
    });
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

    try {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.realtimeData.labels,
          datasets: [
            {
              label: '실시간 트래픽',
              data: this.realtimeData.datasets[0].data,
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
              data: this.realtimeData.datasets[1].data,
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
              data: this.realtimeData.datasets[2].data,
              borderColor: '#3742FA',
              backgroundColor: 'rgba(55, 66, 250, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 2,
              pointHoverRadius: 4,
              yAxisID: 'y1'
            }
          ]
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
              text: '실시간 트래픽 & 매출 모니터링',
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
              },
              ticks: {
                maxTicksLimit: 12, // 최대 12개의 틱만 표시
                maxRotation: 45, // 라벨 회전
                minRotation: 0,
                autoSkip: true,
                autoSkipPadding: 10
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
            },
            y1: { // 새로운 축 추가
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: '매출 (원)'
              },
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: '#3742FA' // 매출 데이터와 동일한 색상
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
      });
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
    // 간단한 확인 메시지
    if (confirm('로그아웃하시겠습니까?')) {
      this.logoutService.logout();
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



  // 통계 카드 툴팁 정보 가져오기
  getStatTooltip(statType: string): string {
    switch (statType) {
      case 'realtimeTraffic':
        const warningMessage = this.stats.realtimeTraffic >= 50 ? '\n⚠️ 높은 트래픽 경고!' : '';
        return `현재 실시간 트래픽: ${this.stats.realtimeTraffic.toLocaleString()}\n차트의 최신 트래픽 값${warningMessage}`;
      case 'totalUsers':
        return `총 사용자: ${this.stats.totalUsers.toLocaleString()}명\n활성 사용자 누적치`;
      case 'activeUsers':
        const activeRate = ((this.stats.activeUsers / this.stats.totalUsers) * 100).toFixed(1);
        const activeWarningMessage = this.stats.activeUsers >= 50 ? '\n⚠️ 높은 활성 사용자 경고!' : '';
        return `활성 사용자: ${this.stats.activeUsers.toLocaleString()}명\n현재 활성 사용자 비율: ${activeRate}%${activeWarningMessage}`;
      case 'totalRevenue':
        const monthlyAvg = (this.stats.totalRevenue / 12).toLocaleString();
        const revenueWarningMessage = this.stats.totalRevenue >= 10000000 ? '\n🎉 높은 매출 달성!' : '';
        return `총 매출: ₩${this.stats.totalRevenue.toLocaleString()}\n월 평균: ₩${monthlyAvg}${revenueWarningMessage}`;
      case 'growthRate':
        return `활성 사용자 비율: ${this.stats.growthRate}%\n현재 활성 사용자 / 총 사용자`;
      default:
        return '통계 정보를 확인할 수 없습니다.';
    }
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