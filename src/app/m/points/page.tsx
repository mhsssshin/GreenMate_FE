'use client';

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, Calendar, Gift, Award } from 'lucide-react';
import { PointTransaction } from '@/types';
import { getPointsData } from '@/utils/points';

// 더미 데이터
const mockTransactions: PointTransaction[] = [
  {
    id: '1',
    type: 'earn',
    amount: 50,
    description: '강남역 → 신논현역 걷기 완료',
    tripRecordId: 'route1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'earn',
    amount: 30,
    description: '일일 걷기 목표 달성',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    type: 'bonus',
    amount: 100,
    description: '첫 걷기 완료 보너스',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '4',
    type: 'earn',
    amount: 40,
    description: '홍대입구역 → 상수역 걷기 완료',
    tripRecordId: 'route2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function PointsPage() {
  const [balance, setBalance] = useState(0);
  const [weeklyEarned, setWeeklyEarned] = useState(0);
  const [monthlyEarned, setMonthlyEarned] = useState(0);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);

  // 컴포넌트 마운트 시 포인트 데이터 로드
  useEffect(() => {
    const loadPointsData = () => {
      try {
        const pointsData = getPointsData();
        setBalance(pointsData.balance);
        setWeeklyEarned(pointsData.weeklyEarned);
        setMonthlyEarned(pointsData.monthlyEarned);
        setTransactions(pointsData.transactions);
      } catch (error) {
        console.error('포인트 데이터 로드 실패:', error);
        // 실패 시 더미 데이터 사용
        setBalance(220);
        setWeeklyEarned(120);
        setMonthlyEarned(450);
        setTransactions(mockTransactions);
      }
    };

    loadPointsData();
  }, []);

  const getTransactionIcon = (type: PointTransaction['type']) => {
    switch (type) {
      case 'earn':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'use':
        return <Coins size={16} className="text-red-500" />;
      case 'bonus':
        return <Gift size={16} className="text-purple-500" />;
      default:
        return <Coins size={16} className="text-gray-500" />;
    }
  };

  const getTransactionColor = (type: PointTransaction['type']) => {
    switch (type) {
      case 'earn':
        return 'text-green-600';
      case 'use':
        return 'text-red-600';
      case 'bonus':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '오늘';
    if (diffInDays === 1) return '어제';
    if (diffInDays < 7) return `${diffInDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="p-4 space-y-6">
        {/* 포인트 요약 카드 */}
        <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Coins size={24} />
              <span className="text-lg font-semibold">보유 포인트</span>
            </div>
            <Award size={24} className="text-primary-200" />
          </div>
          
          <div className="text-3xl font-bold mb-2">{balance.toLocaleString()}P</div>
          
          <div className="flex justify-between text-sm text-primary-100">
            <div className="text-center">
              <div className="font-medium">이번 주</div>
              <div className="text-lg font-semibold">+{weeklyEarned}P</div>
            </div>
            <div className="text-center">
              <div className="font-medium">이번 달</div>
              <div className="text-lg font-semibold">+{monthlyEarned}P</div>
            </div>
          </div>
        </div>

        {/* 적립 규칙 안내 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">포인트 적립 규칙</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp size={16} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">걷기 완료</p>
                <p className="text-sm text-gray-600">거리 1km당 10P 적립</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">일일 목표 달성</p>
                <p className="text-sm text-gray-600">10,000보 달성 시 30P 보너스</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Gift size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">특별 보너스</p>
                <p className="text-sm text-gray-600">첫 걷기, 연속 달성 등</p>
              </div>
            </div>
          </div>
        </div>

        {/* 포인트 내역 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">포인트 내역</h2>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'use' ? '-' : '+'}{transaction.amount}P
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Coins size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">포인트 내역이 없습니다</p>
              <p className="text-sm text-gray-400 mt-1">걷기를 시작해서 포인트를 적립해보세요!</p>
            </div>
          )}
        </div>

        {/* 포인트 사용 안내 */}
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Gift size={16} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-900">포인트 사용처</h3>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            적립한 포인트로 다양한 혜택을 받아보세요!
          </p>
          <div className="text-sm text-blue-600">
            <p>• 환경 기부 (100P = 1,000원 상당)</p>
            <p>• 건강 관련 상품 구매</p>
            <p>• 프리미엄 기능 이용</p>
          </div>
        </div>
      </div>
    </div>
  );
}
