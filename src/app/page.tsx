'use client';

import { useAuth } from './contexts/AuthContext';
import Link from 'next/link';

/**
 * 应用主页组件
 */
export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-love-100 to-white dark:from-gray-800 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-love-600 dark:text-love-400 mb-6">
            记录爱的每一刻
          </h1>
          <p className="text-xl text-love-500 dark:text-love-300 mb-10">
            轻松管理恋爱中的待办事项、纪念日和重要时刻，让你们的关系更紧密
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link 
                href="/dashboard" 
                className="btn btn-primary bg-love-500 hover:bg-love-600 text-white border-none px-8 py-3 text-lg"
              >
                进入应用
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="btn btn-primary bg-love-500 hover:bg-love-600 text-white border-none px-8 py-3 text-lg"
                >
                  立即登录
                </Link>
                <Link 
                  href="/auth/register" 
                  className="btn btn-outline border-love-500 text-love-500 hover:bg-love-50 dark:text-love-300 dark:border-love-400 px-8 py-3 text-lg"
                >
                  免费注册
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-love-500 dark:text-love-300 mb-2">爱的待办事项</h2>
            <p className="text-gray-600 dark:text-gray-300">轻松记录你们需要完成的事情，从约会计划到日常关心</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🎂</div>
            <h2 className="text-xl font-bold text-love-500 dark:text-love-300 mb-2">重要纪念日</h2>
            <p className="text-gray-600 dark:text-gray-300">永不错过两人间的重要日子，和回忆那些特别的时刻</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">💖</div>
            <h2 className="text-xl font-bold text-love-500 dark:text-love-300 mb-2">真心连接</h2>
            <p className="text-gray-600 dark:text-gray-300">和伴侣共同管理生活中的大小事，让爱更加深厚</p>
          </div>
        </div>
      </div>
    </div>
  );
}