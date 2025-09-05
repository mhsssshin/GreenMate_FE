'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Post, CelebrityTrackingCourse } from '@/types';

// 유명인 트래킹 코스 데이터
const celebrityTrackingCourses: CelebrityTrackingCourse[] = [
  {
    id: 'celebrity-1',
    celebrityName: '이효리',
    celebrityAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    courseName: '한강공원 트래킹 코스',
    courseDescription: '이효리가 즐겨 걸었던 한강공원의 아름다운 트래킹 코스입니다. 한강의 시원한 바람과 함께 도심 속 자연을 만끽할 수 있어요.',
    courseImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    mapImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    trackingImage: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
    distance: 5.2,
    duration: 75,
    difficulty: 'easy',
    location: '서울 한강공원',
    coordinates: { lat: 37.5219, lng: 126.9240 },
    highlights: ['한강 전망', '시원한 바람', '도심 속 자연'],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'celebrity-2',
    celebrityName: '유재석',
    celebrityAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    courseName: '제주 올레길 1코스',
    courseDescription: '유재석이 추천하는 제주 올레길 1코스입니다. 제주의 아름다운 해안선과 자연을 감상하며 걷는 힐링 코스예요.',
    courseImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    mapImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    trackingImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    distance: 15.1,
    duration: 240,
    difficulty: 'medium',
    location: '제주도 서귀포',
    coordinates: { lat: 33.4996, lng: 126.5312 },
    highlights: ['제주 해안선', '올레길', '자연 경관'],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'celebrity-3',
    celebrityName: '김태희',
    celebrityAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    courseName: '북한산 둘레길',
    courseDescription: '김태희가 즐겨 걸었던 북한산 둘레길입니다. 서울의 아름다운 전망과 함께 산림욕을 즐길 수 있는 코스예요.',
    courseImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    mapImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    trackingImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
    distance: 8.5,
    duration: 180,
    difficulty: 'medium',
    location: '서울 북한산',
    coordinates: { lat: 37.7235, lng: 126.9990 },
    highlights: ['서울 전망', '산림욕', '둘레길'],
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 'celebrity-4',
    celebrityName: '송혜교',
    celebrityAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
    courseName: '서울숲-청계천 트래킹',
    courseDescription: '송혜교가 추천하는 서울숲에서 청계천까지의 도심 트래킹 코스입니다. 도심 속 자연과 역사를 동시에 느낄 수 있어요.',
    courseImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    mapImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    trackingImage: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
    distance: 3.2,
    duration: 60,
    difficulty: 'easy',
    location: '서울 서울숲-청계천',
    coordinates: { lat: 37.5446, lng: 127.0400 },
    highlights: ['서울숲', '청계천', '도심 자연'],
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: 'celebrity-5',
    celebrityName: '강동원',
    celebrityAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    courseName: '한양도성길 (서울성곽길)',
    courseDescription: '강동원이 즐겨 걸었던 한양도성길입니다. 서울의 역사와 자연을 동시에 감상하며 걷는 특별한 코스예요.',
    courseImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    mapImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    trackingImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
    distance: 18.7,
    duration: 360,
    difficulty: 'hard',
    location: '서울 한양도성길',
    coordinates: { lat: 37.5665, lng: 126.9780 },
    highlights: ['역사 유적', '서울 전망', '성곽길'],
    createdAt: new Date(Date.now() - 432000000).toISOString()
  }
];

