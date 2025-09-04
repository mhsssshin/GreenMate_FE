'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MapPin, Coins, User } from 'lucide-react';

const tabs = [
  { id: 'sns', label: 'SNS', icon: Home, path: '/sns' },
  { id: 'walk', label: '걷깅', icon: MapPin, path: '/walk' },
  { id: 'points', label: '포인트', icon: Coins, path: '/points' },
  { id: 'mypage', label: 'MyPage', icon: User, path: '/mypage' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    const currentTab = tabs.find(tab => pathname.startsWith(tab.path));
    return currentTab?.id || 'sns';
  });

  const handleTabClick = (tab: typeof tabs[0]) => {
    setActiveTab(tab.id);
    router.push(tab.path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 safe-top">

      {/* 탭 네비게이션 */}
      <div className="flex bg-white border-b border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`navbar-tab ${
                isActive ? 'navbar-tab-active' : 'navbar-tab-inactive'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon 
                  size={20} 
                  className={isActive ? 'text-primary-500' : 'text-gray-400'} 
                />
                <span className="text-xs">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
