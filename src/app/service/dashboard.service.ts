import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/user.model';
import { DashboardStats, Activity, ChartData, ChartDataset } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  
  // 하드코딩된 사용자 데이터 (AuthService와 공유)
  private mockUsers: User[] = [
    {
      id: 1,
      userId: 'admin',
      userName: '관리자',
      email: 'admin@example.com',
      role: 'ADMIN',
      createdAt: '2024-01-01T00:00:00Z',
      lastLoginAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      userId: 'user1',
      userName: '김철수',
      email: 'kim@example.com',
      role: 'USER',
      createdAt: '2024-01-05T00:00:00Z',
      lastLoginAt: '2024-01-15T09:15:00Z'
    },
    {
      id: 3,
      userId: 'user2',
      userName: '이영희',
      email: 'lee@example.com',
      role: 'USER',
      createdAt: '2024-01-10T00:00:00Z',
      lastLoginAt: '2024-01-15T08:45:00Z'
    }
  ];

  constructor() { }

  // 사용자 목록 조회
  getUsers(): Observable<User[]> {
    return of(this.mockUsers).pipe(delay(300));
  }

  // 사용자 통계 조회
  getUserStats(): Observable<DashboardStats> {
    const totalUsers = this.mockUsers.length;
    const activeUsers = this.mockUsers.filter(user => {
      const lastLogin = new Date(user.lastLoginAt);
      const now = new Date();
      const diffDays = (now.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7; // 최근 7일 내 로그인한 사용자
    }).length;

    return of({
      totalUsers: totalUsers,
      activeUsers: activeUsers,
      totalRevenue: totalUsers * 36500, // 가상의 매출 계산
      growthRate: 12.5
    }).pipe(delay(200));
  }

  // 최근 활동 조회
  getRecentActivities(): Observable<Activity[]> {
    const activities: Activity[] = [
      { id: 1, user: '김철수', action: '새 게시물 작성', time: '2분 전' },
      { id: 2, user: '이영희', action: '댓글 작성', time: '5분 전' },
      { id: 3, user: '박민수', action: '로그인', time: '10분 전' },
      { id: 4, user: '정수진', action: '프로필 업데이트', time: '15분 전' }
    ];

    return of(activities).pipe(delay(100));
  }

  // 월별 차트 데이터 조회
  getChartData(): Observable<ChartData> {
    const chartData: ChartData = {
      labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
      datasets: [
        {
          label: '사용자 수',
          data: [65, 78, 90, 105, 120, 135],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        },
        {
          label: '매출',
          data: [12000, 15000, 18000, 22000, 28000, 32000],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        }
      ]
    };

    return of(chartData).pipe(delay(150));
  }

  // 사용자 추가 (회원가입 시 호출)
  addUser(user: User): void {
    this.mockUsers.push(user);
  }

  // 사용자 목록 업데이트
  updateUsers(users: User[]): void {
    this.mockUsers = [...users];
  }
} 