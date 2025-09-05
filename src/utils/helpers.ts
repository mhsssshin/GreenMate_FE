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
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
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

/**
 * 쿠키에서 값을 가져오는 함수
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * 현재 걸음 수를 쿠키에서 가져오는 함수
 */
export function getCurrentSteps(): number {
  // 쿠키에서 직접 걸음 수 추출
  const cookie = document.cookie;
  const match = cookie.match(/greenmate_steps=([^;]+)/);
  if (match) {
    const value = match[1];
    const stepsMatch = value.match(/steps=(\d+)/);
    return stepsMatch ? parseInt(stepsMatch[1], 10) : 0;
  }
  return 0;
}

/**
 * 쿠키에서 위치 정보를 가져오는 함수
 */
export function getLocationFromCookie(): { lat: number; lng: number } | null {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie;
  const match = cookie.match(/greenmate_steps=([^;]+)/);
  
  if (match) {
    const value = match[1];
    
    // lat과 lng 추출
    const latMatch = value.match(/lat=([^&]+)/);
    const lngMatch = value.match(/lng=([^&]+)/);
    
    if (latMatch && lngMatch) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lngMatch[1]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  }
  
  return null;
}

/**
 * Unsplash API를 이용한 이미지 검색
 */
export async function searchImages(query: string, count: number = 3): Promise<string[]> {
  try {
    // Unsplash API 키 (실제 사용시 환경변수로 관리)
    const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Unsplash API 호출 실패');
    }

    const data = await response.json();
    return data.results.map((photo: any) => photo.urls.regular);
  } catch (error) {
    console.error('이미지 검색 중 오류:', error);
    return [];
  }
}

/**
 * 검색어에 따른 기본 이미지 반환 (API 없이 사용)
 */
export function getDefaultImageForLocation(location: string): string {
  const locationImages: { [key: string]: string } = {
    '강남': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    '여의도': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    '한강': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    '북한산': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    '서울숲': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    '청계천': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    '인사동': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    '홍대': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    '명동': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    '이태원': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  };

  // 검색어에서 키워드 찾기
  for (const [keyword, imageUrl] of Object.entries(locationImages)) {
    if (location.includes(keyword)) {
      return imageUrl;
    }
  }

  // 기본 이미지 (걷기/산책 관련)
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
}