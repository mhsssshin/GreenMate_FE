'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react';
import { SignupRequest } from '@/types';
import { authAPI, tokenManager } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupRequest>({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    gender: 'MALE',
    age: 25,
    height: 170,
    weight: 65,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 이메일 검사
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    // 비밀번호 검사
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.';
    }

    // 비밀번호 확인 검사
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 닉네임 검사
    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (formData.nickname.length < 2 || formData.nickname.length > 10) {
      newErrors.nickname = '닉네임은 2-10자 사이여야 합니다.';
    }

    // 나이 검사
    if (!formData.age || formData.age < 13 || formData.age > 100) {
      newErrors.age = '나이는 13-100세 사이여야 합니다.';
    }

    // 키 검사
    if (!formData.height || formData.height < 100 || formData.height > 250) {
      newErrors.height = '키는 100-250cm 사이여야 합니다.';
    }

    // 몸무게 검사
    if (!formData.weight || formData.weight < 30 || formData.weight > 200) {
      newErrors.weight = '몸무게는 30-200kg 사이여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 에러 메시지 초기화
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await authAPI.signup(formData);
      
      // 토큰 및 사용자 정보 저장
      tokenManager.setToken(data.accessToken);
      tokenManager.setUser(data.user);
      
      // 성공 메시지와 함께 메인 페이지로 이동
      alert('회원가입이 완료되었습니다!');
      router.push('/m/sns');
    } catch (error) {
      console.error('회원가입 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 입력 필드 변경
  const handleInputChange = (field: keyof SignupRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 mr-8">
            회원가입
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
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

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 전체 에러 메시지 */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            </div>
          )}
          
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X size={16} className="mr-1" />
                {errors.email}
              </p>
            )}
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
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="8자 이상, 영문+숫자+특수문자"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X size={16} className="mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="비밀번호를 다시 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X size={16} className="mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                errors.nickname ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="닉네임을 입력하세요"
            />
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X size={16} className="mr-1" />
                {errors.nickname}
              </p>
            )}
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              성별
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={formData.gender === 'MALE'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700">남성</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={formData.gender === 'FEMALE'}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700">여성</span>
              </label>
            </div>
          </div>

          {/* 나이, 키, 몸무게 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                나이
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="25"
                min="13"
                max="100"
              />
              {errors.age && (
                <p className="mt-1 text-xs text-red-600">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                키 (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.height ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="170"
                min="100"
                max="250"
                step="0.1"
              />
              {errors.height && (
                <p className="mt-1 text-xs text-red-600">{errors.height}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                몸무게 (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.weight ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="65"
                min="30"
                max="200"
                step="0.1"
              />
              {errors.weight && (
                <p className="mt-1 text-xs text-red-600">{errors.weight}</p>
              )}
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              '회원가입'
            )}
          </button>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => router.push('/m/login')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                로그인
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
