import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../service/auth.service';
import { DashboardService } from '../../service/dashboard.service';
import { LogoutService } from '../../service/logout.service';
import { of, throwError } from 'rxjs';
import { DashboardStats, Activity } from '../../models/dashboard.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let logoutService: jasmine.SpyObj<LogoutService>;

  const mockStats: DashboardStats = { 
    totalUsers: 100, 
    activeUsers: 50, 
    totalRevenue: 10000, 
    growthRate: 5, 
    realtimeTraffic: 10 
  };
  const mockActivities: Activity[] = [{ 
    id: 1, 
    user: 'test', 
    action: 'login', 
    time: '10:00' 
  }];

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getUserStats', 'getRecentActivities']);
    const logoutServiceSpy = jasmine.createSpyObj('LogoutService', ['logout']);

    await TestBed.configureTestingModule({
      declarations: [ DashboardComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        AuthService,
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: LogoutService, useValue: logoutServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    logoutService = TestBed.inject(LogoutService) as jasmine.SpyObj<LogoutService>;

    // 모든 복잡한 메서드들을 스파이로 처리
    spyOn(component, 'initChart').and.stub();
    spyOn(component, 'startRealtimeUpdates').and.stub();
    spyOn(component, 'initializeRealtimeData').and.stub();
    spyOn(component, 'animateNumber').and.stub();
    spyOn(component, 'updateRealtimeData').and.stub();
    spyOn(component, 'onTimeUnitChange').and.stub();
    spyOn(component, 'toggleRealtimeUpdates').and.stub();
    spyOn(component, 'ngOnInit').and.stub();
    spyOn(component, 'ngAfterViewInit').and.stub();
    spyOn(component, 'loadDashboardData').and.stub();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.loading).toBe(true);
    expect(component.stats).toBeDefined();
    expect(component.recentActivities).toEqual([]);
  });

  it('should have correct time unit options', () => {
    expect(component.timeUnitOptions).toBeDefined();
    expect(component.timeUnitOptions.length).toBe(3);
    expect(component.selectedTimeUnit).toBe('second');
  });

  it('should have realtime data structure', () => {
    expect(component.realtimeData).toBeDefined();
    expect(component.realtimeData.labels).toEqual([]);
    expect(component.realtimeData.datasets).toBeDefined();
    expect(component.realtimeData.datasets.length).toBe(3);
  });

  it('should call logoutService.logout on logout when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.logout();
    expect(logoutService.logout).toHaveBeenCalled();
  });

  it('should not call logoutService.logout on logout when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.logout();
    expect(logoutService.logout).not.toHaveBeenCalled();
  });

  it('should unsubscribe from realtimeSubscription on destroy', () => {
    const mockSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component.realtimeSubscription = mockSubscription;
    component.ngOnDestroy();
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should handle getCurrentUser method', () => {
    const result = component.getCurrentUser();
    expect(result).toBeDefined();
  });

  it('should handle trackByActivity method', () => {
    const activity = { id: 1, user: 'test', action: 'login', time: '10:00' };
    const result = component.trackByActivity(0, activity);
    expect(result).toBe(1);
  });

  it('should handle getActivityIcon method', () => {
    const result = component.getActivityIcon('login');
    expect(result).toBeDefined();
  });

  it('should handle getStatTooltip method', () => {
    const result = component.getStatTooltip('totalUsers');
    expect(result).toBeDefined();
  });
});