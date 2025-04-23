'use client';

import { useAuth } from './contexts/AuthContext';
import Link from 'next/link';

/**
 * 应用主页组件
 */
export default function Home() {
  const { isAuthenticated, currentUser, partner } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-love-100 to-white">
      {/* 头部区域 */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-love-600 mb-4">恋爱待办清单</h1>
        <p className="text-love-500 text-xl mb-8">记录爱情中的每一个重要瞬间</p>
        
        {isAuthenticated ? (
          <div className="flex flex-col items-center">
            <div className="mb-6 text-love-600">
              <p className="text-2xl font-bold">欢迎回来，{currentUser?.displayName}</p>
              {partner ? (
                <p className="mt-2">你和 {partner.displayName} 已经建立了恋爱关系</p>
              ) : (
                <p className="mt-2">你还没有添加恋人，快去寻找你的另一半吧！</p>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard" className="btn btn-primary bg-love-500 hover:bg-love-600 border-none">
                查看待办清单
              </Link>
              {!partner ? (
                <Link href="/relationship" className="btn btn-outline border-love-400 text-love-600 hover:bg-love-50">
                  寻找恋人
                </Link>
              ) : (
                <Link href="/anniversaries" className="btn btn-outline border-love-400 text-love-600 hover:bg-love-50">
                  管理纪念日
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/login" className="btn btn-primary bg-love-500 hover:bg-love-600 border-none">
              登录
            </Link>
            <Link href="/auth/register" className="btn btn-outline border-love-400 text-love-600 hover:bg-love-50">
              注册
            </Link>
          </div>
        )}
      </div>
      
      {/* 功能介绍区域 */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-love-600 mb-12">为爱情定制的待办清单</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
            <div className="text-4xl mb-4">💑</div>
            <h3 className="text-xl font-bold text-love-600 mb-2">伴侣关系</h3>
            <p className="text-gray-600">与你的爱人连接，共同创建和管理属于你们的待办事项</p>
          </div>
          
          <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-love-600 mb-2">爱的任务</h3>
            <p className="text-gray-600">记录重要约会、礼物、关心事项，不再错过任何表达爱的机会</p>
          </div>
          
          <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
            <div className="text-4xl mb-4">🎂</div>
            <h3 className="text-xl font-bold text-love-600 mb-2">纪念日</h3>
            <p className="text-gray-600">管理你们之间的特殊日子，获得及时提醒，让每个纪念日都被珍视</p>
          </div>
        </div>
      </div>
      
      {/* 底部区域 */}
      <footer className="bg-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">❤️ 恋爱待办清单 - 记录美好，珍视爱情 ❤️</p>
        </div>
      </footer>
    </div>
  );
}