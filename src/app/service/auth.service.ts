import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable, of} from "rxjs";
import {delay} from "rxjs/operators";
import {DashboardService} from "./dashboard.service";
import {User} from "../models/user.model";
import {LoginResponse, RegisterResponse, LogoutResponse} from "../models/auth.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  // 하드코딩된 사용자 데이터
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

  // 하드코딩된 비밀번호 (실제로는 해시된 값이어야 함)
  private mockPasswords: { [key: string]: string } = {
    'admin': 'admin123',
    'user1': 'password1',
    'user2': 'password2'
  };

  constructor(private http: HttpClient, private dashboardService: DashboardService) {}

  // 로그인 메서드 (하드코딩된 응답)
  login(userId: string, password: string): Observable<LoginResponse> {
    // 실제 API 호출 대신 하드코딩된 응답 반환
    return of(this.mockLogin(userId, password)).pipe(delay(500)); // 0.5초 지연으로 실제 API 호출 시뮬레이션
  }

  // 회원가입 메서드 (하드코딩된 응답)
  register(userId: string, userName: string, password: string, email: string): Observable<RegisterResponse> {
    // 실제 API 호출 대신 하드코딩된 응답 반환
    return of(this.mockRegister(userId, userName, password, email)).pipe(delay(500));
  }

  // 하드코딩된 로그인 로직
  private mockLogin(userId: string, password: string): LoginResponse {
    const user = this.mockUsers.find(u => u.userId === userId);
    
    if (!user) {
      return {
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      };
    }

    if (this.mockPasswords[userId] !== password) {
      return {
        success: false,
        message: '비밀번호가 일치하지 않습니다.'
      };
    }

    // 로그인 성공 시 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date().toISOString();

    return {
      success: true,
      message: '로그인에 성공했습니다.',
      user: user,
      token: `mock-jwt-token-${userId}-${Date.now()}`
    };
  }

  // 하드코딩된 회원가입 로직
  private mockRegister(userId: string, userName: string, password: string, email: string): RegisterResponse {
    // 중복 사용자 ID 체크
    if (this.mockUsers.find(u => u.userId === userId)) {
      return {
        success: false,
        message: '이미 존재하는 사용자 ID입니다.'
      };
    }

    // 중복 이메일 체크
    if (this.mockUsers.find(u => u.email === email)) {
      return {
        success: false,
        message: '이미 존재하는 이메일입니다.'
      };
    }

    // 새 사용자 생성
    const newUser: User = {
      id: this.mockUsers.length + 1,
      userId: userId,
      userName: userName,
      email: email,
      role: 'USER',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    // 사용자 목록에 추가
    this.mockUsers.push(newUser);
    this.mockPasswords[userId] = password;

    // DashboardService에도 사용자 추가
    this.dashboardService.addUser(newUser);

    return {
      success: true,
      message: '회원가입에 성공했습니다.',
      user: newUser
    };
  }

  // 로그아웃 메서드
  logout(): Observable<LogoutResponse> {
    // localStorage에서 토큰 제거
    localStorage.removeItem('authToken');
    
    return of({
      success: true,
      message: '로그아웃되었습니다.'
    }).pipe(delay(200));
  }

  // 현재 로그인된 사용자 정보 조회
  getCurrentUser(): User | null {
    // 실제로는 localStorage나 세션에서 토큰을 확인해야 함
    const token = localStorage.getItem('authToken');
    if (token) {
      // 토큰에서 사용자 정보 추출 (실제로는 JWT 디코딩)
      const userId = token.split('-')[3]; // mock-jwt-token-{userId}-{timestamp}
      return this.mockUsers.find(u => u.userId === userId) || null;
    }
    return null;
  }

  // 인증 상태 확인
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // 강제 로그아웃 (토큰만 제거)
  forceLogout(): void {
    localStorage.removeItem('authToken');
  }
}
