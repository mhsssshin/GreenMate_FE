// 유틸리티 헬퍼 함수들

import { Location, RouteType } from '@/types';
import { ROUTE_TYPE_LABELS, ROUTE_TYPE_DESCRIPTIONS } from './constants';

/**
 * 두 지점 간의 거리 계산 (Haversine 공식)
 */
export function calculateDistance(
  point1: Location,
  point2: Location
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
    Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 각도를 라디안으로 변환
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 거리를 걸음수로 변환 (평균 보폭 0.7m 기준)
 */
export function distanceToSteps(distanceKm: number): number {
  return Math.round(distanceKm * 1000 / 0.7);
}

/**
 * 걸음수를 거리로 변환
 */
export function stepsToDistance(steps: number): number {
  return (steps * 0.7) / 1000;
}

/**
 * 시간을 분:초 형식으로 포맷
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 거리를 적절한 단위로 포맷
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * 시간을 상대적 형식으로 포맷 (예: "2분 전")
 */
export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * 경로 타입에 따른 라벨 반환
 */
export function getRouteTypeLabel(type: RouteType): string {
  return ROUTE_TYPE_LABELS[type] || '';
}

/**
 * 경로 타입에 따른 설명 반환
 */
export function getRouteTypeDescription(type: RouteType): string {
  return ROUTE_TYPE_DESCRIPTIONS[type] || '';
}

/**
 * 포인트 계산 (거리 기반)
 */
export function calculatePoints(distanceKm: number): number {
  return Math.round(distanceKm * 10); // km당 10포인트
}

/**
 * 걸음수 기반 칼로리 계산 (대략적)
 */
export function calculateCalories(steps: number, weightKg: number = 70): number {
  // 평균적으로 1보당 0.04칼로리 소모 (70kg 기준)
  return Math.round(steps * 0.04 * (weightKg / 70));
}

/**
 * 탄소 발자국 계산 (대략적)
 */
export function calculateCarbonFootprint(distanceKm: number): number {
  // 자동차 대비 탄소 절약량 (g CO2/km)
  const carEmission = 120; // 자동차 1km당 CO2 배출량
  return Math.round(distanceKm * carEmission);
}

/**
 * 디바이스가 모바일인지 확인
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * iOS Safari인지 확인
 */
export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 스로틀 함수
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 클래스명 조합 유틸리티
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * 로컬 스토리지 사용량 계산
 */
export function getStorageUsage(): { used: number; total: number } {
  if (typeof window === 'undefined') return { used: 0, total: 0 };
  
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('greenmate_')) {
      const value = localStorage.getItem(key);
      if (value) {
        used += value.length;
      }
    }
  }
  
  return { used, total: 5 * 1024 * 1024 }; // 5MB
}
