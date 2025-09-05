// GreenMate 앱의 핵심 데이터 타입 정의

export type RouteType = 'short' | 'recommended' | 'morewalk';

export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface RouteOption {
  type: RouteType;
  distance: number; // km
  duration: number; // minutes
  steps: number;
  polyline: [number, number][];
}

export interface TripRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  origin: Location;
  destination: Location;
  chosenRoute: RouteType;
  distanceMeters: number;
  durationSeconds: number;
  steps: number;
  polyline: [number, number][];
}

export interface Post {
  id: string;
  author: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  type: 'text' | 'image' | 'route';
  content: string;
  images?: string[];
  routeShare?: TripRecord;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  type: 'earn' | 'use' | 'bonus';
  amount: number;
  description: string;
  tripRecordId?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar?: string;
  height?: number; // cm
  weight?: number; // kg
  totalDistance: number; // km
  totalSteps: number;
  totalPoints: number;
}

// 하이브리드 브릿지 인터페이스
export interface GreenmateBridge {
  getLocation(): Promise<Location>;
  watchLocation(callback: (location: Location) => void): () => void;
  getSteps(): Promise<number>;
  watchSteps(callback: (steps: number) => void): () => void;
  requestLocationPermission(): Promise<boolean>;
}

// 전역 윈도우 객체 확장
declare global {
  interface Window {
    GreenmateBridge?: GreenmateBridge;
  }
}

// 앱 이벤트 타입
export type AppEventType = 'foreground' | 'background' | 'permissionChanged';

export interface AppEvent {
  type: AppEventType;
  data?: any;
}

// 회원가입 관련 타입
export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  height: number;
  weight: number;
}

export interface SignupResponse {
  accessToken: string;
  tokenType: string;
  user: {
    id: number;
    email: string;
    nickname: string;
    gender: 'MALE' | 'FEMALE';
    age: number;
    height: number;
    weight: number;
    role: string;
    createdAt: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: {
    id: number;
    email: string;
    nickname: string;
    gender: 'MALE' | 'FEMALE';
    age: number;
    height: number;
    weight: number;
    role: string;
    createdAt: string;
  };
}