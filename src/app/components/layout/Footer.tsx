'use client';

import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

/**
 * 应用底部导航栏组件
 * @returns Footer组件
 */
export default function Footer() {
  const { isAuthenticated, currentUser } = useAuth();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 应用信息 */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold text-love-500 dark:text-love-300 mb-4">爱心APP</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center md:text-left">
              让爱情更甜蜜的情侣应用，通过完成任务、积分兑换和共同成长，让爱情更有趣！
            </p>
          </div>
          
          {/* 快速导航 */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-love-500 dark:text-love-300 mb-4">快速导航</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-love-500 dark:hover:text-love-300 transition-colors">
                  待办清单
                </Link>
              </li>
              <li>
                <Link href="/tasks/review" className="text-gray-600 dark:text-gray-300 hover:text-love-500 dark:hover:text-love-300 transition-colors">
                  任务审核
                </Link>
              </li>
              <li>
                <Link href="/gifts" className="text-gray-600 dark:text-gray-300 hover:text-love-500 dark:hover:text-love-300 transition-colors">
                  礼物兑换
                </Link>
              </li>
              {isAuthenticated ? (
                <li>
                  <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-love-500 dark:hover:text-love-300 transition-colors">
                    个人资料
                  </Link>
                </li>
              ) : (
                <li>
                  <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-love-500 dark:hover:text-love-300 transition-colors">
                    登录/注册
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          {/* 联系方式 */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-xl font-bold text-love-500 dark:text-love-300 mb-4">联系我们</h3>
            <div className="flex space-x-4 mb-4">
              <button className="btn btn-circle btn-sm bg-love-100 border-love-200 hover:bg-love-200">
                <span role="img" aria-label="微信" className="text-love-500">💬</span>
              </button>
              <button className="btn btn-circle btn-sm bg-love-100 border-love-200 hover:bg-love-200">
                <span role="img" aria-label="微博" className="text-love-500">🌐</span>
              </button>
              <button className="btn btn-circle btn-sm bg-love-100 border-love-200 hover:bg-love-200">
                <span role="img" aria-label="邮箱" className="text-love-500">✉️</span>
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm text-center md:text-right">
              有任何建议或问题？欢迎联系我们
            </p>
          </div>
        </div>
        
        {/* 版权信息 */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear} 爱心应用 - 让爱情更甜蜜 | 保留所有权利
          </p>
        </div>
      </div>
    </footer>
  );
} 