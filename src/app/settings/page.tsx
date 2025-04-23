'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * 用户设置界面
 */
export default function SettingsPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    allowFriendRequests: true,
    showActivityStatus: true,
  });
  const [language, setLanguage] = useState('zh-CN');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 从本地存储加载设置
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const savedSettings = localStorage.getItem(`settings_${currentUser.id}`);
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setDarkMode(settings.darkMode || false);
          setEmailNotifications(settings.emailNotifications !== false);
          setPrivacySettings(settings.privacySettings || {
            showProfile: true,
            allowFriendRequests: true,
            showActivityStatus: true,
          });
          setLanguage(settings.language || 'zh-CN');
          
          // 应用深色模式设置
          if (settings.darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'loveDarkTheme');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'loveTheme');
          }
          
          // 应用语言设置
          document.documentElement.lang = settings.language || 'zh-CN';
        } catch (e) {
          console.error('解析设置时出错:', e);
        }
      }
    }
  }, [currentUser, isAuthenticated]);

  // 如果未登录，显示提示信息
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-love-500 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">您需要登录才能查看设置</p>
          <a href="/auth/login" className="btn btn-primary bg-love-500 hover:bg-love-600 text-white border-none">
            前往登录
          </a>
        </div>
      </div>
    );
  }

  // 当深色模式切换时立即应用
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    
    if (checked) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'loveDarkTheme');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'loveTheme');
    }
    
    // 使用本地事件触发更新
    const themeChangeEvent = new CustomEvent('themeChange', { 
      detail: { darkMode: checked } 
    });
    window.dispatchEvent(themeChangeEvent);
  };
  
  // 当语言变更时立即应用
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
    
    // 使用本地事件触发更新
    const langChangeEvent = new CustomEvent('languageChange', { 
      detail: { language: newLanguage } 
    });
    window.dispatchEvent(langChangeEvent);
  };

  // 保存设置
  const saveSettings = () => {
    try {
      const settings = {
        darkMode,
        emailNotifications,
        privacySettings,
        language,
      };
      
      localStorage.setItem(`settings_${currentUser.id}`, JSON.stringify(settings));
      
      setSuccessMessage('设置已保存');
      setErrorMessage('');
      
      // 3秒后清除成功消息
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('保存设置时出错:', error);
      setErrorMessage('保存设置时出错');
      setSuccessMessage('');
    }
  };

  // 重置设置为默认值
  const resetSettings = () => {
    setDarkMode(false);
    setEmailNotifications(true);
    setPrivacySettings({
      showProfile: true,
      allowFriendRequests: true,
      showActivityStatus: true,
    });
    setLanguage('zh-CN');
    
    // 立即应用重置后的设置
    document.documentElement.classList.remove('dark');
    document.documentElement.lang = 'zh-CN';
  };

  // 更新隐私设置
  const updatePrivacySetting = (key: keyof typeof privacySettings, value: boolean) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border-2 border-love-300 dark:border-love-600">
        <h1 className="text-2xl font-bold text-love-500 dark:text-love-300 mb-6 text-center">设置</h1>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 dark:bg-green-900 dark:border-green-600 dark:text-green-300">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900 dark:border-red-600 dark:text-red-300">
            {errorMessage}
          </div>
        )}
        
        <div className="space-y-8">
          {/* 外观设置 */}
          <div>
            <h2 className="text-xl font-semibold text-love-500 dark:text-love-300 mb-4">外观</h2>
            <div className="card bg-base-100 shadow-sm dark:bg-gray-700">
              <div className="card-body">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <span className="label-text dark:text-gray-300">深色模式</span> 
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={darkMode}
                      onChange={(e) => handleDarkModeToggle(e.target.checked)}
                    />
                  </label>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text dark:text-gray-300">语言</span>
                  </label>
                  <select 
                    className="select select-bordered w-full max-w-xs dark:bg-gray-600 dark:text-white"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English (US)</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* 通知设置 */}
          <div>
            <h2 className="text-xl font-semibold text-love-500 dark:text-love-300 mb-4">通知</h2>
            <div className="card bg-base-100 shadow-sm dark:bg-gray-700">
              <div className="card-body">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <span className="label-text dark:text-gray-300">电子邮件通知</span> 
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">接收有关重要更新、纪念日和请求的电子邮件</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 隐私设置 */}
          <div>
            <h2 className="text-xl font-semibold text-love-500 dark:text-love-300 mb-4">隐私</h2>
            <div className="card bg-base-100 shadow-sm dark:bg-gray-700">
              <div className="card-body">
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <span className="label-text dark:text-gray-300">公开个人资料</span> 
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={privacySettings.showProfile}
                      onChange={(e) => updatePrivacySetting('showProfile', e.target.checked)}
                    />
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">允许其他用户查看您的个人资料</p>
                </div>
                
                <div className="form-control mt-2">
                  <label className="label cursor-pointer justify-start gap-4">
                    <span className="label-text dark:text-gray-300">接收伴侣请求</span> 
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={privacySettings.allowFriendRequests}
                      onChange={(e) => updatePrivacySetting('allowFriendRequests', e.target.checked)}
                    />
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">允许其他用户向您发送伴侣请求</p>
                </div>
                
                <div className="form-control mt-2">
                  <label className="label cursor-pointer justify-start gap-4">
                    <span className="label-text dark:text-gray-300">显示活动状态</span> 
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={privacySettings.showActivityStatus}
                      onChange={(e) => updatePrivacySetting('showActivityStatus', e.target.checked)}
                    />
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">向伴侣显示您的在线状态</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 帐户设置 */}
          <div>
            <h2 className="text-xl font-semibold text-love-500 dark:text-love-300 mb-4">帐户</h2>
            <div className="card bg-base-100 shadow-sm dark:bg-gray-700">
              <div className="card-body">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">帐户管理选项</p>
                <button className="btn btn-outline btn-error dark:border-red-400 dark:text-red-400">
                  注销帐户
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">此操作不可逆，将删除所有您的个人数据</p>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex justify-between pt-4">
            <button 
              className="btn btn-outline dark:border-gray-400 dark:text-gray-300"
              onClick={resetSettings}
            >
              重置为默认值
            </button>
            
            <button 
              className="btn btn-primary bg-love-500 hover:bg-love-600 border-none"
              onClick={saveSettings}
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 