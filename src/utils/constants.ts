// 앱 상수 정의

export const APP_CONFIG = {
  NAME: 'GreenMate',
  VERSION: '1.0.0',
  DESCRIPTION: '건강한 걷기, 지속가능한 미래',
} as const;

export const ROUTE_TYPES = {
  SHORT: 'short',
  RECOMMENDED: 'recommended',
  MOREWALK: 'morewalk',
} as const;

export const ROUTE_TYPE_LABELS = {
  [ROUTE_TYPES.SHORT]: '최단 경로',
  [ROUTE_TYPES.RECOMMENDED]: '추천 경로',
  [ROUTE_TYPES.MOREWALK]: '더 걷기',
} as const;

export const ROUTE_TYPE_DESCRIPTIONS = {
  [ROUTE_TYPES.SHORT]: '가장 빠른 경로',
  [ROUTE_TYPES.RECOMMENDED]: '균형잡힌 경로',
  [ROUTE_TYPES.MOREWALK]: '운동량을 위한 경로',
} as const;

export const POINT_RULES = {
  PER_KM: 10, // km당 포인트
  DAILY_GOAL_BONUS: 30, // 일일 목표 달성 보너스
  FIRST_WALK_BONUS: 100, // 첫 걷기 보너스
  DAILY_STEP_GOAL: 10000, // 일일 걸음수 목표
} as const;

export const NAVIGATION_CONFIG = {
  GPS_UPDATE_INTERVAL: 2000, // 2초
  ROUTE_DEVIATION_THRESHOLD: 40, // 40m
  MAP_ZOOM_LEVEL: 15,
  POLYLINE_COLOR: '#00A67E',
  POLYLINE_WIDTH: 4,
} as const;

export const STORAGE_KEYS = {
  TRIP_RECORDS: 'greenmate_trip_records',
  USER_PROFILE: 'greenmate_user_profile',
  SETTINGS: 'greenmate_settings',
  CACHE: 'greenmate_cache',
} as const;

export const API_ENDPOINTS = {
  FEED: '/api/feed',
  COMMENTS: '/api/comments',
  LIKE: '/api/like',
  REPORT: '/api/report',
  ROUTE: '/api/route',
  POINTS_BALANCE: '/api/points/balance',
  POINTS_HISTORY: '/api/points/history',
  POINTS_EARN: '/api/points/earn',
} as const;

export const PERFORMANCE_TARGETS = {
  TTI: 3000, // Time to Interactive (ms)
  MAP_RENDER: 3000, // 지도 렌더링 (ms)
  ROUTE_API: 5000, // 경로 API 응답 (ms)
  TAB_SWITCH: 300, // 탭 전환 (ms)
  ANIMATION: 150, // 애니메이션 (ms)
} as const;

export const SUPPORTED_PLATFORMS = {
  IOS_MIN_VERSION: '14.0',
  ANDROID_MIN_API: 24,
} as const;

export const SCREEN_SIZES = {
  MIN_WIDTH: 320, // 4.7인치
  MAX_WIDTH: 414, // 6.7인치
} as const;
