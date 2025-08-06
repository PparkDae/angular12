# Register Component 상세 분석

## 📋 개요
`RegisterComponent`는 새로운 사용자 등록을 담당하는 컴포넌트입니다. 회원가입 폼, 유효성 검사, 이메일 형식 검증, 에러 처리 기능을 제공합니다.

## 🏗️ 컴포넌트 구조

### 의존성 주입
```typescript
constructor(
  private authService: AuthService,  // 인증 서비스
  private router: Router            // 라우터
) { }
```

### 주요 속성
```typescript
// 폼 데이터
userId: string = '';
username: string = '';
password: string = '';
email: string = '';

// UI 상태
loading: boolean = false;
error: string = '';
showPassword: boolean = false;

// 유효성 검사 상태
isValidEmail: boolean = true;
```

## 🔄 생명주기 메서드

### ngOnInit()
컴포넌트 초기화 시 실행되는 메서드입니다.

```typescript
ngOnInit(): void {
  // 이미 로그인된 사용자가 있다면 대시보드로 리다이렉트
  if (this.authService.isLoggedIn()) {
    this.router.navigate(['/dashboard']);
  }
}
```

## 🔐 회원가입 로직

### 회원가입 처리
```typescript
onRegister(): void {
  // 유효성 검사
  if (!this.validateForm()) {
    return;
  }

  this.loading = true;
  this.error = '';

  const userData = {
    userId: this.userId,
    username: this.username,
    password: this.password,
    email: this.email
  };

  this.authService.register(userData).subscribe({
    next: (response) => {
      console.log('회원가입 성공:', response);
      this.loading = false;
      
      // 회원가입 성공 시 로그인 페이지로 이동
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      this.router.navigate(['/login']);
    },
    error: (error) => {
      console.error('회원가입 실패:', error);
      this.loading = false;
      this.error = error.message || '회원가입에 실패했습니다.';
    }
  });
}
```

### 폼 유효성 검사
```typescript
private validateForm(): boolean {
  // 필수 필드 검증
  if (!this.userId || !this.username || !this.password || !this.email) {
    this.error = '모든 필드를 입력해주세요.';
    return false;
  }

  // 사용자 ID 길이 검증
  if (this.userId.length < 3) {
    this.error = '사용자 ID는 3자 이상이어야 합니다.';
    return false;
  }

  // 비밀번호 길이 검증
  if (this.password.length < 6) {
    this.error = '비밀번호는 6자 이상이어야 합니다.';
    return false;
  }

  // 이메일 형식 검증
  if (!this.isValidEmail) {
    this.error = '올바른 이메일 형식을 입력해주세요.';
    return false;
  }

  return true;
}
```

### 이메일 형식 검증
```typescript
validateEmail(): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  this.isValidEmail = emailRegex.test(this.email);
  
  if (!this.isValidEmail && this.email) {
    this.error = '올바른 이메일 형식을 입력해주세요.';
  } else {
    this.error = '';
  }
}
```

## 🎨 UI 인터랙션

### 비밀번호 표시/숨김 토글
```typescript
togglePasswordVisibility(): void {
  this.showPassword = !this.showPassword;
}
```

### 입력 필드 초기화
```typescript
clearForm(): void {
  this.userId = '';
  this.username = '';
  this.password = '';
  this.email = '';
  this.error = '';
  this.showPassword = false;
  this.isValidEmail = true;
}
```

### 엔터 키 처리
```typescript
onKeyPress(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    this.onRegister();
  }
}
```

## 📝 템플릿 구조

### 주요 HTML 요소들
```html
<!-- 회원가입 폼 -->
<form (ngSubmit)="onRegister()" class="register-form">
  <!-- 사용자 ID 입력 -->
  <div class="form-group">
    <label for="userId">사용자 ID *</label>
    <input 
      type="text" 
      id="userId" 
      name="userId" 
      [(ngModel)]="userId" 
      (keypress)="onKeyPress($event)"
      placeholder="사용자 ID를 입력하세요 (3자 이상)"
      required
      minlength="3"
    >
  </div>

  <!-- 사용자명 입력 -->
  <div class="form-group">
    <label for="username">사용자명 *</label>
    <input 
      type="text" 
      id="username" 
      name="username" 
      [(ngModel)]="username" 
      (keypress)="onKeyPress($event)"
      placeholder="사용자명을 입력하세요"
      required
    >
  </div>

  <!-- 비밀번호 입력 -->
  <div class="form-group">
    <label for="password">비밀번호 *</label>
    <div class="password-input">
      <input 
        [type]="showPassword ? 'text' : 'password'" 
        id="password" 
        name="password" 
        [(ngModel)]="password" 
        (keypress)="onKeyPress($event)"
        placeholder="비밀번호를 입력하세요 (6자 이상)"
        required
        minlength="6"
      >
      <button 
        type="button" 
        class="password-toggle" 
        (click)="togglePasswordVisibility()"
        [title]="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
      >
        <i class="fas" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
      </button>
    </div>
  </div>

  <!-- 이메일 입력 -->
  <div class="form-group">
    <label for="email">이메일 *</label>
    <input 
      type="email" 
      id="email" 
      name="email" 
      [(ngModel)]="email" 
      (blur)="validateEmail()"
      (keypress)="onKeyPress($event)"
      placeholder="이메일을 입력하세요"
      required
      [class.invalid]="!isValidEmail && email"
    >
    <div *ngIf="!isValidEmail && email" class="validation-message">
      올바른 이메일 형식을 입력해주세요.
    </div>
  </div>

  <!-- 에러 메시지 -->
  <div *ngIf="error" class="error-message">
    <i class="fas fa-exclamation-triangle"></i>
    {{ error }}
  </div>

  <!-- 회원가입 버튼 -->
  <button 
    type="submit" 
    class="btn btn-primary register-btn" 
    [disabled]="loading || !userId || !username || !password || !email || !isValidEmail"
  >
    <i class="fas fa-user-plus"></i>
    {{ loading ? '회원가입 중...' : '회원가입' }}
  </button>
</form>

<!-- 로그인 링크 -->
<div class="login-link">
  <p>이미 계정이 있으신가요? <a routerLink="/login">로그인하기</a></p>
</div>
```

