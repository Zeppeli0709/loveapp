'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/auth';

/**
 * 用户个人资料页面
 */
export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 当用户信息加载时更新表单状态
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName);
      setEmail(currentUser.email);
      setUsername(currentUser.username);
      setAvatarUrl(currentUser.avatar || '');
    }
  }, [currentUser]);

  // 如果未登录，显示提示信息
  if (!currentUser) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-love-500 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">您需要登录才能查看个人资料</p>
          <a href="/auth/login" className="btn btn-primary bg-love-500 hover:bg-love-600 text-white border-none">
            前往登录
          </a>
        </div>
      </div>
    );
  }

  const handleSaveProfile = () => {
    try {
      // 获取所有用户
      const usersJson = localStorage.getItem('users') || '[]';
      const users: User[] = JSON.parse(usersJson);
      
      // 更新当前用户信息
      const updatedUsers = users.map(user => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            displayName,
            email,
            username,
            avatar: avatarUrl
          };
        }
        return user;
      });
      
      // 保存回本地存储
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // 更新当前用户在本地存储中的信息
      const updatedUser = {
        ...currentUser,
        displayName,
        email,
        username,
        avatar: avatarUrl
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setSuccessMessage('个人资料已更新');
      setErrorMessage('');
      setIsEditing(false);

      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('保存个人资料时出错:', error);
      setErrorMessage('保存个人资料时出错');
      setSuccessMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-love-300">
        <h1 className="text-2xl font-bold text-love-500 mb-6 text-center">个人资料</h1>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorMessage}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* 头像部分 */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 bg-gray-200 flex items-center justify-center border-2 border-love-300">
              {avatarUrl ? (
                <img src={avatarUrl} alt="用户头像" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-love-300">
                  {displayName ? displayName.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>
            
            {isEditing && (
              <div className="w-full">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  头像链接
                </label>
                <input 
                  type="text"
                  className="input input-bordered w-full"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="输入头像图片URL"
                />
              </div>
            )}
          </div>
          
          {/* 个人信息部分 */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    用户名
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    显示名称
                  </label>
                  <input 
                    type="text"
                    className="input input-bordered w-full"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    电子邮箱
                  </label>
                  <input 
                    type="email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    className="btn btn-primary bg-love-500 hover:bg-love-600 border-none"
                    onClick={handleSaveProfile}
                  >
                    保存
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setIsEditing(false);
                      // 重置为原始值
                      if (currentUser) {
                        setDisplayName(currentUser.displayName);
                        setEmail(currentUser.email);
                        setUsername(currentUser.username);
                        setAvatarUrl(currentUser.avatar || '');
                      }
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-700 font-medium">用户名:</span>
                  <span className="col-span-2">{currentUser.username}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-700 font-medium">显示名称:</span>
                  <span className="col-span-2">{currentUser.displayName}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-700 font-medium">电子邮箱:</span>
                  <span className="col-span-2">{currentUser.email}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-700 font-medium">注册日期:</span>
                  <span className="col-span-2">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="pt-4">
                  <button 
                    className="btn btn-primary bg-love-500 hover:bg-love-600 border-none"
                    onClick={() => setIsEditing(true)}
                  >
                    编辑个人资料
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 