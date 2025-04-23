'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import TodoList from '../components/TodoList';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-love-100 to-white dark:from-gray-800 dark:to-gray-900 py-8 min-h-[calc(100vh-64px)]">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-love-600 dark:text-love-400 mb-2">我的恋爱待办清单</h1>
          <p className="text-love-500 dark:text-love-300">管理您和伴侣之间的爱与承诺</p>
        </header>
        
        <TodoList />
      </div>
    </div>
  );
} 