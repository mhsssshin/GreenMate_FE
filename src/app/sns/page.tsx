'use client';

import { useState, useEffect } from 'react';
import { Plus, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Post } from '@/types';

// 더미 데이터
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: 'user1',
      nickname: '걷기마니아',
      avatar: 'https://via.placeholder.com/40',
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
      avatar: 'https://via.placeholder.com/40',
    },
    type: 'text',
    content: '걷기로 출퇴근하면서 탄소발자국을 줄이고 있어요. 작은 실천이 모여 큰 변화를 만들 수 있다고 믿어요! 💚',
    liked: true,
    likeCount: 25,
    commentCount: 8,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
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
                <img
                  src={post.author.avatar}
                  alt={post.author.nickname}
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
