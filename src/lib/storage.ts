// 로컬 스토리지 관리 유틸리티
import { TripRecord, UserProfile } from '@/types';

const STORAGE_KEYS = {
  TRIP_RECORDS: 'greenmate_trip_records',
  USER_PROFILE: 'greenmate_user_profile',
  SETTINGS: 'greenmate_settings',
  CACHE: 'greenmate_cache',
} as const;

// 제네릭 스토리지 헬퍼
class StorageManager {
  private isClient = typeof window !== 'undefined';

  private getItem<T>(key: string): T | null {
    if (!this.isClient) return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get item from storage: ${key}`, error);
      return null;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isClient) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item in storage: ${key}`, error);
    }
  }

  private removeItem(key: string): void {
    if (!this.isClient) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item from storage: ${key}`, error);
    }
  }

  // 여행 기록 관리
  getTripRecords(): TripRecord[] {
    return this.getItem<TripRecord[]>(STORAGE_KEYS.TRIP_RECORDS) || [];
  }

  saveTripRecord(record: TripRecord): void {
    const records = this.getTripRecords();
    records.push(record);
    this.setItem(STORAGE_KEYS.TRIP_RECORDS, records);
  }

  updateTripRecord(id: string, updates: Partial<TripRecord>): void {
    const records = this.getTripRecords();
    const index = records.findIndex(record => record.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...updates };
      this.setItem(STORAGE_KEYS.TRIP_RECORDS, records);
    }
  }

  deleteTripRecord(id: string): void {
    const records = this.getTripRecords();
    const filtered = records.filter(record => record.id !== id);
    this.setItem(STORAGE_KEYS.TRIP_RECORDS, filtered);
  }

  // 사용자 프로필 관리
  getUserProfile(): UserProfile | null {
    return this.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
  }

  saveUserProfile(profile: UserProfile): void {
    this.setItem(STORAGE_KEYS.USER_PROFILE, profile);
  }

  updateUserProfile(updates: Partial<UserProfile>): void {
    const profile = this.getUserProfile();
    if (profile) {
      this.saveUserProfile({ ...profile, ...updates });
    }
  }

  // 설정 관리
  getSettings(): Record<string, any> {
    return this.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS) || {};
  }

  saveSettings(settings: Record<string, any>): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  updateSetting(key: string, value: any): void {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
  }

  // 캐시 관리
  getCache<T>(key: string): T | null {
    const cache = this.getItem<Record<string, { data: T; timestamp: number }>>(STORAGE_KEYS.CACHE) || {};
    const item = cache[key];
    
    if (!item) return null;
    
    // 1시간 후 만료
    const isExpired = Date.now() - item.timestamp > 60 * 60 * 1000;
    if (isExpired) {
      delete cache[key];
      this.setItem(STORAGE_KEYS.CACHE, cache);
      return null;
    }
    
    return item.data;
  }

  setCache<T>(key: string, data: T): void {
    const cache = this.getItem<Record<string, { data: T; timestamp: number }>>(STORAGE_KEYS.CACHE) || {};
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
    this.setItem(STORAGE_KEYS.CACHE, cache);
  }

  clearCache(): void {
    this.removeItem(STORAGE_KEYS.CACHE);
  }

  // 전체 데이터 초기화
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  // 스토리지 사용량 확인
  getStorageUsage(): { used: number; total: number } {
    if (!this.isClient) return { used: 0, total: 0 };
    
    let used = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        used += item.length;
      }
    });
    
    // 대략적인 총 용량 (브라우저마다 다름)
    const total = 5 * 1024 * 1024; // 5MB
    
    return { used, total };
  }
}

// 싱글톤 인스턴스
export const storageManager = new StorageManager();

// 편의 함수들
export const getTripRecords = () => storageManager.getTripRecords();
export const saveTripRecord = (record: TripRecord) => storageManager.saveTripRecord(record);
export const updateTripRecord = (id: string, updates: Partial<TripRecord>) => storageManager.updateTripRecord(id, updates);
export const deleteTripRecord = (id: string) => storageManager.deleteTripRecord(id);

export const getUserProfile = () => storageManager.getUserProfile();
export const saveUserProfile = (profile: UserProfile) => storageManager.saveUserProfile(profile);
export const updateUserProfile = (updates: Partial<UserProfile>) => storageManager.updateUserProfile(updates);

export const getSettings = () => storageManager.getSettings();
export const saveSettings = (settings: Record<string, any>) => storageManager.saveSettings(settings);
export const updateSetting = (key: string, value: any) => storageManager.updateSetting(key, value);

export const getCache = <T>(key: string) => storageManager.getCache<T>(key);
export const setCache = <T>(key: string, data: T) => storageManager.setCache(key, data);
export const clearCache = () => storageManager.clearCache();

export const clearAllData = () => storageManager.clearAll();
export const getStorageUsage = () => storageManager.getStorageUsage();
