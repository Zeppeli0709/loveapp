'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

/**
 * 登录表单组件
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccessful, setLoginSuccessful] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  
  // 检查是否已经登录
  useEffect(() => {
    if (isAuthenticated) {
      console.log('用户已登录，跳转到仪表盘...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // 调用登录函数
      await login(email, password);
      
      // 登录成功
      setLoginSuccessful(true);
      console.log('登录成功，账户信息已保存');
      
      // 显示成功消息后重定向
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('登录错误:', error);
      setError('登录失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  // 如果用户已经登录，直接跳转
  if (isAuthenticated && !loginSuccessful) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <p>您已登录，正在跳转到仪表盘...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-love-600 dark:text-love-400 mb-6 text-center">
        <span className="text-xl mr-2">❤️</span>登录爱心应用
      </h2>
      
      {loginSuccessful ? (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg mb-4 text-center">
          <p>登录成功！账户信息已永久保存</p>
          <p className="text-sm mt-1">正在跳转到首页...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-700 dark:text-gray-300">邮箱</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入您的邮箱"
              className="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-700 dark:text-gray-300">密码</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入您的密码"
              className="input input-bordered w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div className="form-control">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="label-text text-gray-700 dark:text-gray-300">
                永久保存账户信息（自动登录）
              </span>
            </label>
          </div>
          
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary bg-love-500 hover:bg-love-600 text-white w-full 
                ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              还没有账号？
              <Link href="/auth/register" className="text-love-500 hover:text-love-600 dark:text-love-400 ml-1">
                立即注册
              </Link>
            </p>
          </div>
        </form>
      )}
      
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          登录后您的账户信息将永久保存在此设备上，下次访问将自动登录。
        </p>
      </div>
    </div>
  );
} 