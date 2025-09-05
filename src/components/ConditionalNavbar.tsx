'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // 로그인 페이지에서는 navbar를 숨김
  if (pathname === '/m/login') {
    return null;
  }
  
  return <Navbar />;
}
