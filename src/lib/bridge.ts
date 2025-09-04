// 하이브리드 브릿지 인터페이스 구현
import { GreenmateBridge, Location, AppEventType, AppEvent } from '@/types';

class BridgeManager {
  private bridge: GreenmateBridge | null = null;
  private eventListeners: Map<AppEventType, Function[]> = new Map();

  constructor() {
    this.initializeBridge();
  }

  private initializeBridge() {
    if (typeof window !== 'undefined' && window.GreenmateBridge) {
      this.bridge = window.GreenmateBridge;
    }
  }

  // 위치 관련 메서드
  async getCurrentLocation(): Promise<Location> {
    if (this.bridge) {
      return await this.bridge.getLocation();
    }
    
    // 웹 환경에서의 폴백 (Geolocation API 사용)
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분
        }
      );
    });
  }

  watchLocation(callback: (location: Location) => void): () => void {
    if (this.bridge) {
      return this.bridge.watchLocation(callback);
    }

    // 웹 환경에서의 폴백
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }

  // 걸음수 관련 메서드
  async getCurrentSteps(): Promise<number> {
    if (this.bridge) {
      return await this.bridge.getSteps();
    }
    
    // 웹 환경에서는 0 반환 (실제 걸음수는 앱에서만 제공)
    return 0;
  }

  watchSteps(callback: (steps: number) => void): () => void {
    if (this.bridge) {
      return this.bridge.watchSteps(callback);
    }

    // 웹 환경에서는 더미 데이터 제공
    const interval = setInterval(() => {
      callback(Math.floor(Math.random() * 100));
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }

  // 권한 관련 메서드
  async requestLocationPermission(): Promise<boolean> {
    if (this.bridge) {
      return await this.bridge.requestLocationPermission();
    }

    // 웹 환경에서의 폴백
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return permission.state === 'granted';
    } catch {
      return false;
    }
  }

  // 앱 이벤트 리스너
  onAppEvent(eventType: AppEventType, callback: (event: AppEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    listeners.push(callback);

    // 앱 환경에서 실제 이벤트 리스너 등록
    if (this.bridge && typeof window !== 'undefined') {
      window.addEventListener('message', (event) => {
        if (event.data.type === eventType) {
          callback(event.data);
        }
      });
    }

    // 웹 환경에서의 폴백 이벤트
    if (!this.bridge) {
      this.setupWebFallbackEvents(eventType, callback);
    }

    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  private setupWebFallbackEvents(eventType: AppEventType, callback: (event: AppEvent) => void) {
    switch (eventType) {
      case 'foreground':
      case 'background':
        document.addEventListener('visibilitychange', () => {
          callback({
            type: document.hidden ? 'background' : 'foreground',
          });
        });
        break;
      case 'permissionChanged':
        // 권한 변경 감지는 주기적으로 체크
        setInterval(async () => {
          const hasPermission = await this.requestLocationPermission();
          callback({
            type: 'permissionChanged',
            data: { hasPermission },
          });
        }, 30000);
        break;
    }
  }

  // 브릿지 상태 확인
  isAppEnvironment(): boolean {
    return this.bridge !== null;
  }

  // 브릿지 재초기화 (앱에서 웹뷰 로드 후)
  reinitialize() {
    this.initializeBridge();
  }
}

// 싱글톤 인스턴스
export const bridgeManager = new BridgeManager();

// 편의 함수들
export const getCurrentLocation = () => bridgeManager.getCurrentLocation();
export const watchLocation = (callback: (location: Location) => void) => bridgeManager.watchLocation(callback);
export const getCurrentSteps = () => bridgeManager.getCurrentSteps();
export const watchSteps = (callback: (steps: number) => void) => bridgeManager.watchSteps(callback);
export const requestLocationPermission = () => bridgeManager.requestLocationPermission();
export const onAppEvent = (eventType: AppEventType, callback: (event: AppEvent) => void) => bridgeManager.onAppEvent(eventType, callback);
export const isAppEnvironment = () => bridgeManager.isAppEnvironment();
