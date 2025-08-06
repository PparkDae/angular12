# Angular 12 실시간 대시보드 프로젝트

## 📋 프로젝트 개요

이 프로젝트는 Angular 12를 기반으로 한 실시간 대시보드 애플리케이션입니다. 실시간 트래픽 모니터링, 사용자 통계, 매출 추적, 그리고 다양한 시각적 효과를 제공합니다.

## ✨ 주요 기능

### 🎯 실시간 모니터링
- **실시간 트래픽 차트**: 60개 데이터 포인트로 실시간 트래픽 추적
- **활성 사용자 모니터링**: 실시간 활성 사용자 수 추적
- **매출 추적**: 실시간 매출 데이터 시각화
- **24시간 형식**: 24시간 형식으로 시간 표시

### 📊 통계 카드
- **실시간 트래픽**: 현재 트래픽 값 표시
- **활성 사용자**: 현재 활성 사용자 수 표시
- **총 사용자**: 활성 사용자 누적치 표시
- **총 매출**: 누적 매출액 표시

### 🚨 경고 시스템
- **트래픽 경고**: 50 이상 시 빨간색 번쩍임 효과
- **활성 사용자 경고**: 50 이상 시 빨간색 번쩍임 효과
- **매출 달성**: 천만원 이상 시 파란색 번쩍임 효과

### 🎨 시각적 효과
- **룰렛 애니메이션**: 숫자가 부드럽게 올라가는 효과
- **툴팁 시스템**: 마우스 오버 시 상세 정보 표시
- **반응형 디자인**: 다양한 화면 크기에 대응

## 🛠️ 기술 스택

