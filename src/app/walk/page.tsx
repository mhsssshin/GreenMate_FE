'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Footprints, Navigation, Play, Pause, Square } from 'lucide-react';
import { RouteType, Location, RouteOption } from '@/types';
import { getCurrentLocation, watchLocation } from '@/lib/bridge';

export default function WalkPage() {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [progress, setProgress] = useState(0);

  // 현재 위치 가져오기
  useEffect(() => {
    const initLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setOrigin(location);
        setCurrentLocation(location);
      } catch (error) {
        console.error('위치 정보를 가져올 수 없습니다:', error);
      }
    };

    initLocation();
  }, []);

  // 위치 추적
  useEffect(() => {
    if (isNavigating) {
      const unwatch = watchLocation((location) => {
        setCurrentLocation(location);
        // 진행률 계산 로직 (실제로는 경로와의 거리 계산 필요)
        setProgress(prev => Math.min(prev + 5, 100));
      });

      return unwatch;
    }
  }, [isNavigating]);

  // 경로 검색 (더미 데이터)
  const searchRoutes = () => {
    if (!origin || !destination) return;

    const mockRoutes: RouteOption[] = [
      {
        type: 'short',
        distance: 1.2,
        duration: 15,
        steps: 1500,
        polyline: [],
      },
      {
        type: 'recommended',
        distance: 1.8,
        duration: 22,
        steps: 2200,
        polyline: [],
      },
      {
        type: 'morewalk',
        distance: 2.5,
        duration: 30,
        steps: 3000,
        polyline: [],
      },
    ];

    setRouteOptions(mockRoutes);
  };

  const getRouteTypeLabel = (type: RouteType) => {
    switch (type) {
      case 'short': return '최단 경로';
      case 'recommended': return '추천 경로';
      case 'morewalk': return '더 걷기';
      default: return '';
    }
  };

  const getRouteTypeDescription = (type: RouteType) => {
    switch (type) {
      case 'short': return '가장 빠른 경로';
      case 'recommended': return '균형잡힌 경로';
      case 'morewalk': return '운동량을 위한 경로';
      default: return '';
    }
  };

  const startNavigation = () => {
    if (selectedRoute) {
      setIsNavigating(true);
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">걷깅</h1>
      </div>

      {!isNavigating ? (
        <div className="p-4 space-y-6">
          {/* 출발지/목적지 입력 */}
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin size={16} className="text-green-600" />
                </div>
                <span className="font-medium text-gray-900">출발지</span>
              </div>
              <input
                type="text"
                placeholder="현재 위치"
                value={origin?.name || '현재 위치'}
                readOnly
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <MapPin size={16} className="text-red-600" />
                </div>
                <span className="font-medium text-gray-900">목적지</span>
              </div>
              <input
                type="text"
                placeholder="목적지를 입력하세요"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onChange={(e) => {
                  if (e.target.value) {
                    setDestination({
                      lat: 37.5665 + Math.random() * 0.01,
                      lng: 126.9780 + Math.random() * 0.01,
                      name: e.target.value,
                    });
                  }
                }}
              />
            </div>

            <button
              onClick={searchRoutes}
              disabled={!destination}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              경로 검색
            </button>
          </div>

          {/* 경로 옵션 */}
          {routeOptions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">경로 선택</h2>
              {routeOptions.map((route) => (
                <div
                  key={route.type}
                  className={`card cursor-pointer transition-all ${
                    selectedRoute === route.type
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedRoute(route.type)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {getRouteTypeLabel(route.type)}
                        </h3>
                        {selectedRoute === route.type && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {getRouteTypeDescription(route.type)}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Navigation size={14} />
                          <span>{route.distance}km</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{route.duration}분</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Footprints size={14} />
                          <span>{route.steps}보</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={startNavigation}
                disabled={!selectedRoute}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                네비게이션 시작
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 네비게이션 화면 */
        <div className="h-screen bg-gray-900 text-white">
          {/* 지도 영역 (실제로는 지도 컴포넌트) */}
          <div className="h-2/3 bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <Navigation size={48} className="mx-auto mb-4 text-primary-400" />
              <p className="text-lg">네비게이션 진행 중</p>
              <p className="text-sm text-gray-400 mt-2">
                {currentLocation?.lat.toFixed(4)}, {currentLocation?.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* 진행률 및 컨트롤 */}
          <div className="h-1/3 bg-white p-4">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>진행률</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={stopNavigation}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Square size={20} />
                <span>종료</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
