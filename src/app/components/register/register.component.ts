import {Component} from "@angular/core";
import {AuthService} from "../../service/auth.service";
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
  email= '';

  constructor(private authService: AuthService
  , private router: Router) {}

  onRegister() {
    this.authService.register(this.userId, this.username, this.password, this.email)
      .subscribe({
        next: (res) => {
          console.log('회원가입 성공', res);
          confirm('회원가입을 축하드립니다.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('회원가입 실패', err);
          alert('회원가입 실패');
        }
      });
  }
}
