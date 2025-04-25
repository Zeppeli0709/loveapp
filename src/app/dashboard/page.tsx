'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import TodoList from '../components/TodoList';

/**
 * 仪表盘页面
 */
export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // 验证用户是否已登录
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('用户未登录，重定向到登录页面');
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);
  
  // 如果未登录，显示加载中
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p>正在验证登录状态...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-love-600 dark:text-love-400 mb-8 text-center">
        💖 爱心仪表盘 💖
      </h1>
      
      <TodoList />
    </div>
  );
} 