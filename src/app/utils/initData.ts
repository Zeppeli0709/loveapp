'use client';

export function initLocalStorage() {
  // 检查是否已经初始化
  if (localStorage.getItem('appInitialized')) {
    return;
  }
  
  // 初始化用户数据
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
  
  // 初始化密码
  if (!localStorage.getItem('userPasswords')) {
    localStorage.setItem('userPasswords', JSON.stringify({}));
  }
  
  // 初始化关系请求
  if (!localStorage.getItem('relationshipRequests')) {
    localStorage.setItem('relationshipRequests', JSON.stringify([]));
  }
  
  // 初始化关系
  if (!localStorage.getItem('relationships')) {
    localStorage.setItem('relationships', JSON.stringify([]));
  }
  
  // 初始化待办事项
  if (!localStorage.getItem('loveTodos')) {
    localStorage.setItem('loveTodos', JSON.stringify([]));
  }
  
  // 初始化纪念日
  if (!localStorage.getItem('anniversaries')) {
    localStorage.setItem('anniversaries', JSON.stringify([]));
  }
  
  // 标记已初始化
  localStorage.setItem('appInitialized', 'true');
} 