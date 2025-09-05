'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Clock, Footprints, Navigation, Search, Star, Mountain, TreePine, Trophy, Target, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Location } from '@/types';
import { getCurrentLocation, watchLocation } from '@/lib/bridge';
import { getCurrentSteps, getDefaultImageForLocation, getLocationFromCookie } from '@/utils/helpers';

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
  const [searchInput, setSearchInput] = useState<string>(''); // 실제 검색 입력값
  const [isSearching, setIsSearching] = useState(false);
  const [trackingCourses, setTrackingCourses] = useState<TrackingCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TrackingCourse | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [displayLocation, setDisplayLocation] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState(false); // 검색 모드 여부
  const [isSearchFieldEnabled, setIsSearchFieldEnabled] = useState(false); // 검색 필드 활성화 여부
  const [currentSteps, setCurrentSteps] = useState<number>(0);
  const [dailyGoalSteps] = useState<number>(Math.floor(Math.random() * (14000 - 9000 + 1)) + 9000); // 9000~14000 사이 랜덤 목표 걸음 수
  const [isSharingToFeed, setIsSharingToFeed] = useState(false); // 피드 공유 상태
  
  // 트래킹 진행 상태
  const [isTracking, setIsTracking] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState({
    elapsedTime: 0, // 경과 시간 (초)
    remainingDistance: 0, // 남은 거리 (km)
    currentDirection: 'N', // 현재 방향
    progressPercentage: 0, // 진행률 (%)
    isCompleted: false // 완료 여부
  });

  // 위치 정보 초기화 (쿠키 우선, GET Parameter, 브릿지 순서)
  useEffect(() => {
    const initLocation = async () => {
      // 검색 모드일 때는 위치를 다시 설정하지 않음
      if (isSearchMode) {
        return;
      }
      
      let location: Location | null = null;
      let locationSource = '';
      
      // 1. 쿠키에서 위치 정보 가져오기 (최우선)
      console.log('전체 쿠키:', document.cookie);
      const cookieLocation = getLocationFromCookie();
      console.log('쿠키에서 파싱된 위치:', cookieLocation);
      if (cookieLocation) {
        location = cookieLocation;
        locationSource = '쿠키';
        console.log('쿠키에서 위치 정보 가져옴:', cookieLocation);
      } else {
        console.log('쿠키에서 위치 정보를 찾을 수 없음');
      }
      
      // 2. GET Parameter에서 GPS 좌표 가져오기
      if (!location) {
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        
        if (lat && lng) {
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);
          
          if (!isNaN(latitude) && !isNaN(longitude)) {
            location = { lat: latitude, lng: longitude };
            locationSource = 'GET Parameter';
            console.log('GET Parameter에서 위치 정보 가져옴:', location);
          }
        }
      }
      
      // 3. 브릿지를 통한 현재 위치 가져오기
      if (!location) {
        try {
          location = await getCurrentLocation();
          locationSource = '브릿지';
          console.log('브릿지에서 위치 정보 가져옴:', location);
      } catch (error) {
        console.error('위치 정보를 가져올 수 없습니다:', error);
          setDisplayLocation('위치 정보를 가져올 수 없습니다');
          return;
        }
      }
      
      // 위치 정보 설정
      if (location) {
        setCurrentLocation(location);
        setSearchLocation(`현재위치(${location.lat.toFixed(4)}/${location.lng.toFixed(4)})`);
        setDisplayLocation(`위도: ${location.lat.toFixed(4)}, 경도: ${location.lng.toFixed(4)} (${locationSource})`);
        
        // 위치 기반 코스 자동 로드 (현재 위치 기반으로 3개 코스 생성)
        const remainingSteps = Math.max(dailyGoalSteps - currentSteps, 1000); // 최소 1000보 보장
        const currentLocationCourses = generateTrackingCourses(
          location.lat,
          location.lng,
          remainingSteps,
          '현재 위치'
        );
        setTrackingCourses(currentLocationCourses);
      }
    };

    initLocation();
  }, [searchParams, isSearchMode, currentSteps]);

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


  // 남은 걸음수 기반 트래킹 코스 생성 함수
  const generateTrackingCourses = (
    lat: number, 
    lng: number, 
    remainingSteps: number, 
    locationName: string
  ): TrackingCourse[] => {
    // 남은 걸음수에 따른 3가지 코스 생성
    const courses: TrackingCourse[] = [];
    
    // 1. 많은 걸음 코스 (남은 걸음수의 120%)
    const manySteps = Math.max(remainingSteps * 1.2, 1000);
    const manyDistance = (manySteps * 0.7) / 1000; // 걸음수를 km로 변환 (평균 보폭 0.7m)
    
    courses.push({
      id: 'search-many',
      name: `${locationName} - 많은 걸음 코스`,
      location: locationName,
      distance: Math.round(manyDistance * 10) / 10,
      duration: Math.round(manyDistance * 12), // km당 12분
      difficulty: 'hard',
      steps: manySteps,
      description: `목표 걸음수를 넘어서는 도전적인 코스입니다.`,
      rating: 4.5,
      type: 'city',
      imageUrl: getDefaultImageForLocation(locationName)
    });
    
    // 2. 표준 걸음 코스 (남은 걸음수와 동일)
    const standardSteps = Math.max(remainingSteps, 1000);
    const standardDistance = (standardSteps * 0.7) / 1000;
    
    courses.push({
      id: 'search-standard',
      name: `${locationName} - 표준 걸음 코스`,
      location: locationName,
      distance: Math.round(standardDistance * 10) / 10,
      duration: Math.round(standardDistance * 12),
      difficulty: 'medium',
      steps: standardSteps,
      description: `목표 걸음수에 딱 맞는 적당한 코스입니다.`,
      rating: 4.3,
      type: 'city',
      imageUrl: getDefaultImageForLocation(locationName)
    });
    
    // 3. 적은 걸음 코스 (남은 걸음수의 80%)
    const fewSteps = Math.max(remainingSteps * 0.8, 500);
    const fewDistance = (fewSteps * 0.7) / 1000;
    
    courses.push({
      id: 'search-few',
      name: `${locationName} - 적은 걸음 코스`,
      location: locationName,
      distance: Math.round(fewDistance * 10) / 10,
      duration: Math.round(fewDistance * 12),
      difficulty: 'easy',
      steps: fewSteps,
      description: `부담 없이 즐길 수 있는 가벼운 코스입니다.`,
      rating: 4.1,
      type: 'city',
      imageUrl: getDefaultImageForLocation(locationName)
    });
    
    console.log('생성된 트래킹 코스:', courses);
    return courses;
  };

  // 다른 곳에서 시작하기 버튼 클릭
  const enableSearchField = () => {
    setIsSearchFieldEnabled(true);
    setSearchInput(''); // 검색 입력 필드 비우기
  };

  // 위치 검색
  const searchCourses = async () => {
    if (!searchInput.trim()) return;
    
    console.log('검색 키워드:', searchInput); // 디버깅용 로그
    
    setIsSearching(true);
    setIsSearchMode(true); // 검색 모드 활성화
    
    try {
      // 위치 검색 API 호출 (GET 방식)
      const response = await fetch(`http://greenmate.ddns.net/api/locations/search?query=${encodeURIComponent(searchInput)}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API 응답 데이터:', responseData); // 디버깅용 로그
      
      // API 응답은 배열 형태로 직접 반환됨
      const data = Array.isArray(responseData) ? responseData : [];
      console.log('위치 검색 결과:', data);
      
      if (data.length === 0) {
        throw new Error('검색 결과가 없습니다.');
      }
      
      // 첫 번째 검색 결과에서 위도/경도 추출
      const firstResult = data[0];
      const searchLat = firstResult.latitude;
      const searchLng = firstResult.longitude;
      
      console.log('검색된 위치:', { lat: searchLat, lng: searchLng });
      
      // 남은 걸음수 계산
      const remainingSteps = dailyGoalSteps - currentSteps;
      console.log('남은 걸음수:', remainingSteps);
      
      // 남은 걸음수 기반으로 트래킹 코스 3개 생성
      const searchResults: TrackingCourse[] = generateTrackingCourses(
        searchLat, 
        searchLng, 
        remainingSteps, 
        firstResult.name || searchInput
      );

      // 검색된 위치의 위도/경도 정보 업데이트
      setCurrentLocation({
        lat: searchLat,
        lng: searchLng
      });
      // 검색된 위치로 현재 위치 표시 업데이트
      setSearchLocation(`현재위치(${searchLat.toFixed(4)}/${searchLng.toFixed(4)})`);
      // 검색 모드에서는 API에서 받은 좌표 표시
      setDisplayLocation(`위도: ${searchLat}, 경도: ${searchLng} (검색)`);

      setTrackingCourses(searchResults);
      
    } catch (error) {
      console.error('위치 검색 중 오류가 발생했습니다:', error);
      console.error('에러 상세:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        searchInput: searchInput
      });
      
      // API 호출 실패 시 더미 데이터로 fallback
      const fallbackResults: TrackingCourse[] = [
        {
          id: 'fallback-1',
          name: `${searchInput} 걷기 코스`,
          location: searchInput,
          distance: 2.8,
          duration: 35,
          difficulty: 'medium',
          steps: 3500,
          description: `${searchInput} 지역의 트래킹 코스`,
          rating: 4.1,
          type: 'city',
          imageUrl: getDefaultImageForLocation(searchInput)
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
    setSearchInput('');
    setIsSearchMode(false);
    setIsSearchFieldEnabled(false); // 검색 필드 비활성화
    setSelectedCourse(null);
    
    // 쿠키에서 위치 정보 다시 가져오기
    const cookieLocation = getLocationFromCookie();
    if (cookieLocation) {
      setCurrentLocation(cookieLocation);
      setSearchLocation(`현재위치(${cookieLocation.lat.toFixed(4)}/${cookieLocation.lng.toFixed(4)})`);
      setDisplayLocation(`위도: ${cookieLocation.lat.toFixed(4)}, 경도: ${cookieLocation.lng.toFixed(4)} (쿠키)`);
      
      // 현재 위치 기반으로 3개 코스 생성
      const remainingSteps = Math.max(dailyGoalSteps - currentSteps, 1000);
      const currentLocationCourses = generateTrackingCourses(
        cookieLocation.lat,
        cookieLocation.lng,
        remainingSteps,
        '현재 위치'
      );
      setTrackingCourses(currentLocationCourses);
    } else if (currentLocation) {
      // 쿠키에 위치 정보가 없으면 기존 위치 사용
      setDisplayLocation(`위도: ${currentLocation.lat}, 경도: ${currentLocation.lng}`);
      
      // 현재 위치 기반으로 3개 코스 생성
      const remainingSteps = Math.max(dailyGoalSteps - currentSteps, 1000);
      const currentLocationCourses = generateTrackingCourses(
        currentLocation.lat,
        currentLocation.lng,
        remainingSteps,
        '현재 위치'
      );
      setTrackingCourses(currentLocationCourses);
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

  // 피드 공유 함수
  const shareToFeed = () => {
    if (!selectedCourse) return;
    
    setIsSharingToFeed(true);
    
    // 하드코딩된 피드 데이터 생성
    const feedData = {
      id: Date.now().toString(),
      type: 'walking_completion',
      title: `${selectedCourse.name} 완주!`,
      content: `오늘 ${selectedCourse.distance}km를 걸어서 ${selectedCourse.steps}보를 걸었습니다! 건강한 하루였어요! 🚶‍♀️`,
      distance: selectedCourse.distance,
      steps: selectedCourse.steps,
      duration: selectedCourse.duration,
      location: selectedCourse.location,
      points: Math.floor(selectedCourse.distance * 100),
      timestamp: new Date().toISOString(),
      user: {
        name: 'GreenMate 사용자',
        avatar: '/images/default-avatar.svg'
      }
    };
    
    // 로컬 스토리지에 피드 데이터 저장 (실제로는 API 호출)
    const existingFeeds = JSON.parse(localStorage.getItem('feeds') || '[]');
    existingFeeds.unshift(feedData);
    localStorage.setItem('feeds', JSON.stringify(existingFeeds));
    
    // 성공 메시지
    setTimeout(() => {
      alert('피드에 성공적으로 공유되었습니다!');
      setIsSharingToFeed(false);
      // 피드 페이지로 이동
      window.location.href = '/m/sns';
    }, 1000);
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
                {/* 다른 곳에서 시작하기 버튼 */}
                {!isSearchFieldEnabled && (
                  <div className="flex justify-center">
                    <button
                      onClick={enableSearchField}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <MapPin size={16} />
                      <span>다른 곳에서 시작하기</span>
                    </button>
              </div>
                )}

                {/* 검색 필드 (활성화된 경우에만 표시) */}
                {isSearchFieldEnabled && (
                  <>
              <input
                type="text"
                      placeholder="위치를 검색하세요 (예: 강남역, 여의도)"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                    
                    {/* 검색 버튼 */}
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={searchCourses}
                        disabled={isSearching || !searchInput.trim()}
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
                  </>
                )}
                
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
                
                {/* 피드 공유 버튼 */}
                <button
                  onClick={shareToFeed}
                  disabled={isSharingToFeed}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 transition-colors mb-4"
                >
                  {isSharingToFeed ? '공유 중...' : '피드에 공유하기'}
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
          {trackingCourses.length > 0 && !trackingProgress.isCompleted && (
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

          {/* 새로운 코스 찾기 버튼 - 트래킹 완료 시 하단 고정 */}
          {trackingProgress.isCompleted && (
            <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
              <button
                onClick={() => {
                  setTrackingProgress(prev => ({ ...prev, isCompleted: false }));
                  setSelectedCourse(null);
                }}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200"
              >
                새로운 코스 찾기
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
