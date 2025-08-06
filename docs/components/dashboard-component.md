# Dashboard Component 상세 분석

## 📋 개요
`DashboardComponent`는 실시간 데이터 모니터링과 시각화를 담당하는 핵심 컴포넌트입니다. 차트, 통계 카드, 실시간 업데이트 기능을 제공합니다.

## 🏗️ 컴포넌트 구조

### 의존성 주입
```typescript
constructor(
  private authService: AuthService,           // 인증 서비스
  private dashboardService: DashboardService, // 대시보드 데이터 서비스
  private logoutService: LogoutService,       // 로그아웃 서비스
  private animationService: AnimationService, // 애니메이션 서비스
  private chartService: ChartService,         // 차트 서비스
  private dataGenerationService: DataGenerationService, // 데이터 생성 서비스
  public darkModeService: DarkModeService,    // 다크모드 서비스
  private router: Router,                     // 라우터
  private cdr: ChangeDetectorRef              // 변경 감지 참조
) { }
```

### 주요 속성
```typescript
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
```

## 🔄 생명주기 메서드

### ngOnInit()
컴포넌트 초기화 시 실행되는 메서드입니다.

```typescript
ngOnInit(): void {
  this.loadDashboardData();        // 1. 대시보드 데이터 로드
  this.initializeRealtimeData();   // 2. 실시간 데이터 초기화
  this.setupAnimationCallbacks();  // 3. 애니메이션 콜백 설정
  this.setupDarkModeSubscription(); // 4. 다크모드 구독 설정
}
```

### ngAfterViewInit()
뷰 초기화 후 차트를 생성합니다.

```typescript
ngAfterViewInit(): void {
  // 차트 초기화는 데이터 로드 후에 수행
  setTimeout(() => {
    this.initChart();
  }, 1500);
}
```

### ngOnDestroy()
컴포넌트 소멸 시 리소스를 정리합니다.

```typescript
ngOnDestroy(): void {
  this.cleanup();
}
```

## 📊 데이터 로드 및 초기화

### 대시보드 데이터 로드
```typescript
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
```

### 실시간 데이터 초기화
```typescript
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
```

## 🎨 애니메이션 시스템

### 애니메이션 콜백 설정
```typescript
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
```

## 📈 차트 시스템

### 차트 초기화
```typescript
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
```

### 다크모드 구독 설정
```typescript
private setupDarkModeSubscription(): void {
  this.darkModeSubscription = this.darkModeService.isDarkMode$.subscribe(isDarkMode => {
    if (this.chartService.getChart()) {
      this.chartService.updateDarkMode(isDarkMode);
    }
  });
}
```

## 🔄 실시간 업데이트 시스템

### 실시간 업데이트 시작
```typescript
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
```

### 실시간 업데이트 중지
```typescript
private stopRealtimeUpdates(): void {
  if (this.realtimeSubscription) {
    this.realtimeSubscription.unsubscribe();
    this.realtimeSubscription = null;
  }
}
```

