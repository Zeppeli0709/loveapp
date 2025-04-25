'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { PointHistory } from '../types';
import { useAuth } from './AuthContext';

/**
 * 积分上下文的接口定义
 */
interface PointsContextType {
  /** 当前用户总积分 */
  totalPoints: number;
  /** 积分历史记录 */
  pointHistory: PointHistory[];
  /** 添加积分（通过完成任务等正常途径） */
  addPoints: (userId: string, points: number, reason: string, todoId?: string) => void;
  /** 减少积分 */
  deductPoints: (userId: string, points: number, reason: string) => void;
  /** 重新加载积分数据 */
  reloadPoints: () => void;
}

// 创建积分上下文
const PointsContext = createContext<PointsContextType | undefined>(undefined);

/**
 * 积分上下文提供者组件
 */
export function PointsProvider({ children }: { children: ReactNode }) {
  const { currentUser, relationship } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);

  // 初始加载积分历史
  useEffect(() => {
    loadPointHistory();
  }, []);

  // 当用户变更时重新计算积分
  useEffect(() => {
    if (currentUser && pointHistory.length > 0) {
      updateUserTotalPoints(pointHistory, currentUser.id);
    }
  }, [currentUser, pointHistory]);

  // 加载积分历史
  const loadPointHistory = () => {
    const storedPointHistory = localStorage.getItem('pointHistory');
    if (storedPointHistory) {
      try {
        const parsedHistory = JSON.parse(storedPointHistory, (key, value) => {
          if (key === 'createdAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setPointHistory(parsedHistory);
        
        // 如果当前用户已登录，计算其总积分
        if (currentUser) {
          updateUserTotalPoints(parsedHistory, currentUser.id);
        }
      } catch (e) {
        console.error('解析积分历史时出错:', e);
        setPointHistory([]);
      }
    } else {
      setPointHistory([]);
    }
  };

  // 计算用户总积分
  const updateUserTotalPoints = (historyRecords: PointHistory[], userId: string) => {
    const userPointHistory = historyRecords.filter(ph => ph.userId === userId);
    if (userPointHistory.length > 0) {
      // 按时间排序，获取最新的积分记录
      const latestRecord = userPointHistory.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      setTotalPoints(latestRecord.totalPoints);
    } else {
      setTotalPoints(0);
    }
  };

  // 添加积分（通过任务完成等正常途径）
  const addPoints = (userId: string, points: number, reason: string, todoId?: string) => {
    if (!relationship || !points || points <= 0) return;
    
    // 计算新的总积分
    const userPointHistory = pointHistory.filter(ph => ph.userId === userId);
    let newTotalPoints = points;
    
    if (userPointHistory.length > 0) {
      // 取最新的积分记录
      const latestRecord = userPointHistory.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      newTotalPoints = latestRecord.totalPoints + points;
    }
    
    // 创建新的积分记录
    const newPointRecord: PointHistory = {
      id: Date.now().toString(),
      userId,
      relationshipId: relationship.id,
      pointsChange: points,
      totalPoints: newTotalPoints,
      reason,
      todoId,
      createdAt: new Date()
    };
    
    // 更新积分历史
    const updatedPointHistory = [...pointHistory, newPointRecord];
    setPointHistory(updatedPointHistory);
    
    // 保存到本地存储
    localStorage.setItem('pointHistory', JSON.stringify(updatedPointHistory));
    
    // 如果是当前用户，更新显示的总积分
    if (userId === currentUser?.id) {
      setTotalPoints(newTotalPoints);
    }
  };

  // 减少积分
  const deductPoints = (userId: string, points: number, reason: string) => {
    if (!relationship || !points || points <= 0) return;
    
    // 计算新的总积分
    const userPointHistory = pointHistory.filter(ph => ph.userId === userId);
    let newTotalPoints = 0;
    
    if (userPointHistory.length > 0) {
      // 取最新的积分记录
      const latestRecord = userPointHistory.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      // 计算新总积分，确保不会低于0
      newTotalPoints = Math.max(0, latestRecord.totalPoints - points);
    }
    
    // 创建新的积分记录
    const newPointRecord: PointHistory = {
      id: Date.now().toString(),
      userId,
      relationshipId: relationship.id,
      pointsChange: -points,
      totalPoints: newTotalPoints,
      reason,
      createdAt: new Date()
    };
    
    // 更新积分历史
    const updatedPointHistory = [...pointHistory, newPointRecord];
    setPointHistory(updatedPointHistory);
    
    // 保存到本地存储
    localStorage.setItem('pointHistory', JSON.stringify(updatedPointHistory));
    
    // 如果是当前用户，更新显示的总积分
    if (userId === currentUser?.id) {
      setTotalPoints(newTotalPoints);
    }
  };

  // 重新加载积分数据
  const reloadPoints = () => {
    loadPointHistory();
  };

  return (
    <PointsContext.Provider 
      value={{ 
        totalPoints, 
        pointHistory, 
        addPoints, 
        deductPoints, 
        reloadPoints
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

/**
 * 使用积分上下文的自定义钩子
 */
export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}