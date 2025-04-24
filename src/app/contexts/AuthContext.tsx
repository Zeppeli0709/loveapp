'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, RelationshipRequest, Relationship } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  partner: User | null;
  relationship: Relationship | null;
  pendingRequests: RelationshipRequest[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  sendRelationshipRequest: (receiverId: string, message?: string) => Promise<boolean>;
  acceptRelationshipRequest: (requestId: string) => Promise<boolean>;
  rejectRelationshipRequest: (requestId: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<User[]>;
  addPartner: (partner: User) => void;
  rebuildRelationship: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [pendingRequests, setPendingRequests] = useState<RelationshipRequest[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 从本地存储加载用户数据
  useEffect(() => {
    const rememberLogin = localStorage.getItem('rememberLogin');
    const storedUser = localStorage.getItem('currentUser');
    
    if (rememberLogin === 'true' && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
        
        // 加载关系数据
        loadRelationshipData(parsedUser.id);
      } catch (e) {
        console.error('解析用户数据时出错:', e);
        // 如果出错，清除可能损坏的数据
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberLogin');
      }
    }
  }, []);

  // 加载关系数据
  const loadRelationshipData = (userId: string) => {
    // 从本地存储加载关系请求
    const storedRequests = localStorage.getItem('relationshipRequests');
    if (storedRequests) {
      try {
        const parsedRequests: RelationshipRequest[] = JSON.parse(storedRequests);
        // 筛选当前用户收到的待处理请求
        const userPendingRequests = parsedRequests.filter(
          req => req.receiverId === userId && req.status === 'pending'
        );
        setPendingRequests(userPendingRequests);
      } catch (e) {
        console.error('解析关系请求数据时出错:', e);
      }
    }

    // 从本地存储加载关系
    const storedRelationships = localStorage.getItem('relationships');
    if (storedRelationships) {
      try {
        const parsedRelationships: Relationship[] = JSON.parse(storedRelationships);
        // 查找当前用户的关系
        const userRelationship = parsedRelationships.find(
          rel => rel.user1Id === userId || rel.user2Id === userId
        );
        
        if (userRelationship) {
          setRelationship(userRelationship);
          
          // 加载伴侣信息
          const partnerId = userRelationship.user1Id === userId 
            ? userRelationship.user2Id 
            : userRelationship.user1Id;
          
          const storedUsers = localStorage.getItem('users');
          if (storedUsers) {
            try {
              const parsedUsers: User[] = JSON.parse(storedUsers);
              const partnerUser = parsedUsers.find(user => user.id === partnerId);
              if (partnerUser) {
                setPartner(partnerUser);
              }
            } catch (e) {
              console.error('解析用户数据时出错:', e);
            }
          }
        }
      } catch (e) {
        console.error('解析关系数据时出错:', e);
      }
    }
  };

  // 登录方法
  const login = async (email: string, password: string): Promise<boolean> => {
    // 在实际应用中，这里应该调用API进行验证
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        const users: User[] = JSON.parse(storedUsers);
        const passwordsMap = JSON.parse(localStorage.getItem('userPasswords') || '{}');
        
        const user = users.find(u => u.email === email);
        if (user && passwordsMap[user.id] === password) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          // 使用localStorage永久保存用户登录状态
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // 添加记住登录状态的标记
          localStorage.setItem('rememberLogin', 'true');
          
          // 加载关系数据
          loadRelationshipData(user.id);
          return true;
        }
      } catch (e) {
        console.error('登录时出错:', e);
      }
    }
    return false;
  };

  // 注册方法
  const register = async (
    username: string, 
    email: string, 
    password: string, 
    displayName: string
  ): Promise<boolean> => {
    // 在实际应用中，这里应该调用API进行注册
    try {
      const storedUsers = localStorage.getItem('users');
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      
      // 检查用户名和邮箱是否已存在
      if (users.some(u => u.username === username || u.email === email)) {
        return false;
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email,
        displayName,
        createdAt: new Date(),
      };
      
      // 添加新用户
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // 存储密码（在实际应用中应使用加密）
      const passwordsMap = JSON.parse(localStorage.getItem('userPasswords') || '{}');
      passwordsMap[newUser.id] = password;
      localStorage.setItem('userPasswords', JSON.stringify(passwordsMap));
      
      // 自动登录
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('rememberLogin', 'true');
      
      return true;
    } catch (e) {
      console.error('注册时出错:', e);
      return false;
    }
  };

  // 登出方法
  const logout = () => {
    setCurrentUser(null);
    setPartner(null);
    setRelationship(null);
    setPendingRequests([]);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberLogin');
  };

  // 发送关系请求
  const sendRelationshipRequest = async (receiverId: string, message?: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const storedRequests = localStorage.getItem('relationshipRequests');
      const requests: RelationshipRequest[] = storedRequests ? JSON.parse(storedRequests) : [];
      
      // 检查是否已发送过请求
      const existingRequest = requests.find(
        req => req.senderId === currentUser.id && req.receiverId === receiverId
      );
      
      if (existingRequest) {
        // 如果请求已被拒绝，允许再次发送
        if (existingRequest.status === 'rejected') {
          existingRequest.status = 'pending';
          existingRequest.message = message;
          existingRequest.updatedAt = new Date();
        } else {
          return false;
        }
      } else {
        // 创建新请求
        const newRequest: RelationshipRequest = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          receiverId,
          message,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        requests.push(newRequest);
      }
      
      localStorage.setItem('relationshipRequests', JSON.stringify(requests));
      return true;
    } catch (e) {
      console.error('发送关系请求时出错:', e);
      return false;
    }
  };

  // 接受关系请求
  const acceptRelationshipRequest = async (requestId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const storedRequests = localStorage.getItem('relationshipRequests');
      if (!storedRequests) return false;
      
      const requests: RelationshipRequest[] = JSON.parse(storedRequests);
      const requestIndex = requests.findIndex(req => req.id === requestId);
      
      if (requestIndex === -1 || requests[requestIndex].receiverId !== currentUser.id) {
        return false;
      }
      
      // 更新请求状态
      requests[requestIndex].status = 'accepted';
      requests[requestIndex].updatedAt = new Date();
      localStorage.setItem('relationshipRequests', JSON.stringify(requests));
      
      // 创建关系
      const request = requests[requestIndex];
      const storedRelationships = localStorage.getItem('relationships');
      const relationships: Relationship[] = storedRelationships ? JSON.parse(storedRelationships) : [];
      
      const newRelationship: Relationship = {
        id: Date.now().toString(),
        user1Id: request.senderId,
        user2Id: request.receiverId,
        startDate: new Date(),
      };
      
      relationships.push(newRelationship);
      localStorage.setItem('relationships', JSON.stringify(relationships));
      
      // 更新状态
      setRelationship(newRelationship);
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      
      // 加载伴侣信息
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const users: User[] = JSON.parse(storedUsers);
        const partnerUser = users.find(user => user.id === request.senderId);
        if (partnerUser) {
          setPartner(partnerUser);
        }
      }
      
      return true;
    } catch (e) {
      console.error('接受关系请求时出错:', e);
      return false;
    }
  };

  // 拒绝关系请求
  const rejectRelationshipRequest = async (requestId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const storedRequests = localStorage.getItem('relationshipRequests');
      if (!storedRequests) return false;
      
      const requests: RelationshipRequest[] = JSON.parse(storedRequests);
      const requestIndex = requests.findIndex(req => req.id === requestId);
      
      if (requestIndex === -1 || requests[requestIndex].receiverId !== currentUser.id) {
        return false;
      }
      
      // 更新请求状态
      requests[requestIndex].status = 'rejected';
      requests[requestIndex].updatedAt = new Date();
      localStorage.setItem('relationshipRequests', JSON.stringify(requests));
      
      // 更新状态
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
      
      return true;
    } catch (e) {
      console.error('拒绝关系请求时出错:', e);
      return false;
    }
  };

  // 搜索用户
  const searchUsers = async (query: string): Promise<User[]> => {
    if (!query.trim() || !currentUser) return [];
    
    try {
      const storedUsers = localStorage.getItem('users');
      if (!storedUsers) return [];
      
      const users: User[] = JSON.parse(storedUsers);
      
      // 排除当前用户
      return users.filter(user => 
        user.id !== currentUser.id && 
        (user.username.includes(query) || 
         user.email.includes(query) || 
         user.displayName.includes(query))
      );
    } catch (e) {
      console.error('搜索用户时出错:', e);
      return [];
    }
  };

  /**
   * 强制重建用户关系
   */
  const rebuildRelationship = () => {
    console.log("尝试重建用户关系数据");
    
    // 检查是否有当前用户
    if (!currentUser) {
      console.error("无法重建关系：当前用户不存在");
      return false;
    }
    
    // 从localStorage获取所有用户
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) {
      console.error("无法重建关系：未找到用户数据");
      return false;
    }
    
    try {
      const parsedUsers = JSON.parse(storedUsers);
      console.log("找到用户数据:", parsedUsers.length, "个用户");
      
      // 查找伴侣
      let foundPartner = null;
      for (const user of parsedUsers) {
        // 跳过当前用户
        if (user.id === currentUser.id) continue;
        
        console.log("检查潜在伴侣:", user.username);
        foundPartner = user;
        break;
      }
      
      if (!foundPartner) {
        console.error("无法重建关系：未找到伴侣用户");
        return false;
      }
      
      // 创建或更新关系
      const storedRelationships = localStorage.getItem('relationships');
      let relationships = [];
      
      if (storedRelationships) {
        relationships = JSON.parse(storedRelationships);
        
        // 查找已存在的关系
        const existingRelationship = relationships.find(
          (r: any) => (r.user1Id === currentUser.id && r.user2Id === foundPartner.id) ||
                     (r.user1Id === foundPartner.id && r.user2Id === currentUser.id)
        );
        
        if (existingRelationship) {
          console.log("找到现有关系:", existingRelationship.id);
          setRelationship(existingRelationship);
          setPartner(foundPartner);
          return true;
        }
      }
      
      // 创建新关系
      const newRelationship = {
        id: Date.now().toString(),
        user1Id: currentUser.id,
        user2Id: foundPartner.id,
        status: 'active',
        createdAt: new Date(),
        startDate: new Date()
      };
      
      relationships.push(newRelationship);
      localStorage.setItem('relationships', JSON.stringify(relationships));
      
      console.log("创建了新的关系:", newRelationship.id);
      setRelationship(newRelationship);
      setPartner(foundPartner);
      return true;
    } catch (e) {
      console.error("重建关系时出错:", e);
      return false;
    }
  };

  const value = {
    currentUser,
    partner,
    relationship,
    pendingRequests,
    isAuthenticated,
    login,
    register,
    logout,
    sendRelationshipRequest,
    acceptRelationshipRequest,
    rejectRelationshipRequest,
    searchUsers,
    addPartner: setPartner,
    rebuildRelationship
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 