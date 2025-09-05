'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Settings, MapPin, BarChart3, Shield, FileText, Info, Trash2, LogOut } from 'lucide-react';
import { UserProfile } from '@/types';
import { getUserProfile, updateUserProfile } from '@/lib/storage';
import { authAPI, tokenManager } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [cacheSize, setCacheSize] = useState<string>('0MB');

  useEffect(() => {
    // 프로필 로드
    const userProfile = getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
    } else {
      // 기본 프로필 설정
      const defaultProfile: UserProfile = {
        id: 'user1',
        nickname: 'GreenMate 사용자',
        avatar: '/images/default-avatar.svg',
        totalDistance: 0,
        totalSteps: 0,
        totalPoints: 0,
      };
      setProfile(defaultProfile);
    }

    // 위치 권한 확인
    checkLocationPermission();
    
    // 캐시 크기 계산
    calculateCacheSize();
  }, []);

  const checkLocationPermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        setLocationPermission(permission.state === 'granted');
      }
    } catch (error) {
      console.error('권한 확인 실패:', error);
    }
  };

  const calculateCacheSize = () => {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('greenmate_')) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      }
      setCacheSize(`${(totalSize / 1024).toFixed(1)}KB`);
    } catch (error) {
      console.error('캐시 크기 계산 실패:', error);
    }
  };

  const clearCache = () => {
    if (confirm('캐시를 삭제하시겠습니까?')) {
      try {
        // greenmate 관련 캐시만 삭제
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('greenmate_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        setCacheSize('0KB');
        alert('캐시가 삭제되었습니다.');
      } catch (error) {
        alert('캐시 삭제에 실패했습니다.');
      }
    }
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      updateUserProfile(updates);
    }
  };

  const handleLogout = async () => {
    if (confirm('로그아웃하시겠습니까?')) {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('로그아웃 API 오류:', error);
      } finally {
        // 토큰 및 사용자 정보 삭제
        tokenManager.removeToken();
        alert('로그아웃되었습니다.');
        router.push('/login');
      }
    }
  };

  const menuItems = [
    {
      icon: User,
      title: '프로필 설정',
      description: '닉네임, 아바타, 키/몸무게',
      onClick: () => console.log('프로필 설정'),
    },
    {
      icon: MapPin,
      title: '위치 권한',
      description: locationPermission ? '허용됨' : '거부됨',
      onClick: checkLocationPermission,
    },
    {
      icon: BarChart3,
      title: '걷기 기록',
      description: '히스토리 및 통계',
      onClick: () => console.log('걷기 기록'),
    },
    {
      icon: Settings,
      title: '앱 설정',
      description: '지도, 알림, 언어 설정',
      onClick: () => console.log('앱 설정'),
    },
    {
      icon: Trash2,
      title: '캐시 관리',
      description: `현재 사용량: ${cacheSize}`,
      onClick: clearCache,
    },
  ];

  const infoItems = [
    {
      icon: Shield,
      title: '개인정보 처리방침',
      onClick: () => console.log('개인정보 처리방침'),
    },
    {
      icon: FileText,
      title: '이용약관',
      onClick: () => console.log('이용약관'),
    },
    {
      icon: Info,
      title: '오픈소스 라이선스',
      onClick: () => console.log('오픈소스 라이선스'),
    },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="p-4 space-y-6">
        {/* 프로필 카드 */}
        <div className="card">
          <div className="flex items-center space-x-4 mb-4">
            <Image
              src={profile.avatar || '/images/default-avatar.svg'}
              alt={profile.nickname}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{profile.nickname}</h2>
              <p className="text-sm text-gray-500">GreenMate 사용자</p>
            </div>
            <button
              onClick={() => console.log('프로필 편집')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <User size={20} className="text-gray-400" />
            </button>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{profile.totalDistance.toFixed(1)}km</div>
              <div className="text-sm text-gray-500">총 거리</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{profile.totalSteps.toLocaleString()}</div>
              <div className="text-sm text-gray-500">총 걸음수</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-600">{profile.totalPoints.toLocaleString()}P</div>
              <div className="text-sm text-gray-500">총 포인트</div>
            </div>
          </div>
        </div>

        {/* 메뉴 항목 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">설정</h3>
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 정보 및 약관 */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">정보</h3>
          <div className="space-y-1">
            {infoItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon size={16} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="card bg-gray-50">
          <div className="text-center py-4">
            <Image 
              src="/images/greenmate-logo.svg" 
              alt="GreenMate" 
              width={48}
              height={48}
              className="w-12 h-12 mx-auto mb-3"
            />
            <h3 className="font-semibold text-gray-900 mb-1">GreenMate</h3>
            <p className="text-sm text-gray-500 mb-2">버전 1.0.0</p>
            <p className="text-xs text-gray-400">
              건강한 걷기, 지속가능한 미래
            </p>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">로그아웃</span>
        </button>
      </div>
    </div>
  );
}
