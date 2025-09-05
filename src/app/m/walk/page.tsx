'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, Clock, Footprints, Navigation, Search, Star, Mountain, TreePine } from 'lucide-react';
import { Location } from '@/types';
import { getCurrentLocation, watchLocation } from '@/lib/bridge';

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
      // GPS 좌표 기반 코스 자동 로드
      loadNearbyCourses(gpsLocation);
    } else {
      // GET Parameter가 없으면 기본 위치 가져오기
      const initLocation = async () => {
        try {
          const location = await getCurrentLocation();
          setCurrentLocation(location);
          setSearchLocation(`현재위치(${location.lat.toFixed(4)}/${location.lng.toFixed(4)})`);
          // 현재 위치 기반 코스 자동 로드
          loadNearbyCourses(location);
        } catch (error) {
          console.error('위치 정보를 가져올 수 없습니다:', error);
        }
      };

      initLocation();
    }
  }, [searchParams]);

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
        type: 'river'
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
        type: 'mountain'
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
        type: 'park'
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
        type: 'city'
      }
    ];

    setTrackingCourses(mockCourses);
  };

  // 위치 검색
  const searchCourses = () => {
    if (!searchLocation.trim()) return;
    
    setIsSearching(true);
    
    // 검색된 지역의 코스 로드 (더미 데이터)
    const searchResults: TrackingCourse[] = [
      {
        id: '5',
        name: '강남역 주변 걷기',
        location: '강남역',
        distance: 2.8,
        duration: 35,
        difficulty: 'medium',
        steps: 3500,
        description: '강남의 번화가를 둘러보는 코스',
        rating: 4.1,
        type: 'city'
      },
      {
        id: '6',
        name: '인사동 문화거리',
        location: '인사동',
        distance: 1.9,
        duration: 25,
        difficulty: 'easy',
        steps: 2400,
        description: '전통과 현대가 어우러진 문화 코스',
        rating: 4.4,
        type: 'city'
      }
    ];

    setTimeout(() => {
      setTrackingCourses(searchResults);
      setIsSearching(false);
    }, 1000);
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

  const startNavigation = () => {
    if (selectedCourse) {
      setIsNavigating(true);
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
                  placeholder="위치를 검색하세요"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                
                {/* 자동차 시동버튼 스타일의 검색 버튼 */}
                <div className="flex justify-center py-4">
                  <button
                    onClick={searchCourses}
                    disabled={isSearching}
                    className="w-24 h-24 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 transform hover:scale-110 disabled:scale-100"
                  >
                    <Search size={32} className="text-white" />
                  </button>
                </div>
                
                <p className="text-center text-sm text-gray-500">
                  {isSearching ? '검색 중...' : '검색 버튼을 눌러 트래킹 코스를 찾아보세요'}
                </p>
              </div>
            </div>
          </div>

          {/* 트래킹 코스 목록 - 화면 전체 활용 */}
          {trackingCourses.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 sticky top-0 bg-gray-50 py-2">
                  {searchLocation ? '검색 결과' : '근처 트래킹 코스'}
                </h2>
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
                    <div className="flex items-start justify-between">
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