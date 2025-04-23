'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 检查URL参数中是否有成功消息
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'registered') {
      setSuccessMessage('注册成功！请使用您的账号信息登录系统。');
    }
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        // 登录成功后显示成功消息并跳转
        setSuccessMessage('登录成功，正在跳转...');
        // 跳转到 dashboard 页面
        router.push('/dashboard');
      } else {
        setError('邮箱或密码不正确');
      }
    } catch (err) {
      setError('登录时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card bg-base-100 shadow-lg max-w-md mx-auto p-8 border-t-4 border-love-500">
      <h2 className="text-2xl font-bold text-center mb-8 text-love-600">登录恋爱清单</h2>
      
      {successMessage && (
        <div className="alert alert-success mb-6">
          <p>{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-gray-700 font-medium">电子邮箱</span>
          </label>
          <input
            type="email"
            placeholder="请输入您的电子邮箱"
            className="input input-bordered w-full h-12 px-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-gray-700 font-medium">密码</span>
          </label>
          <input
            type="password"
            placeholder="请输入您的密码"
            className="input input-bordered w-full h-12 px-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="label">
            <a href="#" className="label-text-alt link link-hover text-love-500">忘记密码?</a>
          </label>
        </div>
        
        <div className="form-control mt-8">
          <button
            type="submit"
            className={`btn btn-primary bg-love-500 hover:bg-love-600 w-full h-12 ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </div>
      </form>
    </div>
  );
} 