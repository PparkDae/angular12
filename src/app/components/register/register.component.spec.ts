import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        FormsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display an error message if any field is empty', () => {
    component.onRegister();
    expect(component.errorMessage).toBe('모든 필드를 입력해주세요.');
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should display an error message for invalid email format', () => {
    component.userId = 'testuser';
    component.username = 'Test User';
    component.password = 'password';
    component.email = 'invalid-email';
    component.onRegister();
    expect(component.errorMessage).toBe('올바른 이메일 형식을 입력해주세요.');
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should call authService.register and navigate on successful registration', fakeAsync(() => {
    const registerResponse = { success: true, message: 'Registration successful' };
    authService.register.and.returnValue(of(registerResponse));

    component.userId = 'testuser';
    component.username = 'Test User';
    component.password = 'password';
    component.email = 'test@example.com';
    component.onRegister();
    tick();

    expect(authService.register).toHaveBeenCalledWith('testuser', 'Test User', 'password', 'test@example.com');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.successMessage).toBe('Registration successful');
    expect(component.errorMessage).toBe('');
  }));

  it('should display an error message on failed registration', () => {
    const registerResponse = { success: false, message: 'User already exists' };
    authService.register.and.returnValue(of(registerResponse));

    component.userId = 'testuser';
    component.username = 'Test User';
    component.password = 'password';
    component.email = 'test@example.com';
    component.onRegister();

    expect(authService.register).toHaveBeenCalledWith('testuser', 'Test User', 'password', 'test@example.com');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('User already exists');
    expect(component.successMessage).toBe('');
  });
});