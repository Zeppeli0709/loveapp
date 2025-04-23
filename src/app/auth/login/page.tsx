import LoginForm from '../../components/auth/LoginForm';
import Link from 'next/link';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-love-100 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold text-love-600">恋爱待办清单</h1>
          <p className="text-gray-600 mt-2">登录您的账号以管理共同的爱情待办事项</p>
        </div>
        
        <Suspense fallback={<div className="card bg-base-100 shadow-lg max-w-md mx-auto p-8 border-t-4 border-love-500 text-center">加载中...</div>}>
          <LoginForm />
        </Suspense>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            还没有账号? {' '}
            <Link href="/auth/register" className="text-love-600 hover:underline">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 