
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockActivatedRoute = {
    snapshot: {
      queryParams: {}
    }
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display an error message if userId or password is not provided', () => {
    component.userId = '';
    component.password = '';
    component.onLogin();
    expect(component.errorMessage).toBe('아이디와 비밀번호를 모두 입력해주세요.');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login and navigate on successful login', () => {
    const loginResponse = { success: true, token: 'test-token', message: '' };
    authService.login.and.returnValue(of(loginResponse));
    spyOn(localStorage, 'setItem');

    component.userId = 'admin';
    component.password = 'admin123';
    component.onLogin();

    expect(component.loading).toBe(false);
    expect(authService.login).toHaveBeenCalledWith('admin', 'admin123');
    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard'], { replaceUrl: true });
    expect(component.errorMessage).toBe('');
  });

  it('should display an error message on failed login', () => {
    const loginResponse = { success: false, message: 'Invalid credentials' };
    authService.login.and.returnValue(of(loginResponse));

    component.userId = 'wrong';
    component.password = 'wrong';
    component.onLogin();

    expect(component.loading).toBe(false);
    expect(authService.login).toHaveBeenCalledWith('wrong', 'wrong');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should display a generic error message on login error', () => {
    authService.login.and.returnValue(throwError(() => new Error('Server error')));

    component.userId = 'user';
    component.password = 'pass';
    component.onLogin();

    expect(component.loading).toBe(false);
    expect(authService.login).toHaveBeenCalledWith('user', 'pass');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('로그인 중 오류가 발생했습니다.');
  });
});
