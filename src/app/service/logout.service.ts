import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor() { }

  // 로그아웃
  logout(): void {
    console.log('로그아웃 시작...');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // 즉시 강제 이동
    window.location.href = '/login';
  }
} 