- **Frontend**: Angular 12
- **차트 라이브러리**: Chart.js
- **스타일링**: CSS3 (Flexbox, Grid)
- **애니메이션**: Angular Animations
- **아이콘**: Font Awesome

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
ng serve --port 4201 --open
```

### 3. 프로덕션 빌드
```bash
ng build --configuration production
```

## 🏗️ 프로젝트 구조

```
angular12/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/          # 대시보드 컴포넌트
│   │   │   ├── login/             # 로그인 컴포넌트
│   │   │   ├── register/          # 회원가입 컴포넌트
│   │   │   └── main-page/         # 메인 페이지 컴포넌트
│   │   ├── service/
│   │   │   ├── auth.service.ts    # 인증 서비스
│   │   │   ├── dashboard.service.ts # 대시보드 서비스
│   │   │   ├── logout.service.ts  # 로그아웃 서비스
│   │   │   ├── animation.service.ts # 애니메이션 서비스
│   │   │   ├── chart.service.ts   # 차트 서비스
│   │   │   ├── data-generation.service.ts # 데이터 생성 서비스
│   │   │   └── dark-mode.service.ts # 다크모드 서비스
│   │   ├── models/
│   │   │   ├── user.model.ts      # 사용자 모델
│   │   │   ├── auth.model.ts      # 인증 모델
│   │   │   ├── dashboard.model.ts # 대시보드 모델
│   │   │   └── dashboard.types.ts # 대시보드 타입 정의
│   │   ├── constants/
│   │   │   └── dashboard.constants.ts # 대시보드 상수
│   │   └── guards/
│   │       ├── auth.guard.ts      # 인증 가드
│   │       └── login.guard.ts     # 로그인 가드
│   └── assets/
├── docs/
│   └── components/                # 컴포넌트 상세 문서
└── package.json
```

## 📚 컴포넌트 상세 설명

각 컴포넌트의 상세한 코드 흐름과 구조를 확인할 수 있습니다:

- <a href="docs/components/dashboard-component.md" target="_blank" rel="noopener noreferrer">**Dashboard Component**</a> - 실시간 데이터 모니터링과 시각화를 담당하는 핵심 컴포넌트
- <a href="docs/components/login-component.md" target="_blank" rel="noopener noreferrer">**Login Component**</a> - 사용자 인증을 담당하는 로그인 컴포넌트
- <a href="docs/components/register-component.md" target="_blank" rel="noopener noreferrer">**Register Component**</a> - 새로운 사용자 등록을 담당하는 회원가입 컴포넌트
- <a href="docs/components/main-page-component.md" target="_blank" rel="noopener noreferrer">**Main Page Component**</a> - 로그인 후 접근하는 메인 페이지 컴포넌트
- <a href="docs/components/app-component.md" target="_blank" rel="noopener noreferrer">**App Component**</a> - Angular 애플리케이션의 루트 컴포넌트

## 🎮 사용법

### 대시보드 접근
1. 로그인 페이지에서 사용자 인증
2. 대시보드 페이지로 자동 이동
3. 실시간 데이터 모니터링 시작

### 시간 단위 변경
- **초단위**: 1초마다 업데이트 (60초 표시)
- **분단위**: 1분마다 업데이트 (60분 표시)
- **시단위**: 1시간마다 업데이트 (60시간 표시)

### 실시간 제어
- **일시정지/재개**: 실시간 업데이트 제어
- **자동 스크롤**: 최신 데이터 자동 표시

## 📈 데이터 시뮬레이션

### 실시간 트래픽
- **범위**: 40-80 트래픽
- **업데이트**: 선택된 시간 단위에 따라
- **경고**: 50 이상 시 빨간색 경고

### 활성 사용자
- **비율**: 트래픽의 70-100%
- **경고**: 50 이상 시 빨간색 경고
- **누적**: 총 사용자 계산에 사용

### 매출 데이터
- **범위**: 1만원 ~ 3만원
- **누적**: 총 매출에 추가
- **경고**: 천만원 이상 시 파란색 경고

## 🎨 시각적 효과 상세

### 룰렛 애니메이션
```css
@keyframes numberRoll {
  0% { transform: translateY(-8px) scale(0.98); opacity: 0.8; }
  50% { transform: translateY(1px) scale(1.02); opacity: 0.9; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
```

### 경고 효과
- **빨간색 경고**: 트래픽/활성 사용자 50 이상
- **파란색 경고**: 매출 천만원 이상
- **애니메이션**: 1초 주기로 크기 변화

### 툴팁 시스템
- **마우스 오버**: 상세 정보 표시
- **경고 메시지**: 조건 만족 시 자동 표시
- **포맷팅**: 숫자 천 단위 구분

## 🔧 개발 가이드

### 컴포넌트 추가
```bash
ng generate component components/new-component
```

### 서비스 추가
```bash
ng generate service service/new-service
```

### 가드 추가
```bash
ng generate guard guards/new-guard
```

### 모델 정의
```typescript
export interface NewModel {
  id: number;
  name: string;
  // 추가 속성들
}
```

## 🚀 배포

### 1. 프로덕션 빌드
```bash
ng build --configuration production
```

### 2. 배포 파일 확인
```bash
ls dist/angular12/
```

### 3. 웹 서버에 배포
- `dist/angular12/` 폴더의 내용을 웹 서버에 업로드
- Angular Router를 사용하므로 서버에서 SPA 설정 필요

## 🔒 보안

### 인증 시스템
- **JWT 토큰**: 로컬 스토리지에 저장
- **가드 시스템**: 라우트 보호
- **자동 로그아웃**: 토큰 만료 시

### 데이터 보안
- **모의 데이터**: 실제 API 대신 하드코딩된 데이터 사용
- **클라이언트 사이드**: 모든 로직이 프론트엔드에서 처리

## 🐛 문제 해결

### 포트 충돌
```bash
ng serve --port 4201
```

### 차트 렌더링 오류
- 브라우저 새로고침
- 개발자 도구에서 캐시 삭제

### 애니메이션 충돌
- 컴포넌트 재로드
- 브라우저 재시작

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Angular 12 실시간 대시보드** - 실시간 데이터 모니터링의 새로운 경험을 제공합니다! 🚀
