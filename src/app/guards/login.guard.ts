import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // 이미 로그인된 경우 대시보드로 리다이렉트
    if (this.authService.isAuthenticated()) {
      console.log('이미 로그인된 사용자입니다. 대시보드로 이동합니다.');
      this.router.navigate(['/dashboard'], { replaceUrl: true });
      return false;
    }

    // 로그인되지 않은 경우 로그인 페이지 접근 허용
    return true;
  }
} 