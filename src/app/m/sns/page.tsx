'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '@/types';

// 더미 데이터
const mockPosts: Post[] = [
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
    images: ['https://images.unsplash.com/photo-1569163139394-de446b2b7c4a?w=400&h=300&fit=crop'],
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
    images: ['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop'],
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
    images: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'],
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
    images: ['https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=300&fit=crop'],
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

export default function SNSPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [loading, setLoading] = useState(false);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likeCount: post.liked ? post.likeCount - 1 : post.likeCount + 1 
          }
        : post
    ));
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
          <h1 className="text-lg font-semibold text-gray-900">SNS</h1>
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
