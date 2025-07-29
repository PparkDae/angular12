import {AuthService} from "../../service/auth.service";
import {LoginResponse} from "../../models/auth.model";
import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-login',
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  userId = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 로그인 페이지 초기화 시 기존 에러 메시지와 로딩 상태 초기화
    this.errorMessage = '';
    this.loading = false;
    this.userId = '';
    this.password = '';
    console.log("로긴페이지 진입");
  }

  onLogin() {
    if (!this.userId || !this.password) {
      this.errorMessage = '아이디와 비밀번호를 모두 입력해주세요.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.userId, this.password).subscribe({
      next: (response: LoginResponse) => {
        this.loading = false;
        console.log('로그인 응답:', response);
        
        if (response.success) {
          // 토큰을 localStorage에 저장
          if (response.token) {
            localStorage.setItem('authToken', response.token);
          }
          
          alert(response.message);
          
          // returnUrl이 있으면 해당 URL로, 없으면 대시보드로 이동
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl], { replaceUrl: true });
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('로그인 오류:', err);
        this.errorMessage = '로그인 중 오류가 발생했습니다.';
      }
    });
  }

  // 테스트용 계정 정보 표시
  getTestAccounts(): any[] {
    return [
      { userId: 'admin', password: 'admin123', description: '관리자 계정' },
      { userId: 'user1', password: 'password1', description: '일반 사용자 1' },
      { userId: 'user2', password: 'password2', description: '일반 사용자 2' }
    ];
  }
}
