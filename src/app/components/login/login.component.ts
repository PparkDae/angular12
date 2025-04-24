import {AuthService} from "../../service/auth.service";
import {Component} from "@angular/core";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  userId = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.userId, this.password).subscribe({
      next: (res: any) => {
        console.log(res);
        alert('로그인 성공');
        this.router.navigate(['/mainPage'])
      },
      error: (err) => {
        console.error(err);
        alert('아이디가 존재하지 않거나 비밀번호가 맞지 않습니다.');
      }
    });
  }
}
