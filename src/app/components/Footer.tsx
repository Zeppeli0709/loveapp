'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

/**
 * 应用底部导航栏组件
 * @returns Footer组件
 */
export default function Footer() {
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-12">
        {/* 主要内容区 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 第一列：关于我们 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">爱心应用</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              让爱情更甜蜜的情侣应用，通过完成任务、积分兑换和共同成长，让爱情更有趣！
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-500 hover:text-love-500 transition-colors" aria-label="微信">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M8.51,12.51C6.76,12.51 5.33,11.08 5.33,9.33C5.33,7.58 6.76,6.15 8.51,6.15C10.26,6.15 11.69,7.58 11.69,9.33C11.69,11.08 10.26,12.51 8.51,12.51M8.51,7.65C7.58,7.65 6.83,8.4 6.83,9.33C6.83,10.25 7.58,11.01 8.51,11.01C9.43,11.01 10.19,10.25 10.19,9.33C10.19,8.4 9.43,7.65 8.51,7.65M18.13,9.33C18.13,11.08 16.7,12.51 14.95,12.51C13.2,12.51 11.77,11.08 11.77,9.33C11.77,7.58 13.2,6.15 14.95,6.15C16.7,6.15 18.13,7.58 18.13,9.33M16.63,9.33C16.63,8.4 15.88,7.65 14.95,7.65C14.03,7.65 13.27,8.4 13.27,9.33C13.27,10.25 14.03,11.01 14.95,11.01C15.88,11.01 16.63,10.25 16.63,9.33M5.33,18.67L6.67,15.33H10.78C13.07,15.33 14.95,13.69 15.33,11.41C15.68,11.53 16.04,11.59 16.42,11.59C16.83,11.59 17.23,11.5 17.61,11.37C17.38,14.58 14.79,17.13 11.63,17.38C7.09,17.73 2.04,19.61 2.04,19.61L2.27,14.89C3.3,14.69 4.66,14.3 4.66,14.3L4.67,14.97L5.33,18.67M22,8.92V15.92L18.95,15L16.3,20L12.84,14.5L22,8.92Z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-love-500 transition-colors" aria-label="微博">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M9.37,6.33C8.77,6.33 8.19,6.55 7.73,7C7.5,7.22 7.3,7.5 7.16,7.81L7.74,7.46C8.13,7.23 8.58,7.12 9.03,7.12C10.33,7.12 11.17,8.04 11.17,9.34H11.18V10.28H11.87V9.34C11.87,8.17 11.06,7.16 9.96,6.7C9.78,6.63 9.57,6.57 9.37,6.53V6.33M10.03,9.5C9.7,9.5 9.37,9.71 9.37,10.28H10.7C10.7,9.71 10.37,9.5 10.03,9.5M16.76,9.97C16.76,9.79 16.76,9.62 16.74,9.46H16.08V10.39C16.08,10.97 15.96,11.39 14.93,11.39H13.33V12.06H15C16.34,12.06 16.1,13.33 16.1,13.33L18.47,9.97H16.76M18.5,5.5V18.5H5.5V5.5H18.5M20,20V4H4V20H20Z" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-love-500 transition-colors" aria-label="邮箱">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* 第二列：快速导航 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">功能导航</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-love-500 dark:hover:text-love-300 transition-colors text-sm">
                  待办清单
                </Link>
              </li>
              <li>
                <Link href="/tasks/review" className="text-gray-600 dark:text-gray-400 hover:text-love-500 dark:hover:text-love-300 transition-colors text-sm">
                  任务审核
                </Link>
              </li>
              <li>
                <Link href="/gifts" className="text-gray-600 dark:text-gray-400 hover:text-love-500 dark:hover:text-love-300 transition-colors text-sm">
                  礼物兑换
                </Link>
              </li>
              <li>
                <Link href="/anniversary" className="text-gray-600 dark:text-gray-400 hover:text-love-500 dark:hover:text-love-300 transition-colors text-sm">
                  纪念日
                </Link>
              </li>
            </ul>
          </div>
          
          {/* 第三列：账户 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">账户</h3>
            <ul className="space-y-2">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/profile" className="text-gray-600 dark:text-gray-400 hover:text-love-500 dark:hover:text-love-300 transition-colors text-sm">
                      个人资料
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="text-gray-600 dark:text-gray-400 hover:text-love-500 dark:hover:text-love-300 transition-colors text-sm">
                      设置
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/login" className="text-gray-600 dark:text-gray-400 hover:text-love-500 dark:hover:text-love-300 transition-colors text-sm">
                      登录
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/register" className="text-gray-600 dark:text-gray-400 hover:text-love-500 dark:hover:text-love-300 transition-colors text-sm">
                      注册
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          {/* 第四列：联系我们 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">联系我们</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              如有任何建议或问题，请随时联系我们。
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              电子邮件: support@loveapp.com
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              工作时间: 周一至周五 9:00-18:00
            </p>
          </div>
        </div>
        
        {/* 底部版权信息 */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} 爱心应用 - 让爱情更甜蜜 | 保留所有权利
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                服务条款
              </Link>
              <Link href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                隐私政策
              </Link>
              <Link href="/help" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                帮助中心
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 