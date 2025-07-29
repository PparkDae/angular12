import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(private router: Router) { }

  // 안전한 로그아웃
  safeLogout(): void {
    console.log('강제 로그아웃 시작...');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // 즉시 강제 이동
    window.location.href = '/login';
    
  }

  // 즉시 로그아웃 (강제)
  forceLogout(): void {
    console.log('강제 로그아웃 시작...');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // 즉시 강제 이동
    window.location.href = '/login';
  }
} 