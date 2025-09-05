'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { LoginRequest } from '@/types';
import { authAPI, tokenManager } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 폼 유효성 검사 (검증 제거)
  const validateForm = (): boolean => {
    // 모든 검증을 제거하고 항상 true 반환
    setErrors({});
    return true;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 로그인 체크 없이 바로 메인 페이지로 이동
    setIsLoading(true);
    
    // 간단한 로딩 시뮬레이션
    setTimeout(() => {
      alert('로그인되었습니다!');
      router.push('/m/sns');
      setIsLoading(false);
    }, 500);
  };

  // 입력 필드 변경
  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 max-w-md mx-auto pt-8">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Image
            src="/images/greenmate-logo.svg"
            alt="GreenMate"
            width={80}
            height={80}
            className="w-20 h-20 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">GreenMate</h2>
          <p className="text-gray-600">건강한 걷기, 지속가능한 미래</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900 bg-white"
              placeholder="아무거나 입력하세요"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900 bg-white"
                placeholder="아무거나 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              '로그인'
            )}
          </button>

          {/* 회원가입 링크 */}
          <div className="text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => router.push('/m/signup')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                회원가입
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