### 실시간 데이터 업데이트 (핵심 로직)
```typescript
private updateRealtimeData(): void {
  if (!this.chartService.getChart()) {
    console.warn('차트가 준비되지 않았습니다.');
    return;
  }

  // 1. 새로운 데이터 포인트 생성
  const timeFormat = this.dataGenerationService.getTimeFormat(this.selectedTimeUnit);
  const timeLabel = new Date().toLocaleTimeString('ko-KR', timeFormat);
  const newDataPoint = this.dataGenerationService.generateRealtimeDataPoint();

  // 2. 데이터 배열 업데이트 (FIFO 방식)
  this.realtimeData.labels.shift();
  this.realtimeData.labels.push(timeLabel);
  
  this.realtimeData.datasets[0].data.shift();
  this.realtimeData.datasets[0].data.push(newDataPoint.traffic);
  
  this.realtimeData.datasets[1].data.shift();
  this.realtimeData.datasets[1].data.push(newDataPoint.activeUsers);

  this.realtimeData.datasets[2].data.shift();
  this.realtimeData.datasets[2].data.push(newDataPoint.revenue);

  // 3. 통계 값 애니메이션 업데이트
  this.animationService.animateNumber('realtimeTraffic', this.stats.realtimeTraffic, newDataPoint.traffic);
  this.animationService.animateNumber('activeUsers', this.stats.activeUsers, newDataPoint.activeUsers);

  // 4. 활성 사용자 누적치 업데이트
  this.activeUsersSum += newDataPoint.activeUsers;
  this.animationService.animateNumber('totalUsers', this.stats.totalUsers, this.activeUsersSum);

  // 5. 총매출 계산 및 애니메이션
  const newRevenueTotal = this.dataGenerationService.calculateRevenueFromTraffic(newDataPoint.traffic);
  this.stats.totalRevenue += newRevenueTotal;
  this.animationService.animateNumber('totalRevenue', this.stats.totalRevenue - newRevenueTotal, this.stats.totalRevenue);

  // 6. 성장률 업데이트
  this.stats.growthRate = this.dataGenerationService.calculateGrowthRate(
    this.stats.activeUsers, 
    this.stats.totalUsers
  );

  // 7. 차트 업데이트
  this.chartService.updateChart(this.realtimeData);
  
  // 8. 변경 감지 트리거 (OnPush 전략)
  this.cdr.detectChanges();
}
```

## 🎛️ 사용자 인터랙션

### 시간 단위 변경
```typescript
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
```

### 실시간 업데이트 토글
```typescript
toggleRealtimeUpdates(): void {
  if (this.realtimeSubscription) {
    this.stopRealtimeUpdates();
    console.log('실시간 업데이트 일시정지');
  } else {
    this.startRealtimeUpdates();
    console.log('실시간 업데이트 재개');
  }
}
```

### 다크모드 토글
```typescript
toggleDarkMode(): void {
  this.darkModeService.toggleDarkMode();
}
```

### 로그아웃
```typescript
logout(): void {
  if (confirm('로그아웃하시겠습니까?')) {
    this.logoutService.logout();
  }
}
```

## 🧹 리소스 정리

### 컴포넌트 정리
```typescript
private cleanup(): void {
  this.stopRealtimeUpdates();
  
  if (this.darkModeSubscription) {
    this.darkModeSubscription.unsubscribe();
    this.darkModeSubscription = null;
  }

  this.animationService.destroy();
  this.chartService.destroyChart();
}
```

## 🎯 유틸리티 메서드

### 통계 툴팁 생성
```typescript
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
```

### 활동 관련 메서드
```typescript
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
```

## 🔄 전체 데이터 흐름

```
1. 컴포넌트 생성 → 서비스 주입
2. ngOnInit() → 데이터 로드 + 초기화
3. ngAfterViewInit() → 차트 생성
4. 실시간 업데이트 시작 → 주기적 데이터 생성
5. 애니메이션 콜백 → UI 업데이트
6. 사용자 인터랙션 → 설정 변경
7. ngOnDestroy() → 리소스 정리
```

## 🚀 핵심 특징

1. **OnPush 변경 감지 전략**: 성능 최적화를 위해 수동으로 `detectChanges()` 호출
2. **서비스 분리**: 각 기능별로 독립적인 서비스로 분리
3. **실시간 데이터**: RxJS interval을 통한 주기적 업데이트
4. **애니메이션 시스템**: 부드러운 숫자 변화 효과
5. **메모리 관리**: 적절한 구독 해제와 리소스 정리
6. **다크모드 지원**: 차트와 UI의 다크모드 전환
7. **반응형 디자인**: 다양한 화면 크기에 대응

## 📁 관련 파일

- **컴포넌트**: `src/app/components/dashboard/dashboard.component.ts`
- **템플릿**: `src/app/components/dashboard/dashboard.component.html`
- **스타일**: `src/app/components/dashboard/dashboard.component.css`
- **서비스들**:
  - `src/app/service/animation.service.ts`
  - `src/app/service/chart.service.ts`
  - `src/app/service/data-generation.service.ts`
  - `src/app/service/dark-mode.service.ts`
- **타입**: `src/app/models/dashboard.types.ts`
- **상수**: `src/app/constants/dashboard.constants.ts` 