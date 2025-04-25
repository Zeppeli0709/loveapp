'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';

// 用户接口
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// 关系接口
interface Relationship {
  id: string;
  user1Id: string;
  user2Id: string;
  startDate: Date;
  status: 'active' | 'pending' | 'inactive';
}

// 认证上下文接口
interface AuthContextType {
  currentUser: User | null;
  partner: User | null;
  relationship: Relationship | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件Props
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供者组件
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 登录方法 - 使用useCallback避免依赖循环
  const login = useCallback(async (email: string, password: string) => {
    // 模拟登录API调用
    // 在实际应用中，这里会调用真实的登录API
    
    const mockUser: User = {
      id: '1',
      name: '测试用户',
      email
    };
    
    const mockPartner: User = {
      id: '2',
      name: '伴侣用户',
      email: 'partner@example.com'
    };
    
    const mockRelationship: Relationship = {
      id: '1',
      user1Id: '1',
      user2Id: '2',
      startDate: new Date(),
      status: 'active'
    };
    
    // 保存用户数据到本地存储
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('partner', JSON.stringify(mockPartner));
    localStorage.setItem('relationship', JSON.stringify(mockRelationship));
    
    // 保存登录凭据备份，用于自动恢复登录
    localStorage.setItem('backupLogin', JSON.stringify({ email, password }));
    
    // 永久保存标志
    localStorage.setItem('rememberLogin', 'true');
    
    // 更新状态
    setCurrentUser(mockUser);
    setPartner(mockPartner);
    setRelationship(mockRelationship);
    setIsAuthenticated(true);
    
    // 记录登录成功
    console.log('登录成功，账户信息已永久保存');
  }, []);

  // 手动尝试登录的函数，从备份凭据恢复
  const attemptAutoLogin = useCallback(() => {
    const backupLogin = localStorage.getItem('backupLogin');
    if (backupLogin) {
      try {
        const { email, password } = JSON.parse(backupLogin);
        console.log('尝试使用备份凭据自动登录');
        login(email, password);
      } catch (error) {
        console.error('无法使用备份凭据恢复登录', error);
      }
    }
  }, [login]);

  // 加载用户数据
  useEffect(() => {
    // 始终尝试从本地存储加载用户数据
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
        
        // 加载伴侣数据
        const storedPartner = localStorage.getItem('partner');
        if (storedPartner) {
          setPartner(JSON.parse(storedPartner));
        }
        
        // 加载关系数据
        const storedRelationship = localStorage.getItem('relationship');
        if (storedRelationship) {
          const parsedRelationship = JSON.parse(storedRelationship, (key, value) => {
            if (key === 'startDate') {
              return value ? new Date(value) : null;
            }
            return value;
          });
          setRelationship(parsedRelationship);
        }
      } catch (e) {
        console.error('解析存储的用户数据时出错:', e);
        // 不要删除数据，只记录错误
        console.log('将尝试使用备份数据恢复登录状态');
        attemptAutoLogin();
      }
    } else {
      // 尝试自动登录
      attemptAutoLogin();
    }
  }, [attemptAutoLogin]);

  // 注册方法
  const register = useCallback(async (name: string, email: string, password: string) => {
    // 模拟注册API调用
    // 在实际应用中，这里会调用真实的注册API
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email
    };
    
    // 保存用户数据到本地存储
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // 保存登录凭据备份，用于自动恢复登录
    localStorage.setItem('backupLogin', JSON.stringify({ email, password }));
    
    // 永久保存标志
    localStorage.setItem('rememberLogin', 'true');
    
    // 更新状态
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    
    console.log('注册成功，账户信息已永久保存');
  }, []);

  // 登出方法
  const logout = useCallback(() => {
    // 只清除当前会话数据，不清除备份凭据
    localStorage.removeItem('currentUser');
    localStorage.removeItem('partner');
    localStorage.removeItem('relationship');
    
    // 保留备份凭据和记住登录设置
    // localStorage.removeItem('backupLogin');
    // localStorage.removeItem('rememberLogin');
    
    // 重置状态
    setCurrentUser(null);
    setPartner(null);
    setRelationship(null);
    setIsAuthenticated(false);
  }, []);

  // 提供认证上下文
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        partner,
        relationship,
        isAuthenticated,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook用于访问认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 