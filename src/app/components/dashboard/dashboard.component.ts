import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { DashboardService } from '../../service/dashboard.service';
import { LogoutService } from '../../service/logout.service';
import { AnimationService } from '../../service/animation.service';
import { ChartService } from '../../service/chart.service';
import { DataGenerationService } from '../../service/data-generation.service';
import { DarkModeService } from '../../service/dark-mode.service';
import { DashboardStats, Activity, RealtimeData, StatType } from '../../models/dashboard.types';
import { TIME_UNIT_OPTIONS, DATA_GENERATION_CONFIG } from '../../constants/dashboard.constants';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  
  // 서비스 주입
  constructor(
    private authService: AuthService, 
    private dashboardService: DashboardService,
    private logoutService: LogoutService,
    private animationService: AnimationService,
    private chartService: ChartService,
    private dataGenerationService: DataGenerationService,
    public darkModeService: DarkModeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  // 구독 관리
  public realtimeSubscription: Subscription | null = null;
  private darkModeSubscription: Subscription | null = null;
  
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
  error: string | null = null;

  // 시간 단위 선택 옵션
  timeUnitOptions = TIME_UNIT_OPTIONS;
  selectedTimeUnit = 'second';

  // 실시간 트래픽 데이터
  realtimeData: RealtimeData = {
    labels: [],
    datasets: []
  };

  ngOnInit(): void {
    this.loadDashboardData();
    this.initializeRealtimeData();
    this.setupAnimationCallbacks();
    this.setupDarkModeSubscription();
  }

  ngAfterViewInit(): void {
    // 차트 초기화는 데이터 로드 후에 수행
    setTimeout(() => {
      this.initChart();
    }, 1500);
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // 초기화 메서드들
  private setupAnimationCallbacks(): void {
    this.animationService.registerCallback('realtimeTraffic', (value: number) => {
      this.stats.realtimeTraffic = value;
      this.cdr.detectChanges();
    });
    
    this.animationService.registerCallback('activeUsers', (value: number) => {
      this.stats.activeUsers = value;
      this.cdr.detectChanges();
    });
    
    this.animationService.registerCallback('totalUsers', (value: number) => {
      this.stats.totalUsers = value;
      this.cdr.detectChanges();
    });
    
    this.animationService.registerCallback('totalRevenue', (value: number) => {
      this.stats.totalRevenue = value;
      this.cdr.detectChanges();
    });
  }

  private setupDarkModeSubscription(): void {
    this.darkModeSubscription = this.darkModeService.isDarkMode$.subscribe(isDarkMode => {
      if (this.chartService.getChart()) {
        this.chartService.updateDarkMode(isDarkMode);
      }
    });
  }

  // 시간 단위 변경
  onTimeUnitChange(): void {
    console.log('시간 단위 변경:', this.selectedTimeUnit);
    
    // 기존 구독 해제
    this.stopRealtimeUpdates();
    
    // 새로운 시간 단위로 데이터 초기화
    this.initializeRealtimeData();
    
    // 차트 다시 초기화
    setTimeout(() => {
      this.initChart();
    }, 100);
  }

  // 실시간 데이터 초기화
  private initializeRealtimeData(): void {
    this.realtimeData = this.dataGenerationService.initializeRealtimeData(this.selectedTimeUnit);
    
    // 초기 통계 값 설정
    if (this.stats.realtimeTraffic === 0) {
      const lastIndex = this.realtimeData.datasets[0].data.length - 1;
      
      this.stats.realtimeTraffic = this.realtimeData.datasets[0].data[lastIndex];
      this.stats.activeUsers = this.realtimeData.datasets[1].data[lastIndex];
      
      // 활성 사용자 누적치 초기화
      this.activeUsersSum = this.realtimeData.datasets[1].data.reduce((sum, value) => sum + value, 0);
      this.stats.totalUsers = this.activeUsersSum;
      
      // 총매출 초기화
      this.stats.totalRevenue = this.realtimeData.datasets[2].data.reduce((sum, value) => sum + value, 0);
      
      // 성장률 계산
      this.stats.growthRate = this.dataGenerationService.calculateGrowthRate(
        this.stats.activeUsers, 
        this.stats.totalUsers
      );
    }
  }

  // 실시간 업데이트 시작
  startRealtimeUpdates(): void {
    this.stopRealtimeUpdates();
    
    const updateInterval = Math.max(
      this.dataGenerationService.getSelectedInterval(this.selectedTimeUnit), 
      DATA_GENERATION_CONFIG.MIN_UPDATE_INTERVAL
    );
    
    this.realtimeSubscription = interval(updateInterval).subscribe(() => {
      this.updateRealtimeData();
    });
  }

  // 실시간 업데이트 중지
  private stopRealtimeUpdates(): void {
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
  }

  // 실시간 데이터 업데이트
  private updateRealtimeData(): void {
    if (!this.chartService.getChart()) {
      console.warn('차트가 준비되지 않았습니다.');
      return;
    }

    const timeFormat = this.dataGenerationService.getTimeFormat(this.selectedTimeUnit);
    const timeLabel = new Date().toLocaleTimeString('ko-KR', timeFormat);
    const newDataPoint = this.dataGenerationService.generateRealtimeDataPoint();

    // 데이터 배열 업데이트 (FIFO)
    this.realtimeData.labels.shift();
    this.realtimeData.labels.push(timeLabel);
    
    this.realtimeData.datasets[0].data.shift();
    this.realtimeData.datasets[0].data.push(newDataPoint.traffic);
    
    this.realtimeData.datasets[1].data.shift();
    this.realtimeData.datasets[1].data.push(newDataPoint.activeUsers);

    this.realtimeData.datasets[2].data.shift();
    this.realtimeData.datasets[2].data.push(newDataPoint.revenue);

    // 통계 값 애니메이션 업데이트
    this.animationService.animateNumber('realtimeTraffic', this.stats.realtimeTraffic, newDataPoint.traffic);
    this.animationService.animateNumber('activeUsers', this.stats.activeUsers, newDataPoint.activeUsers);

    // 활성 사용자 누적치 업데이트
    this.activeUsersSum += newDataPoint.activeUsers;
    this.animationService.animateNumber('totalUsers', this.stats.totalUsers, this.activeUsersSum);

    // 총매출 계산 및 애니메이션
    const newRevenueTotal = this.dataGenerationService.calculateRevenueFromTraffic(newDataPoint.traffic);
    this.stats.totalRevenue += newRevenueTotal;
    this.animationService.animateNumber('totalRevenue', this.stats.totalRevenue - newRevenueTotal, this.stats.totalRevenue);

    // 성장률 업데이트
    this.stats.growthRate = this.dataGenerationService.calculateGrowthRate(
      this.stats.activeUsers, 
      this.stats.totalUsers
    );

    // 차트 업데이트
    this.chartService.updateChart(this.realtimeData);
    
    // 변경 감지 트리거
    this.cdr.detectChanges();
  }

  // 대시보드 데이터 로드
  public loadDashboardData(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    // 통계 데이터 로드
    this.dashboardService.getUserStats().subscribe({
      next: (stats: DashboardStats) => {
        this.stats = stats;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('통계 데이터 로드 실패:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    // 최근 활동 데이터 로드
    this.dashboardService.getRecentActivities().subscribe({
      next: (activities: Activity[]) => {
        this.recentActivities = activities;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('활동 데이터 로드 실패:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // 차트 초기화
  private initChart(): void {
    console.log('차트 초기화 시작...');
    
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.warn('차트 캔버스를 찾을 수 없습니다.');
      return;
    }

    try {
      this.chartService.initChart(
        this.chartCanvas.nativeElement, 
        this.realtimeData, 
        this.darkModeService.isDarkMode
      );
      
      console.log('차트 생성 완료');
      
      // 차트 생성 후 실시간 업데이트 시작
      setTimeout(() => {
        this.startRealtimeUpdates();
      }, 1000);
      
    } catch (error) {
      console.error('차트 생성 중 오류:', error);
    }
  }

  // 리소스 정리
  private cleanup(): void {
    this.stopRealtimeUpdates();
    
    if (this.darkModeSubscription) {
      this.darkModeSubscription.unsubscribe();
      this.darkModeSubscription = null;
    }

    this.animationService.destroy();
    this.chartService.destroyChart();
  }

  // UI 이벤트 핸들러들
  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }

  toggleRealtimeUpdates(): void {
    if (this.realtimeSubscription) {
      this.stopRealtimeUpdates();
      console.log('실시간 업데이트 일시정지');
    } else {
      this.startRealtimeUpdates();
      console.log('실시간 업데이트 재개');
    }
  }

  logout(): void {
    if (confirm('로그아웃하시겠습니까?')) {
      this.logoutService.logout();
    }
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  // 활동 관련 메서드들
  trackByActivity(index: number, activity: Activity): number {
    return activity.id;
  }

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
  }

  // 퀵 액션 메서드들
  viewAllActivities(): void {
    console.log('모든 활동 보기 클릭됨');
    alert('모든 활동 페이지로 이동합니다. (실제 구현에서는 라우팅 처리)');
  }

  addNewUser(): void {
    console.log('새 사용자 추가 클릭됨');
    alert('새 사용자 추가 모달을 엽니다. (실제 구현에서는 모달 또는 페이지 이동)');
  }

  generateReport(): void {
    console.log('보고서 생성 클릭됨');
    alert('보고서 생성 중... (실제 구현에서는 API 호출)');
    
    this.loading = true;
    
    setTimeout(() => {
      this.loading = false;
      alert('보고서가 성공적으로 생성되었습니다!');
    }, 2000);
  }

  openNotificationSettings(): void {
    console.log('알림 설정 클릭됨');
    alert('알림 설정 페이지로 이동합니다. (실제 구현에서는 라우팅 처리)');
  }

  viewAnalytics(): void {
    console.log('분석 보기 클릭됨');
    alert('상세 분석 페이지로 이동합니다. (실제 구현에서는 라우팅 처리)');
  }

  // 유틸리티 메서드들
  getSelectedInterval(): number {
    return this.dataGenerationService.getSelectedInterval(this.selectedTimeUnit);
  }

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
}