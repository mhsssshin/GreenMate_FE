'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Star, Trophy, Target, Zap } from 'lucide-react';
import { addPoints, updatePoints } from '@/utils/points';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  status: 'completed' | 'pending' | 'available';
  category: 'walking' | 'environment' | 'social' | 'digital';
  progress?: number;
  maxProgress?: number;
}

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: '걷기 챌린지',
    description: '오늘 10,000보 걷기',
    icon: '🚶‍♂️',
    points: 50,
    status: 'completed',
    category: 'walking',
    progress: 10000,
    maxProgress: 10000,
  },
  {
    id: '2',
    title: '재활용 챌린지',
    description: '플라스틱 분리수거하기',
    icon: '♻️',
    points: 30,
    status: 'pending',
    category: 'environment',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: '3',
    title: '탄소절약 챌린지',
    description: '대중교통 이용하기',
    icon: '🌱',
    points: 40,
    status: 'pending',
    category: 'environment',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: '4',
    title: '절약 챌린지',
    description: '물 절약하기',
    icon: '💧',
    points: 25,
    status: 'available',
    category: 'environment',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: '5',
    title: '식물 챌린지',
    description: '화분에 물주기',
    icon: '🌿',
    points: 20,
    status: 'available',
    category: 'environment',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: '6',
    title: '디지털 챌린지',
    description: '불필요한 앱 삭제하기',
    icon: '📱',
    points: 15,
    status: 'available',
    category: 'digital',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: '7',
    title: '에너지 절약 챌린지',
    description: '불필요한 전자기기 끄기',
    icon: '⚡',
    points: 35,
    status: 'available',
    category: 'environment',
    progress: 0,
    maxProgress: 1,
  },
  {
    id: '8',
    title: '친환경 챌린지',
    description: '장바구니 사용하기',
    icon: '🛍️',
    points: 20,
    status: 'available',
    category: 'environment',
    progress: 0,
    maxProgress: 1,
  },
];

export default function ChallengePage() {
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userStats, setUserStats] = useState({
    completedChallenges: 3,
    totalPoints: 120,
    streakDays: 7,
  });

  const categories = [
    { id: 'all', label: '전체', icon: '🎯' },
    { id: 'walking', label: '걷기', icon: '🚶‍♂️' },
    { id: 'environment', label: '환경', icon: '🌱' },
    { id: 'social', label: '사회', icon: '🤝' },
    { id: 'digital', label: '디지털', icon: '📱' },
  ];

  const filteredChallenges = selectedCategory === 'all' 
    ? challenges 
    : challenges.filter(challenge => challenge.category === selectedCategory);

  const handleChallengeToggle = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        const newStatus = challenge.status === 'completed' ? 'pending' : 'completed';
        
        // 챌린지 완료 시 포인트 추가
        if (newStatus === 'completed') {
          const transaction = addPoints('challenge', {
            challengeId: challenge.id,
            challengeTitle: challenge.title,
          });
          
          const updatedPointsData = updatePoints(transaction);
          console.log('챌린지 완료 포인트 추가:', transaction);
          console.log('업데이트된 포인트 데이터:', updatedPointsData);
          
          // 사용자 통계 업데이트
          setUserStats(prev => ({
            ...prev,
            completedChallenges: prev.completedChallenges + 1,
            totalPoints: prev.totalPoints + transaction.amount,
          }));
        } else {
          // 챌린지 취소 시 포인트 차감
          setUserStats(prev => ({
            ...prev,
            completedChallenges: Math.max(0, prev.completedChallenges - 1),
            totalPoints: Math.max(0, prev.totalPoints - challenge.points),
          }));
        }
        
        return { ...challenge, status: newStatus };
      }
      return challenge;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'pending':
        return '진행중';
      default:
        return '신규';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">ESG 챌린지</h1>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">{userStats.totalPoints}점</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">{userStats.completedChallenges}</div>
            <div className="text-xs text-gray-500">완료한 챌린지</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">{userStats.totalPoints}</div>
            <div className="text-xs text-gray-500">획득한 포인트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">{userStats.streakDays}</div>
            <div className="text-xs text-gray-500">연속 참여일</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Challenges List */}
      <div className="p-4 space-y-4">
        {filteredChallenges.map((challenge) => (
          <div key={challenge.id} className="card">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{challenge.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(challenge.status)}`}>
                    {getStatusIcon(challenge.status)}
                    <span>{getStatusText(challenge.status)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                
                {challenge.progress !== undefined && challenge.maxProgress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>진행률</span>
                      <span>{Math.round((challenge.progress / challenge.maxProgress) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">+{challenge.points} 포인트</span>
                  </div>
                  <button
                    onClick={() => handleChallengeToggle(challenge.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      challenge.status === 'completed'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {challenge.status === 'completed' ? '완료됨' : '시작하기'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Challenge Highlight */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-5 h-5" />
            <h3 className="font-semibold">오늘의 특별 챌린지</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">친구와 함께 걷기 챌린지에 참여해보세요!</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">+100 포인트</span>
            <button className="bg-white text-primary-500 px-4 py-2 rounded-lg text-sm font-medium">
              참여하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
