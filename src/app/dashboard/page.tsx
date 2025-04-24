'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import TodoList from '../components/TodoList';
import Link from 'next/link';
import { Todo, PointHistory } from '../types';

// 初始化待办事项数据
function initializeTodosIfEmpty() {
  const existingTodos = localStorage.getItem('loveTodos');
  if (!existingTodos || JSON.parse(existingTodos).length === 0) {
    // 获取当前用户
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const user = JSON.parse(currentUser);
    
    // 创建一些示例待办事项
    const exampleTodos: Todo[] = [
      {
        id: '1',
        title: '准备周末约会',
        description: '计划去看电影和共进晚餐',
        completed: false,
        priority: 'high',
        partnerTag: 'both',
        loveType: 'date',
        createdAt: new Date(),
        createdById: user.id,
        relationshipId: '1', // 假设关系ID为1
        isShared: true,
        points: 20,
        reviewStatus: 'not_submitted'
      },
      {
        id: '2',
        title: '准备一份小惊喜',
        description: '买一份小礼物或写一张爱的便条',
        completed: false,
        priority: 'medium',
        partnerTag: 'self',
        loveType: 'gift',
        createdAt: new Date(),
        createdById: user.id,
        relationshipId: '1',
        isShared: false,
        points: 15,
        reviewStatus: 'not_submitted'
      },
      {
        id: '3',
        title: '记得说晚安',
        description: '每天睡前互道晚安',
        completed: false,
        priority: 'low',
        partnerTag: 'both',
        loveType: 'care',
        createdAt: new Date(),
        createdById: user.id,
        relationshipId: '1',
        isShared: true,
        points: 5,
        reviewStatus: 'not_submitted'
      }
    ];
    
    localStorage.setItem('loveTodos', JSON.stringify(exampleTodos));
  }
}

// 初始化积分历史
function initializePointHistoryIfEmpty() {
  const existingPointHistory = localStorage.getItem('pointHistory');
  if (!existingPointHistory || JSON.parse(existingPointHistory).length === 0) {
    // 获取当前用户
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    
    const user = JSON.parse(currentUser);
    
    // 创建示例积分历史
    const examplePointHistory: PointHistory[] = [
      {
        id: '1',
        userId: user.id,
        relationshipId: '1',
        pointsChange: 50,
        totalPoints: 50,
        reason: '注册奖励',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7天前
      }
    ];
    
    localStorage.setItem('pointHistory', JSON.stringify(examplePointHistory));
  }
}

// 初始化礼物数据
function initializeGiftsIfEmpty() {
  // 只初始化礼物目录，不要重置已兑换的礼物
  const existingGifts = localStorage.getItem('gifts');
  if (!existingGifts) {
    console.log("初始化礼物目录");
    const defaultGifts = [
      {
        id: '1',
        name: '爱心鲜花',
        description: '虚拟的爱心鲜花，表达对伴侣的爱意',
        type: 'flower',
        requiredPoints: 50,
        imageUrl: undefined
      },
      {
        id: '2',
        name: '爱心宠物',
        description: '可爱的虚拟宠物，陪伴你们的爱情旅程',
        type: 'pet',
        requiredPoints: 100,
        imageUrl: undefined
      },
      {
        id: '3',
        name: '爱心戒指',
        description: '象征永恒的爱情戒指',
        type: 'ring',
        requiredPoints: 200,
        imageUrl: undefined
      },
      {
        id: '4',
        name: '浪漫晚餐',
        description: '在家中准备一顿浪漫的晚餐',
        type: 'other',
        requiredPoints: 150,
        imageUrl: undefined
      },
      {
        id: '5',
        name: '电影之夜',
        description: '一起观看喜爱的电影',
        type: 'other',
        requiredPoints: 80,
        imageUrl: undefined
      }
    ];
    localStorage.setItem('gifts', JSON.stringify(defaultGifts));
  }
}

