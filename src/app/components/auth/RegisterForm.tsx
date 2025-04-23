'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register(username, email, password, displayName);
      if (success) {
        // 注册成功，跳转到登录页面并附带成功消息参数
        router.push('/auth/login?success=registered');
      } else {
        setError('用户名或邮箱已被使用');
      }
    } catch (err) {
      setError('注册时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="card bg-base-100 shadow-lg max-w-md mx-auto p-8 border-t-4 border-love-500">
      <h2 className="text-2xl font-bold text-center mb-8 text-love-600">注册恋爱清单</h2>
      
      {error && (
        <div className="alert alert-error mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-gray-700 font-medium">用户名</span>
          </label>
          <input
            type="text"
            placeholder="请输入用户名"
            className="input input-bordered w-full h-12 px-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-gray-700 font-medium">显示名称</span>
          </label>
          <input
            type="text"
            placeholder="请输入显示名称"
            className="input input-bordered w-full h-12 px-4"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        
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
            placeholder="请输入密码"
            className="input input-bordered w-full h-12 px-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-gray-700 font-medium">确认密码</span>
          </label>
          <input
            type="password"
            placeholder="请再次输入密码"
            className="input input-bordered w-full h-12 px-4"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control mt-8">
          <button
            type="submit"
            className={`btn btn-primary bg-love-500 hover:bg-love-600 w-full h-12 ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </div>
      </form>
    </div>
  );
} 