## 🎯 유효성 검사

### 클라이언트 사이드 검증
```typescript
// 필수 필드 검증
if (!this.userId || !this.username || !this.password || !this.email) {
  this.error = '모든 필드를 입력해주세요.';
  return false;
}

// 사용자 ID 길이 검증
if (this.userId.length < 3) {
  this.error = '사용자 ID는 3자 이상이어야 합니다.';
  return false;
}

// 비밀번호 길이 검증
if (this.password.length < 6) {
  this.error = '비밀번호는 6자 이상이어야 합니다.';
  return false;
}

// 이메일 형식 검증
if (!this.isValidEmail) {
  this.error = '올바른 이메일 형식을 입력해주세요.';
  return false;
}
```

### 이메일 정규식 검증
```typescript
validateEmail(): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  this.isValidEmail = emailRegex.test(this.email);
  
  if (!this.isValidEmail && this.email) {
    this.error = '올바른 이메일 형식을 입력해주세요.';
  } else {
    this.error = '';
  }
}
```

## 🔄 데이터 흐름

### 회원가입 프로세스
```
1. 사용자 입력 → 폼 데이터 바인딩
2. 유효성 검사 → 필수 필드, 형식 확인
3. 로딩 상태 활성화 → UI 피드백
4. AuthService 호출 → 서버 등록 요청
5. 응답 처리 → 성공/실패 분기
6. 성공 시 → 로그인 페이지 라우팅
7. 실패 시 → 에러 메시지 표시
```

### 이메일 검증 프로세스
```
1. 이메일 입력 → blur 이벤트 발생
2. 정규식 검증 → 형식 확인
3. 유효성 상태 업데이트 → UI 반영
4. 에러 메시지 표시/숨김 → 사용자 피드백
```

## 🎨 UI/UX 특징

### 반응형 디자인
- 모바일 친화적인 레이아웃
- 터치 친화적인 버튼 크기
- 적절한 간격과 여백

### 사용자 피드백
- 실시간 유효성 검사
- 이메일 형식 검증
- 비밀번호 표시/숨김 토글
- 로딩 상태 표시
- 명확한 에러 메시지

### 접근성
- 적절한 라벨과 placeholder
- 키보드 네비게이션 지원
- 시각적 피드백 (아이콘, 색상)
- 필수 필드 표시 (*)

## 🔒 보안 고려사항

### 클라이언트 사이드
- 비밀번호 필드 타입 토글
- 입력 데이터 검증
- 이메일 형식 검증
- 에러 메시지 처리

### 서버 통신
- AuthService를 통한 등록
- 에러 핸들링
- 사용자 데이터 전송

## 📁 관련 파일

- **컴포넌트**: `src/app/components/register/register.component.ts`
- **템플릿**: `src/app/components/register/register.component.html`
- **스타일**: `src/app/components/register/register.component.css`
- **서비스**: `src/app/service/auth.service.ts`
- **가드**: `src/app/guards/login.guard.ts`

## 🚀 핵심 특징

1. **양방향 데이터 바인딩**: `[(ngModel)]`을 통한 실시간 폼 동기화
2. **실시간 유효성 검사**: 이메일 형식, 필드 길이 등 즉시 검증
3. **반응형 UI**: 다양한 화면 크기에 대응
4. **사용자 친화적**: 비밀번호 토글, 명확한 에러 메시지
5. **접근성**: 키보드 네비게이션과 시각적 피드백
6. **보안**: 적절한 입력 검증과 에러 처리
7. **네비게이션**: 로그인 페이지로의 자연스러운 이동 