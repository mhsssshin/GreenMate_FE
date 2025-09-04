import { redirect } from 'next/navigation';

export default function MobileHomePage() {
  // /m/ 접근 시 SNS로 리다이렉트
  redirect('/m/sns');
}
