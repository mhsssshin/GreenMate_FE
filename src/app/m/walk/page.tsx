'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Clock, Footprints, Navigation, Search, Star, Mountain, TreePine, Trophy, Target, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Location } from '@/types';
import { getCurrentLocation, watchLocation } from '@/lib/bridge';
import { getCurrentSteps, getDefaultImageForLocation } from '@/utils/helpers';

interface TrackingCourse {
  id: string;
  name: string;
  location: string;
  distance: number; // km
  duration: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  steps: number;
  description: string;
  rating: number;
  type: 'park' | 'mountain' | 'city' | 'river';
  imageUrl?: string; // 이미지 URL 추가
}

export default function WalkPage() {
  const searchParams = useSearchParams();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingCourses, setTrackingCourses] = useState<TrackingCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TrackingCourse | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayLocation, setDisplayLocation] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState(false); // 검색 모드 여부
  const [currentSteps, setCurrentSteps] = useState<number>(0);
  const [dailyGoalSteps] = useState<number>(10000); // 하루 추천 걸음 수
  
  // 트래킹 진행 상태
  const [isTracking, setIsTracking] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState({
    elapsedTime: 0, // 경과 시간 (초)
    remainingDistance: 0, // 남은 거리 (km)
    currentDirection: 'N', // 현재 방향
    progressPercentage: 0, // 진행률 (%)
    isCompleted: false // 완료 여부
  });

  // GET Parameter에서 GPS 좌표 가져오기
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      // GET Parameter로 받은 GPS 좌표 사용
      const gpsLocation: Location = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
      setCurrentLocation(gpsLocation);
      setSearchLocation(`현재위치(${lat}/${lng})`);
      
      // 검색 모드가 아닐 때만 현재 위치 표시
      if (!isSearchMode) {
        setDisplayLocation(`위도: ${lat}, 경도: ${lng}`);
      }
      
      // GPS 좌표 기반 코스 자동 로드
      loadNearbyCourses(gpsLocation);
    } else {
      // GET Parameter가 없으면 기본 위치 가져오기
      const initLocation = async () => {
        try {
          const location = await getCurrentLocation();
          setCurrentLocation(location);
          setSearchLocation(`현재위치(${location.lat.toFixed(4)}/${location.lng.toFixed(4)})`);
          
          // 검색 모드가 아닐 때만 현재 위치 표시
          if (!isSearchMode) {
            setDisplayLocation(`위도: ${location.lat.toFixed(4)}, 경도: ${location.lng.toFixed(4)}`);
          }
          
          // 현재 위치 기반 코스 자동 로드
          loadNearbyCourses(location);
        } catch (error) {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          setDisplayLocation('위치 정보를 가져올 수 없습니다');
        }
      };

      initLocation();
    }
  }, [searchParams]);

  // 현재 걸음 수 가져오기
  useEffect(() => {
    const steps = getCurrentSteps();
    console.log('현재 걸음 수:', steps);
    console.log('전체 쿠키:', document.cookie);
    setCurrentSteps(steps);
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

  // 현재 위치 근처 코스 로드
  const loadNearbyCourses = (location: Location) => {
    const mockCourses: TrackingCourse[] = [
      {
        id: '1',
        name: '한강공원 걷기길',
        location: '여의도 한강공원',
        distance: 3.2,
        duration: 40,
        difficulty: 'easy',
        steps: 4000,
        description: '한강을 따라 걷는 편안한 코스',
        rating: 4.5,
        type: 'river',
        imageUrl: getDefaultImageForLocation('한강')
      },
      {
        id: '2',
        name: '북한산 둘레길',
        location: '북한산국립공원',
        distance: 8.5,
        duration: 120,
        difficulty: 'hard',
        steps: 10500,
        description: '자연을 만끽할 수 있는 산악 코스',
        rating: 4.8,
        type: 'mountain',
        imageUrl: getDefaultImageForLocation('북한산')
      },
      {
        id: '3',
        name: '서울숲 산책로',
        location: '서울숲공원',
        distance: 2.1,
        duration: 25,
        difficulty: 'easy',
        steps: 2600,
        description: '도심 속 자연을 느낄 수 있는 코스',
        rating: 4.3,
        type: 'park',
        imageUrl: getDefaultImageForLocation('서울숲')
      },
      {
        id: '4',
        name: '청계천 걷기길',
        location: '청계천',
        distance: 5.8,
        duration: 70,
        difficulty: 'medium',
        steps: 7200,
        description: '도심 속 시원한 물길을 따라 걷는 코스',
        rating: 4.2,
        type: 'city',
        imageUrl: getDefaultImageForLocation('청계천')
      }
    ];

    setTrackingCourses(mockCourses);
  };

  // 위치 검색
  const searchCourses = async () => {
    if (!searchLocation.trim()) return;
    
    setIsSearching(true);
    setIsSearchMode(true); // 검색 모드 활성화
    
    try {
      // 새로운 geocode API 호출 (POST 방식)
      const response = await fetch('http://103.244.108.70:9000/api/v1/geocode', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: searchLocation,
          locationType: "",
          region: ""
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // API 응답 데이터를 TrackingCourse 형태로 변환
      const searchResults: TrackingCourse[] = data.map((item: any, index: number) => ({
        id: `search-${index}`,
        name: item.name || `${searchLocation} 주변 걷기`,
        location: item.address || searchLocation,
        distance: item.distance || Math.random() * 5 + 1, // 1-6km
        duration: Math.floor((item.distance || Math.random() * 5 + 1) * 12), // km * 12분
        difficulty: item.difficulty || ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
        steps: Math.floor((item.distance || Math.random() * 5 + 1) * 1200), // km * 1200보
        description: item.description || `${searchLocation} 지역의 트래킹 코스`,
        rating: item.rating || (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        type: item.type || ['park', 'city', 'river'][Math.floor(Math.random() * 3)],
        imageUrl: getDefaultImageForLocation(item.name || searchLocation)
      }));

      // 검색된 위치의 위도/경도 정보 업데이트
      if (data.length > 0) {
        const firstResult = data[0];
        if (firstResult.latitude && firstResult.longitude) {
          setCurrentLocation({
            lat: firstResult.latitude,
            lng: firstResult.longitude
          });
          // 검색 모드에서는 API에서 받은 좌표 표시
          setDisplayLocation(`위도: ${firstResult.latitude}, 경도: ${firstResult.longitude}`);
        }
      }

      setTrackingCourses(searchResults);
      
    } catch (error) {
      console.error('위치 검색 중 오류가 발생했습니다:', error);
      
      // API 호출 실패 시 더미 데이터로 fallback
      const fallbackResults: TrackingCourse[] = [
        {
          id: 'fallback-1',
          name: `${searchLocation} 주변 걷기`,
          location: searchLocation,
          distance: 2.8,
          duration: 35,
          difficulty: 'medium',
          steps: 3500,
          description: `${searchLocation} 지역의 트래킹 코스`,
          rating: 4.1,
          type: 'city',
          imageUrl: getDefaultImageForLocation(searchLocation)
        }
      ];
      
      setTrackingCourses(fallbackResults);
      // 검색 실패 시에도 검색 모드 유지
    } finally {
      setIsSearching(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'park': return <TreePine size={16} className="text-green-600" />;
      case 'mountain': return <Mountain size={16} className="text-blue-600" />;
      case 'city': return <MapPin size={16} className="text-gray-600" />;
      case 'river': return <Navigation size={16} className="text-blue-500" />;
      default: return <MapPin size={16} className="text-gray-600" />;
    }
  };

  // 방향 아이콘 반환
  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'N': return <ArrowUp size={24} className="text-blue-500" />;
      case 'NE': return <ArrowUp size={24} className="text-blue-500" style={{ transform: 'rotate(45deg)' }} />;
      case 'E': return <ArrowRight size={24} className="text-blue-500" />;
      case 'SE': return <ArrowDown size={24} className="text-blue-500" style={{ transform: 'rotate(-45deg)' }} />;
      case 'S': return <ArrowDown size={24} className="text-blue-500" />;
      case 'SW': return <ArrowDown size={24} className="text-blue-500" style={{ transform: 'rotate(45deg)' }} />;
      case 'W': return <ArrowLeft size={24} className="text-blue-500" />;
      case 'NW': return <ArrowUp size={24} className="text-blue-500" style={{ transform: 'rotate(-45deg)' }} />;
      default: return <Navigation size={24} className="text-blue-500" />;
    }
  };

  // 트래킹 시작
  const startTracking = () => {
    if (selectedCourse) {
      setIsTracking(true);
      setTrackingProgress({
        elapsedTime: 0,
        remainingDistance: selectedCourse.distance,
        currentDirection: 'N',
        progressPercentage: 0,
        isCompleted: false
      });
    }
  };

  // 트래킹 시뮬레이션 (10초 동안 진행)
  useEffect(() => {
    if (!isTracking || !selectedCourse) return;

    const interval = setInterval(() => {
      setTrackingProgress(prev => {
        const newElapsedTime = prev.elapsedTime + 1;
        const totalTime = 10; // 10초로 고정
        const progressPercentage = Math.min((newElapsedTime / totalTime) * 100, 100);
        const remainingDistance = selectedCourse.distance * (1 - progressPercentage / 100);
        
        // 방향 랜덤 변경 (실제로는 GPS 방향을 사용)
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const currentDirection = directions[Math.floor(Math.random() * directions.length)];
        
        const isCompleted = progressPercentage >= 100;
        
        if (isCompleted) {
          setIsTracking(false);
        }
        
        return {
          elapsedTime: newElapsedTime,
          remainingDistance: Math.max(remainingDistance, 0),
          currentDirection,
          progressPercentage,
          isCompleted
        };
      });
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, [isTracking, selectedCourse]);

  // 검색어 초기화 및 검색 모드 해제
  const resetSearch = () => {
    setSearchLocation('');
    setIsSearchMode(false);
    setTrackingCourses([]);
    setSelectedCourse(null);
    
    // 현재 위치로 되돌리기
    if (currentLocation) {
      setDisplayLocation(`위도: ${currentLocation.lat}, 경도: ${currentLocation.lng}`);
      loadNearbyCourses(currentLocation);
    }
  };

  const startNavigation = () => {
    if (selectedCourse) {
      startTracking();
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isNavigating ? (
        <div className="flex flex-col h-screen">
          {/* 걸음 수 표시 섹션 - 최상단 */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-r from-primary-500 to-primary-600">
            <div className="text-center text-white">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Footprints size={20} className="text-white" />
                <span className="text-lg font-semibold">오늘의 걸음 수</span>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentSteps.toLocaleString()}</div>
                  <div className="text-sm text-primary-100">현재 걸음 수</div>
                </div>
                <div className="text-primary-200">/</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{dailyGoalSteps.toLocaleString()}</div>
                  <div className="text-sm text-primary-100">목표 걸음 수</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-primary-400 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((currentSteps / dailyGoalSteps) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-primary-100 mt-1">
                  {Math.round((currentSteps / dailyGoalSteps) * 100)}% 완료
                </div>
              </div>
            </div>
          </div>

          {/* 위치 검색 섹션 - 상단 고정 */}
          <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
            <div className="card">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Search size={16} className="text-primary-600" />
                </div>
                <span className="font-medium text-gray-900">트래킹 코스 검색</span>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="위치를 검색하세요 (예: 강남역, 여의도)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                
                {/* 검색 버튼 */}
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={searchCourses}
                    disabled={isSearching || !searchLocation.trim()}
                    className="px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Search size={16} />
                    <span>{isSearching ? '검색 중...' : '검색'}</span>
                  </button>
                  {isSearchMode && (
                    <button
                      onClick={resetSearch}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                    >
                      초기화
                    </button>
                  )}
                </div>
                
                {/* 현재 위치 정보 표시 */}
                {displayLocation && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin size={14} className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">현재 위치</span>
                    </div>
                    <p className="text-sm text-gray-600">{displayLocation}</p>
                  </div>
                )}
                
                <p className="text-center text-sm text-gray-500">
                  {isSearching ? '검색 중...' : '위치를 입력하고 검색 버튼을 눌러 트래킹 코스를 찾아보세요'}
                </p>
              </div>
            </div>
          </div>

          {/* 트래킹 진행 화면 */}
          {isTracking && selectedCourse && (
            <div className="flex-1 flex flex-col p-4">
              {/* 진행률 표시 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">진행률</span>
                  <span className="text-sm font-bold text-primary-600">
                    {trackingProgress.progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${trackingProgress.progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* 트래킹 정보 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock size={20} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">진행시간</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor(trackingProgress.elapsedTime / 60)}:{(trackingProgress.elapsedTime % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target size={20} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">남은 거리</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {trackingProgress.remainingDistance.toFixed(1)}km
                  </div>
                </div>
              </div>

              {/* 방향 표시 */}
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-4">현재 방향</div>
                  <div className="flex justify-center items-center mb-4">
                    {getDirectionIcon(trackingProgress.currentDirection)}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {trackingProgress.currentDirection}
                  </div>
                </div>
              </div>

              {/* 코스 정보 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedCourse.name}</h3>
                <p className="text-sm text-gray-600">{selectedCourse.description}</p>
              </div>
            </div>
          )}

          {/* 트래킹 완료 화면 */}
          {trackingProgress.isCompleted && selectedCourse && (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <Trophy size={80} className="text-yellow-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">트래킹 성공!!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  {selectedCourse.name} 완주를 축하합니다!
                </p>
                <div className="bg-yellow-100 rounded-lg p-4 mb-6">
                  <div className="text-2xl font-bold text-yellow-800">
                    +{Math.floor(selectedCourse.distance * 100)} 포인트 획득
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTrackingProgress(prev => ({ ...prev, isCompleted: false }));
                    setSelectedCourse(null);
                  }}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  새로운 코스 찾기
                </button>
              </div>
            </div>
          )}

          {/* 트래킹 코스 목록 - 화면 전체 활용 */}
          {!isTracking && !trackingProgress.isCompleted && trackingCourses.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {trackingCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`card cursor-pointer transition-all ${
                      selectedCourse?.id === course.id
                        ? 'ring-2 ring-primary-500 bg-primary-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* 이미지 섹션 */}
                      {course.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={course.imageUrl}
                            alt={course.name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              // 이미지 로드 실패 시 숨김
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* 텍스트 정보 섹션 */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(course.type)}
                          <h3 className="font-medium text-gray-900">{course.name}</h3>
                          {selectedCourse?.id === course.id && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <p className="text-sm text-gray-500 mb-3">{course.location}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Navigation size={14} />
                              <span>{course.distance}km</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{course.duration}분</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Footprints size={14} />
                              <span>{course.steps}보</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                              {getDifficultyLabel(course.difficulty)}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">{course.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 시작 버튼 - 하단 고정 */}
          {trackingCourses.length > 0 && (
            <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
              <button
                onClick={startNavigation}
                disabled={!selectedCourse}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedCourse ? `${selectedCourse.name} 시작하기` : '코스를 선택해주세요'}
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
              <p className="text-lg">{selectedCourse?.name}</p>
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
                <span>종료</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}