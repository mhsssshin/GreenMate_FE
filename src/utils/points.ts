// 포인트 관련 유틸리티 함수들

export interface PointTransaction {
  id: string;
  type: 'earn' | 'use' | 'bonus';
  amount: number;
  description: string;
  tripRecordId?: string;
  challengeId?: string;
  createdAt: string;
}

// 포인트 계산 함수들
export const calculateWalkingPoints = (distance: number): number => {
  // 거리 1km당 10포인트
  return Math.round(distance * 10);
};

export const calculateChallengePoints = (challengeId: string): number => {
  // 챌린지별 포인트 (하드코딩)
  const challengePoints: { [key: string]: number } = {
    '1': 50,  // 걷기 챌린지
    '2': 30,  // 재활용 챌린지
    '3': 40,  // 탄소절약 챌린지
    '4': 25,  // 절약 챌린지
    '5': 20,  // 식물 챌린지
    '6': 15,  // 디지털 챌린지
    '7': 35,  // 에너지 절약 챌린지
    '8': 20,  // 친환경 챌린지
  };
  
  return challengePoints[challengeId] || 0;
};

// 포인트 추가 함수
export const addPoints = (type: 'walking' | 'challenge', data: any): PointTransaction => {
  const transaction: PointTransaction = {
    id: `${type}-${Date.now()}`,
    type: 'earn',
    amount: 0,
    description: '',
    createdAt: new Date().toISOString(),
  };

  if (type === 'walking') {
    transaction.amount = calculateWalkingPoints(data.distance);
    transaction.description = `${data.courseName} 완주`;
    transaction.tripRecordId = data.courseId;
  } else if (type === 'challenge') {
    transaction.amount = calculateChallengePoints(data.challengeId);
    transaction.description = `${data.challengeTitle} 완료`;
    transaction.challengeId = data.challengeId;
  }

  return transaction;
};

// 로컬 스토리지에서 포인트 데이터 관리
export const getPointsData = () => {
  try {
    const data = localStorage.getItem('points-data');
    return data ? JSON.parse(data) : {
      balance: 0,
      transactions: [],
      weeklyEarned: 0,
      monthlyEarned: 0,
    };
  } catch (error) {
    console.error('포인트 데이터 로드 실패:', error);
    return {
      balance: 0,
      transactions: [],
      weeklyEarned: 0,
      monthlyEarned: 0,
    };
  }
};

export const savePointsData = (data: any) => {
  try {
    localStorage.setItem('points-data', JSON.stringify(data));
  } catch (error) {
    console.error('포인트 데이터 저장 실패:', error);
  }
};

export const updatePoints = (transaction: PointTransaction) => {
  const pointsData = getPointsData();
  
  // 포인트 잔액 업데이트
  pointsData.balance += transaction.amount;
  
  // 거래 내역 추가 (맨 앞에)
  pointsData.transactions.unshift(transaction);
  
  // 주간/월간 적립 포인트 계산
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  pointsData.weeklyEarned = pointsData.transactions
    .filter((t: PointTransaction) => new Date(t.createdAt) >= oneWeekAgo && t.type === 'earn')
    .reduce((sum: number, t: PointTransaction) => sum + t.amount, 0);
    
  pointsData.monthlyEarned = pointsData.transactions
    .filter((t: PointTransaction) => new Date(t.createdAt) >= oneMonthAgo && t.type === 'earn')
    .reduce((sum: number, t: PointTransaction) => sum + t.amount, 0);
  
  savePointsData(pointsData);
  return pointsData;
};
