import { redirect } from 'next/navigation';

export default function HomePage() {
  // 기본 페이지는 SNS로 리다이렉트
  redirect('/sns');
}
