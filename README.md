# GreenMate Frontend

GreenMate는 일상적인 이동을 의미있는 건강 활동으로 전환하는 도보 네비게이션 웹앱입니다.

## 🚀 프로젝트 개요

- **목적**: 건강한 라이프스타일과 환경 보호를 동시에 추구할 수 있는 실용적 솔루션 제공
- **기술 스택**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **플랫폼**: 모바일 웹 (인앱 웹뷰 지원)
- **디자인**: LifePlus 브랜드 가이드라인 적용

## ✨ 주요 기능

### 1. SNS (피드)
- 카드형 포스트 무한 스크롤
- 걷기 기록 공유
- 좋아요, 댓글, 공유 기능

### 2. 걷깅 (도보 가이드)
- 3가지 경로 옵션 제공 (최단/표준/최장)
- GPS 기반 실시간 네비게이션
- 경로 이탈 감지 및 재탐색
- 이동 완료 후 기록 저장

### 3. 포인트
- 걷기 활동 기반 포인트 적립
- 적립 규칙 안내
- 포인트 내역 조회

### 4. MyPage
- 프로필 관리
- 걷기 기록 및 통계
- 앱 설정 및 권한 관리

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks + Context
- **Storage**: LocalStorage (로컬 데이터 관리)
- **Bridge**: 하이브리드 앱 연동 인터페이스

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── sns/               # SNS 피드 페이지
│   ├── walk/              # 걷깅 네비게이션 페이지
│   ├── points/            # 포인트 페이지
│   ├── mypage/            # 마이페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지 (리다이렉트)
├── components/            # 재사용 가능한 컴포넌트
│   └── Navbar.tsx         # 상단 네비게이션
├── lib/                   # 라이브러리 및 유틸리티
│   ├── bridge.ts          # 하이브리드 브릿지
│   └── storage.ts         # 로컬 스토리지 관리
├── types/                 # TypeScript 타입 정의
│   └── index.ts           # 공통 타입
├── utils/                 # 헬퍼 함수
│   ├── constants.ts       # 앱 상수
│   └── helpers.ts         # 유틸리티 함수
└── styles/                # 스타일 파일
    └── globals.css        # 전역 스타일
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 📱 하이브리드 앱 연동

GreenMate는 네이티브 앱의 웹뷰에서 실행되도록 설계되었습니다.

### 브릿지 인터페이스

```typescript
// 전역 브릿지 객체
window.GreenmateBridge = {
  getLocation(): Promise<Location>
  watchLocation(callback: (location: Location) => void): () => void
  getSteps(): Promise<number>
  watchSteps(callback: (steps: number) => void): () => void
  requestLocationPermission(): Promise<boolean>
}
```

### 앱 이벤트

```typescript
// 앱 생명주기 이벤트
onAppEvent('foreground' | 'background' | 'permissionChanged', callback)
```

## 🎨 디자인 시스템

### LifePlus 브랜드 컬러

- **Primary Green**: `#00A67E`
- **Secondary Colors**: 그레이 스케일 팔레트
- **Typography**: Inter 폰트 패밀리

### 컴포넌트 스타일

```css
/* 주요 컴포넌트 클래스 */
.btn-primary     /* 메인 버튼 */
.btn-secondary   /* 보조 버튼 */
.card           /* 카드 컨테이너 */
.navbar-tab     /* 네비게이션 탭 */
```

## 📊 성능 목표

- **TTI (Time to Interactive)**: ≤ 3초
- **지도 렌더링**: ≤ 3초
- **경로 API 응답**: ≤ 5초
- **탭 전환**: ≤ 300ms
- **애니메이션**: 150ms

## 🔧 설정

### 환경 변수

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MAP_API_KEY=your_map_api_key
```

### Tailwind 설정

LifePlus 브랜드 컬러와 커스텀 스타일이 `tailwind.config.js`에 정의되어 있습니다.

## 📝 API 엔드포인트

```typescript
// 예정된 API 엔드포인트
/api/feed              # SNS 피드
/api/comments          # 댓글
/api/like              # 좋아요
/api/route             # 경로 검색
/api/points/balance    # 포인트 잔액
/api/points/history    # 포인트 내역
```

## 🧪 테스트

```bash
# 테스트 실행 (추후 구현 예정)
npm test

# E2E 테스트 (추후 구현 예정)
npm run test:e2e
```

## 📦 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### Docker 배포

```dockerfile
# Dockerfile (추후 구현 예정)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 LifePlus의 내부 프로젝트입니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 개발팀에 문의해주세요.

---

**GreenMate** - 건강한 걷기, 지속가능한 미래 🌱
