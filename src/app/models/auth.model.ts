import { User } from './user.model';

// 로그인 응답 인터페이스
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// 회원가입 응답 인터페이스
export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
}

// 로그아웃 응답 인터페이스
export interface LogoutResponse {
  success: boolean;
  message: string;
} 