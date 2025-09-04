
# GreenMate Frontend 기능 명세서

본 문서는 **GreenMate 모바일 웹(인앱 웹뷰)** 프론트엔드 기능 명세서이다.  
사용 도구: Cursor AI / Node.js / Next.js / React  
디자인: LifePlus 스타일 (로고, 전용 폰트, 아이콘 포함 사용 가능)

---

## 0) 범위 요약
- **핵심 목적**: 도보 경로 3옵션 제공(최단/표준/최장), 실시간 네비, 이탈 감지/재탐색, 완료/기록(거리·시간·걸음수)
- **추가 메뉴**: SNS(피드), 걷깅(도보 가이드), 포인트(적립 내역), MyPage(설정/프로필)
- **비기능 목표**: GPS 2–5초 업데이트, 지도 렌더 ≤3초, 경로 API ≤5초, 앱 실행 ≤3초, iOS14+/Android7+ 대응

---

## 1) 정보 구조(IA) & 라우팅
- 상단 탭(navbar): **SNS | 걷깅 | 포인트 | MyPage**
- 라우트:
  - `/sns` – 피드형 SNS
  - `/walk` – 도보 가이드(네비)
  - `/points` – 포인트 현황/내역
  - `/mypage` – 설정/프로필

---

## 2) 상단 탭 스타일 (LifePlus 자산 활용)
- **LifePlus 로고**: 좌측 상단에 정식 로고 배치
- **전용 폰트**: LifePlus 공식 서체 사용
- **아이콘**: LifePlus 공식 아이콘 세트 사용
- **레이아웃**: LifePlus 웹과 동일한 상단 메뉴바 스타일
- **컬러**: LifePlus 메인 팔레트 그대로 적용 (Primary Green #00A67E 등)
- **활성 표시**: 하단 언더라인 + 폰트 컬러 강조
- **높이**: 모바일 전용 56–60px, Safe Area 대응

---

## 3) SNS (피드)
- 카드형 포스트 무한 스크롤 (텍스트/이미지/경로 공유)
- 좋아요, 댓글, 신고, 공유
- 글 작성 (텍스트 500자, 이미지 4장, 경로 공유)
- API: `/api/feed`, `/api/comments`, `/api/like`, `/api/report`
- 데이터 모델: `Post { id, author, type, content, images, routeShare, liked, likeCount, commentCount, createdAt }`

---

## 4) 걷깅 (도보 가이드)
- 출발/도착 입력 (자동완성)
- **3가지 경로 옵션**: 최단 / 표준 / 최장 (거리, 시간, 걸음수)
- 네비게이션: Polyline 지도, 진행률, 이탈 감지(≥40m → 재탐색 팝업)
- 완료/요약: 거리, 시간, 걸음수 → 로컬 저장, SNS 공유 가능
- API: `/api/route` (프록시로 외부 지도 API 호출)

---

## 5) 포인트
- 요약 카드: 보유 포인트, 주간/월간 적립
- 적립 규칙 안내 (정적/운영 연동)
- 내역: 적립/사용/보너스, 걷깅 기록 연결
- API: `/api/points/balance`, `/api/points/history`, `/api/points/earn`

---

## 6) MyPage
- 프로필: 닉네임, 아바타, 키/몸무게
- 설정: 권한 확인, 지도 설정, 캐시 관리
- 기록 접근: 걷깅 히스토리, 공유 포스트
- 개인정보/약관/오픈소스 안내

---

## 7) 하이브리드 브릿지 (앱 ↔ 웹)
`window.GreenmateBridge`
- 메서드: `getLocation`, `watchLocation`, `getSteps`, `watchSteps`, `requestLocationPermission`
- 이벤트: `onAppEvent('foreground'|'background'|'permissionChanged')`

---

## 8) 데이터 모델 (예시)
```ts
type TripRecord = {
  id: string;
  startedAt: number;
  endedAt: number;
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  chosenRoute: 'short'|'recommended'|'morewalk';
  distanceMeters: number;
  durationSeconds: number;
  steps: number;
  polyline: [number, number][];
};
```

---

## 9) 성능/품질
- TTI ≤ 3s, 지도 첫 렌더 ≤ 3s, 경로 API ≤ 5s
- 탭 전환 ≤ 300ms, 언더라인 애니메이션 150ms
- 오프라인 모드 지원: SNS 캐시, 걷깅 기록 로컬 저장, 포인트 임시 적립

---

## 10) QA 체크리스트
- [ ] LifePlus 로고/폰트/아이콘 정상 적용
- [ ] SNS 피드 로딩 ≤3s, 무한 스크롤 매끄럽게 동작
- [ ] 걷깅 3옵션 5s 내 표시, 이탈 감지 정확도 ≥95%
- [ ] 포인트 임시 적립 → 서버 확정 반영
- [ ] MyPage 권한 상태 즉시 갱신
- [ ] iOS/Android 웹뷰 Safe Area 정상 대응

---

## 11) 보안/프라이버시
- 위치/걸음수 데이터는 서버 미저장(로컬 관리)
- 이미지 업로드 시 메타데이터 제거
- API 키는 서버 프록시로 보호

---

## 12) 차후 확장 고려
- SNS 알림, 포인트 사용처(쇼핑/기부), 소셜 랭킹
- 음성 안내, 다크 모드, 백그라운드 활동 트래킹

---

**작성 완료: GreenMate_FrontEnd.md**
