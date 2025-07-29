import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // 인증 상태 확인
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    console.log('인증되지 않은 사용자입니다. 로그인 페이지로 이동합니다.');
    
    // 토큰이 있지만 유효하지 않은 경우 제거
    if (localStorage.getItem('authToken')) {
      localStorage.removeItem('authToken');
    }
    
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
      replaceUrl: true
    });
    
    return false;
  }
} 