// 더미 데이터
const mockPosts: Post[] = [
  {
    id: '0',
    author: {
      id: 'user0',
      nickname: '한화생명',
      avatar: '/images/small-avatar.svg',
    },
    type: 'image',
    content: '한화생명 ESG 경영 인증을 받았습니다! 🏆 2024년 지속가능경영 우수기업으로 선정되어 자랑스럽습니다. 고객과 함께하는 지속가능한 미래를 만들어가겠습니다! #한화생명 #ESG경영 #지속가능경영',
    images: ['https://www.greened.kr/news/photo/202303/301837_333663_3553.jpg'],
    liked: true,
    likeCount: 156,
    commentCount: 42,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '1',
    author: {
      id: 'user1',
      nickname: '걷기마니아',
      avatar: '/images/small-avatar.svg',
    },
    type: 'route',
    content: '오늘 강남역에서 신논현역까지 걷기로 이동했어요! 30분 걸렸지만 기분이 좋네요 🌱',
    routeShare: {
      id: 'route1',
      startedAt: Date.now() - 3600000,
      endedAt: Date.now() - 1800000,
      origin: { lat: 37.4979, lng: 127.0276, name: '강남역' },
      destination: { lat: 37.5045, lng: 127.0250, name: '신논현역' },
      chosenRoute: 'recommended',
      distanceMeters: 1200,
      durationSeconds: 1800,
      steps: 1500,
      polyline: [],
    },
    liked: false,
    likeCount: 12,
    commentCount: 3,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    author: {
      id: 'user2',
      nickname: '환경지킴이',
      avatar: '/images/small-avatar.svg',
    },
    type: 'text',
    content: '걷기로 출퇴근하면서 탄소발자국을 줄이고 있어요. 작은 실천이 모여 큰 변화를 만들 수 있다고 믿어요! 💚',
    liked: true,
    likeCount: 25,
    commentCount: 8,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    author: {
      id: 'user3',
      nickname: 'ESG활동가',
      avatar: '/images/small-avatar.svg',
    },
    type: 'image',
    content: '구글에서 ESG 활동 인증을 받았어요! 🏆 3개월간 매일 걷기로 탄소중립에 기여했답니다. 여러분도 함께해요!',
    images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop'],
    liked: false,
    likeCount: 45,
    commentCount: 12,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '4',
    author: {
      id: 'user4',
      nickname: '지속가능한생활',
      avatar: '/images/small-avatar.svg',
    },
    type: 'route',
    content: '한강공원에서 5km 걷기 완주! 🏃‍♀️ 자연과 함께하는 시간이 정말 소중해요. #한강걷기 #탄소중립',
    routeShare: {
      id: 'route2',
      startedAt: Date.now() - 14400000,
      endedAt: Date.now() - 12600000,
      origin: { lat: 37.5219, lng: 126.9240, name: '여의도한강공원' },
      destination: { lat: 37.5219, lng: 126.9240, name: '여의도한강공원' },
      chosenRoute: 'morewalk',
      distanceMeters: 5000,
      durationSeconds: 3600,
      steps: 6500,
      polyline: [],
    },
    liked: true,
    likeCount: 38,
    commentCount: 15,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '5',
    author: {
      id: 'user5',
      nickname: '그린라이프',
      avatar: '/images/small-avatar.svg',
    },
    type: 'image',
    content: '마이크로소프트의 지속가능성 인증서를 받았습니다! 🌟 6개월간 100% 걷기 출퇴근으로 2.5톤의 CO2를 절약했어요.',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
    liked: false,
    likeCount: 67,
    commentCount: 23,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: '6',
    author: {
      id: 'user6',
      nickname: '도보여행자',
      avatar: '/images/small-avatar.svg',
    },
    type: 'text',
    content: '오늘도 대중교통 대신 걸어서 출근! 🚶‍♂️ 건강도 챙기고 환경도 보호하고 일석이조네요. 여러분도 도전해보세요!',
    liked: true,
    likeCount: 29,
    commentCount: 7,
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: '7',
    author: {
      id: 'user7',
      nickname: '친환경소비자',
      avatar: '/images/small-avatar.svg',
    },
    type: 'image',
    content: '아마존의 Climate Pledge 인증을 받았어요! 🎉 1년간 걷기로만 이동하여 5톤의 탄소를 절약했습니다. 지구를 위한 작은 실천!',
    images: ['https://images.unsplash.com/photo-1569163139394-de446b2b7c4a?w=400&h=300&fit=crop'],
    liked: false,
    likeCount: 89,
    commentCount: 31,
    createdAt: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    id: '8',
    author: {
      id: 'user8',
      nickname: '녹색도시인',
      avatar: '/images/small-avatar.svg',
    },
    type: 'route',
    content: '서울숲에서 청계천까지 걷기 여행! 🌳 도심 속 자연을 느끼며 걷는 즐거움을 만끽했어요.',
    routeShare: {
      id: 'route3',
      startedAt: Date.now() - 28800000,
      endedAt: Date.now() - 27000000,
      origin: { lat: 37.5446, lng: 127.0400, name: '서울숲' },
      destination: { lat: 37.5665, lng: 126.9780, name: '청계천' },
      chosenRoute: 'short',
      distanceMeters: 3200,
      durationSeconds: 2400,
      steps: 4200,
      polyline: [],
    },
    liked: true,
    likeCount: 52,
    commentCount: 18,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: '9',
    author: {
      id: 'user9',
      nickname: '지구사랑',
      avatar: '/images/small-avatar.svg',
    },
    type: 'image',
    content: '애플의 환경보호 인증서! 🍎 8개월간 걷기로만 이동하여 3.2톤의 CO2를 절약했어요. 작은 실천이 큰 변화를 만듭니다!',
    images: ['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop'],
    liked: false,
    likeCount: 73,
    commentCount: 26,
    createdAt: new Date(Date.now() - 32400000).toISOString(),
  },
  {
    id: '10',
    author: {
      id: 'user10',
      nickname: '걷기왕',
      avatar: '/images/small-avatar.svg',
    },
    type: 'text',
    content: '오늘 하루 15,000보 달성! 🎯 매일 걷기로 건강한 몸과 마음을 만들어가고 있어요. 여러분도 함께해요!',
    liked: true,
    likeCount: 41,
    commentCount: 14,
    createdAt: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    id: '11',
    author: {
      id: 'user11',
      nickname: '친환경활동가',
      avatar: '/images/small-avatar.svg',
    },
    type: 'image',
    content: '테슬라의 지속가능성 인증을 받았습니다! ⚡ 1년간 걷기로만 이동하여 4.8톤의 탄소를 절약했어요. 미래를 위한 선택!',
    images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'],
    liked: false,
    likeCount: 95,
    commentCount: 34,
    createdAt: new Date(Date.now() - 39600000).toISOString(),
  },
  {
    id: '12',
    author: {
      id: 'user12',
      nickname: '녹색여행자',
      avatar: '/images/small-avatar.svg',
    },
    type: 'route',
    content: '북한산 둘레길 걷기 완주! 🏔️ 자연과 함께하는 시간이 정말 힐링이에요. #북한산 #둘레길 #걷기여행',
    routeShare: {
      id: 'route4',
      startedAt: Date.now() - 43200000,
      endedAt: Date.now() - 39600000,
      origin: { lat: 37.7235, lng: 126.9990, name: '북한산둘레길' },
      destination: { lat: 37.7235, lng: 126.9990, name: '북한산둘레길' },
      chosenRoute: 'morewalk',
      distanceMeters: 8000,
      durationSeconds: 7200,
      steps: 10500,
      polyline: [],
    },
    liked: true,
    likeCount: 78,
    commentCount: 29,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

// 유명인 트래킹 코스를 Post 형태로 변환
const celebrityPosts: Post[] = celebrityTrackingCourses.map(course => ({
  id: `celebrity-${course.id}`,
  author: {
    id: `celebrity-${course.id}`,
    nickname: course.celebrityName,
    avatar: course.celebrityAvatar,
  },
  type: 'celebrity_tracking' as const,
  content: `🌟 ${course.celebrityName}님이 추천하는 트래킹 코스!\n\n${course.courseDescription}\n\n📍 ${course.location}\n📏 ${course.distance}km • ⏱️ ${course.duration}분 • 🎯 ${course.difficulty === 'easy' ? '쉬움' : course.difficulty === 'medium' ? '보통' : '어려움'}\n\n✨ 하이라이트: ${course.highlights.join(', ')}`,
  celebrityTracking: course,
  liked: false,
  likeCount: Math.floor(Math.random() * 200) + 50,
  commentCount: Math.floor(Math.random() * 50) + 10,
  createdAt: course.createdAt,
}));

export default function SNSPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 피드 데이터 로드
  useEffect(() => {
    const loadPosts = () => {
      try {
        // 로컬 스토리지에서 사용자 생성 피드 가져오기
        const userPosts = JSON.parse(localStorage.getItem('sns-posts') || '[]');
        
        // 기본 더미 데이터, 유명인 트래킹 코스, 사용자 피드 합치기
        const allPosts = [...userPosts, ...celebrityPosts, ...mockPosts];
        
        // 시간순으로 정렬 (최신순)
        allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setPosts(allPosts);
      } catch (error) {
        console.error('피드 데이터 로드 실패:', error);
        setPosts(mockPosts);
      }
    };

    loadPosts();
  }, []);

  const handleLike = (postId: string) => {
    setPosts(prev => {
      const updatedPosts = prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              liked: !post.liked, 
              likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1 
            }
          : post
      );
      
      // 로컬 스토리지에 업데이트된 피드 저장
      try {
        const userPosts = updatedPosts.filter(post => post.id.startsWith('walking-'));
        localStorage.setItem('sns-posts', JSON.stringify(userPosts));
      } catch (error) {
        console.error('피드 업데이트 저장 실패:', error);
      }
      
      return updatedPosts;
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">피드</h1>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Plus size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* 피드 */}
      <div className="space-y-4 p-4">
        {posts.map((post) => (
          <div key={post.id} className="card animate-fade-in">
            {/* 포스트 헤더 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Image
                  src={post.author.avatar || '/images/small-avatar.svg'}
                  alt={post.author.nickname}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-gray-900">{post.author.nickname}</p>
                  <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                </div>
              </div>
              <button className="p-1 rounded-full hover:bg-gray-100">
                <MoreHorizontal size={16} className="text-gray-400" />
              </button>
            </div>

            {/* 포스트 내용 */}
            <div className="mb-3">
              <p className="text-gray-800 leading-relaxed">{post.content}</p>
              
              {/* 이미지 표시 */}
              {post.images && post.images.length > 0 && (
                <div className="mt-3 space-y-2">
                  {post.images.map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`포스트 이미지 ${index + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* 경로 공유 카드 */}
              {post.routeShare && (
                <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🚶</span>
                    </div>
                    <span className="text-sm font-medium text-primary-700">걷기 기록</span>
                  </div>
                  <div className="text-sm text-primary-600">
                    <p>{post.routeShare.origin.name} → {post.routeShare.destination.name}</p>
                    <p>{(post.routeShare.distanceMeters / 1000).toFixed(1)}km • {Math.floor(post.routeShare.durationSeconds / 60)}분 • {post.routeShare.steps}보</p>
                  </div>
                  
                  {/* 트래킹 경로 표시 */}
                  {post.routeShare.polyline && post.routeShare.polyline.length > 0 && (
                    <div className="mt-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs font-medium text-gray-700">트래킹 경로</span>
                          <span className="text-xs text-gray-500">
                            ({post.routeShare.polyline.length - 1}개 경로점)
                          </span>
                        </div>
                        <div className="relative bg-white rounded h-20 overflow-hidden">
                          {post.routeShare.trackingImage ? (
                            <img 
                              src={post.routeShare.trackingImage} 
                              alt="트래킹 경로"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                  d={post.routeShare.polyline.map((point, index) => {
                                    if (index === 0) return `M ${50 + (point[1] - post.routeShare!.origin.lng) * 10000} ${50 + (point[0] - post.routeShare!.origin.lat) * 10000}`;
                                    return `L ${50 + (point[1] - post.routeShare!.origin.lng) * 10000} ${50 + (point[0] - post.routeShare!.origin.lat) * 10000}`;
                                  }).join(' ')}
                                  stroke="#3B82F6"
                                  strokeWidth="1"
                                  fill="none"
                                  strokeDasharray="3,3"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs text-gray-500">경로 시각화</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 유명인 트래킹 코스 카드 */}
              {post.celebrityTracking && (
                <div className="mt-3 space-y-3">
                  {/* 코스 이미지 */}
                  <div className="relative">
                    <Image
                      src={post.celebrityTracking.courseImage}
                      alt={post.celebrityTracking.courseName}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover rounded-lg"
                      unoptimized
                    />
                    <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                      ⭐ {post.celebrityTracking.celebrityName} 추천
                    </div>
                  </div>

                  {/* 코스 정보 */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{post.celebrityTracking.courseName}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{post.celebrityTracking.distance}km</div>
                        <div className="text-xs">거리</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{post.celebrityTracking.duration}분</div>
                        <div className="text-xs">소요시간</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">
                          {post.celebrityTracking.difficulty === 'easy' ? '쉬움' : 
                           post.celebrityTracking.difficulty === 'medium' ? '보통' : '어려움'}
                        </div>
                        <div className="text-xs">난이도</div>
                      </div>
                    </div>
                    
                    {/* 하이라이트 */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.celebrityTracking.highlights.map((highlight, index) => (
                        <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                          ✨ {highlight}
                        </span>
                      ))}
                    </div>

                    {/* 지도와 트래킹 이미지 */}
                    <div className="grid grid-cols-2 gap-2">
                      <a 
                        href={`https://www.google.com/maps/search/${encodeURIComponent(post.celebrityTracking.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block"
                      >
                        <Image
                          src={post.celebrityTracking.mapImage}
                          alt="코스 지도"
                          width={200}
                          height={150}
                          className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-medium">🗺️ 코스 지도</span>
                        </div>
                      </a>
                      <a 
                        href={post.celebrityTracking.trackingImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block"
                      >
                        <Image
                          src={post.celebrityTracking.trackingImage}
                          alt="트래킹 모습"
                          width={200}
                          height={150}
                          className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-medium">🚶 트래킹 모습</span>
                        </div>
                      </a>
                    </div>

                    {/* 위치 정보 */}
                    <div className="mt-3 text-sm text-gray-600">
                      📍 {post.celebrityTracking.location}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Heart 
                    size={20} 
                    className={post.liked ? 'text-red-500 fill-current' : 'text-gray-400'} 
                  />
                  <span className="text-sm text-gray-600">{post.likeCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <MessageCircle size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{post.commentCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <Share2 size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
}