export default function DashboardPage() {
  const { isAuthenticated, currentUser, partner, relationship } = useAuth();
  const router = useRouter();
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (currentUser && relationship) {
      // 初始化数据
      initializeTodosIfEmpty();
      initializePointHistoryIfEmpty();
      initializeGiftsIfEmpty(); // 添加礼物初始化
      
      // 检查是否处于调试模式
      const urlParams = new URLSearchParams(window.location.search);
      setDebugMode(urlParams.get('debug') === 'true');
    }
  }, [isAuthenticated, router, currentUser, relationship]);

  // 检查待审核任务数量
  useEffect(() => {
    if (!currentUser || !partner) return;

    // 从本地存储加载所有任务
    const storedTodos = localStorage.getItem('loveTodos');
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos);
        // 筛选出需要当前用户审核的任务
        const tasksToReview = parsedTodos.filter((todo: Todo) => {
          return todo.reviewStatus === 'pending' && 
                 todo.createdById === partner.id &&
                 relationship && todo.relationshipId === relationship.id;
        });
        
        setPendingReviewCount(tasksToReview.length);
        console.log("找到待审核任务数量:", tasksToReview.length);
        
        if (tasksToReview.length > 0) {
          console.log("待审核任务列表:");
          tasksToReview.forEach((task: Todo) => {
            console.log(`- ${task.title} (ID: ${task.id}, 创建者: ${task.createdById})`);
          });
        }
      } catch (e) {
        console.error('检查待审核任务时出错:', e);
      }
    }
  }, [currentUser, partner, relationship]);

  // 强制刷新所有本地存储的数据
  const refreshAllData = () => {
    // 获取所有数据项重新保存，触发更新
    const storedTodos = localStorage.getItem('loveTodos');
    if (storedTodos) {
      localStorage.setItem('loveTodos', storedTodos);
    }
    
    const storedPointHistory = localStorage.getItem('pointHistory');
    if (storedPointHistory) {
      localStorage.setItem('pointHistory', storedPointHistory);
    }
    
    const storedGifts = localStorage.getItem('gifts');
    if (storedGifts) {
      localStorage.setItem('gifts', storedGifts);
    }
    
    const storedRedeemedGifts = localStorage.getItem('redeemedGifts');
    if (storedRedeemedGifts) {
      localStorage.setItem('redeemedGifts', storedRedeemedGifts);
    }
    
    // 显示成功消息
    setMessage("数据已重新加载!");
    setTimeout(() => setMessage(''), 3000);
    
    // 刷新页面
    window.location.reload();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* 页面标题区域 */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            我的<span className="text-love-500">爱心</span>待办
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            与伴侣一起记录、分享和完成爱的任务，让关系更加甜蜜
          </p>
          
          {debugMode && (
            <div className="mt-4">
              <button 
                onClick={refreshAllData}
                className="btn btn-sm btn-outline"
              >
                刷新数据
              </button>
              <Link href="/debug" className="btn btn-sm btn-error ml-2">
                调试页面
              </Link>
              {message && <div className="text-sm text-green-500 mt-2">{message}</div>}
            </div>
          )}
        </header>
        
        {/* 快捷导航卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Link href="/tasks/review" 
                className="flex flex-col items-center justify-center p-6 bg-love-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            {pendingReviewCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {pendingReviewCount}
              </span>
            )}
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-love-100 dark:bg-love-900 mb-4">
              <span className="text-2xl" role="img" aria-label="审核">✅</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">任务审核</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
              查看并审核伴侣完成的任务
            </p>
          </Link>
          
          <Link href="/gifts"
                className="flex flex-col items-center justify-center p-6 bg-love-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-love-100 dark:bg-love-900 mb-4">
              <span className="text-2xl" role="img" aria-label="礼物">🎁</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">礼物兑换</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
              用积分兑换爱的礼物与惊喜
            </p>
          </Link>
          
          <Link href="/profile"
                className="flex flex-col items-center justify-center p-6 bg-love-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-love-100 dark:bg-love-900 mb-4">
              <span className="text-2xl" role="img" aria-label="个人">👤</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">个人中心</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
              查看个人资料与积分记录
            </p>
          </Link>
        </div>
        
        {/* 待办清单组件 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">爱心待办清单</h2>
          </div>
          <TodoList />
        </div>
      </div>
    </div>
  );
} 