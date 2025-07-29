import {Component} from "@angular/core";
import {AuthService} from "../../service/auth.service";
import {RegisterResponse} from "../../models/auth.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  styleUrls: ['./register.component.css'],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  userId = '';
  username = '';
  password = '';
  email = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (!this.userId || !this.username || !this.password || !this.email) {
      this.errorMessage = '모든 필드를 입력해주세요.';
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = '올바른 이메일 형식을 입력해주세요.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.userId, this.username, this.password, this.email)
      .subscribe({
        next: (response: RegisterResponse) => {
          this.loading = false;
          console.log('회원가입 응답:', response);
          
          if (response.success) {
            this.successMessage = response.message;
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('회원가입 오류:', err);
          this.errorMessage = '회원가입 중 오류가 발생했습니다.';
        }
      });
  }
}
