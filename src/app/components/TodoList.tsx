'use client';

import { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import { Todo, PointHistory } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

/**
 * 待办事项列表组件
 */
export default function TodoList() {
  const { currentUser, partner, relationship } = useAuth();

  // 待办事项列表状态
  const [todos, setTodos] = useState<Todo[]>([]);
  // 新待办事项标题状态
  const [title, setTitle] = useState('');
  // 新待办事项描述状态
  const [description, setDescription] = useState('');
  // 新待办事项优先级状态
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  // 新待办事项伴侣标签状态
  const [partnerTag, setPartnerTag] = useState<'self' | 'partner' | 'both'>('both');
  // 新待办事项爱的类型状态
  const [loveType, setLoveType] = useState<'gift' | 'date' | 'care' | 'message' | 'other'>('care');
  // 新待办事项截止日期状态
  const [dueDate, setDueDate] = useState('');
  // 新待办事项积分状态
  const [points, setPoints] = useState(10);
  // 筛选状态
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  // 标签筛选状态
  const [tagFilter, setTagFilter] = useState<'all' | 'self' | 'partner' | 'both'>('all');
  // 爱的类型筛选状态
  const [typeFilter, setTypeFilter] = useState<'all' | 'gift' | 'date' | 'care' | 'message' | 'other'>('all');
  // 审核状态筛选
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'not_submitted'>('all');
  // 积分总数
  const [totalPoints, setTotalPoints] = useState(0);
  // 积分历史
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);

  // 从本地存储加载待办事项
  useEffect(() => {
    const storedTodos = localStorage.getItem('loveTodos');
    if (storedTodos) {
      try {
        // 需要转换日期字符串为Date对象
        const parsedTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setTodos(parsedTodos);
      } catch (e) {
        console.error('解析本地存储中的待办事项时出错:', e);
      }
    }

    // 加载积分历史
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
      } catch (e) {
        console.error('解析积分历史时出错:', e);
      }
    }
  }, []);

  // 计算总积分
  useEffect(() => {
    if (!currentUser) return;
    
    // 筛选当前用户的积分历史
    const userPointHistory = pointHistory.filter(ph => ph.userId === currentUser.id);
    
    // 计算总积分
    if (userPointHistory.length > 0) {
      const latestRecord = userPointHistory.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setTotalPoints(latestRecord.totalPoints);
    } else {
      setTotalPoints(0);
    }
  }, [currentUser, pointHistory]);

  // 保存待办事项到本地存储
  useEffect(() => {
    localStorage.setItem('loveTodos', JSON.stringify(todos));
  }, [todos]);

  // 保存积分历史到本地存储
  useEffect(() => {
    localStorage.setItem('pointHistory', JSON.stringify(pointHistory));
  }, [pointHistory]);

  // 添加待办事项
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('请输入待办事项内容');
      return;
    }
    
    if (!currentUser || !relationship) {
      alert('您需要先登录并建立伴侣关系才能添加待办事项');
      return;
    }
    
    // 确定截止日期（如果有）
    let parsedDueDate: Date | undefined = undefined;
    if (dueDate) {
      parsedDueDate = new Date(dueDate);
    }
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
      priority,
      partnerTag,
      loveType,
      createdAt: new Date(),
      dueDate: parsedDueDate,
      createdById: currentUser.id,
      relationshipId: relationship.id,
      isShared: true,
      points,
      reviewStatus: 'not_submitted'
    };
    
    // 从localStorage获取最新的待办事项
    const storedTodos = localStorage.getItem('loveTodos');
    let currentTodos = [];
    
    if (storedTodos) {
      try {
        // 使用自定义JSON解析器处理日期
        currentTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
      } catch (e) {
        console.error("解析待办事项出错:", e);
        currentTodos = [...todos]; // 使用当前状态作为备份
      }
    } else {
      currentTodos = [...todos];
    }
    
    // 添加新待办事项
    const updatedTodos = [...currentTodos, newTodo];
    
    // 保存回localStorage
    localStorage.setItem('loveTodos', JSON.stringify(updatedTodos));
    
    // 更新组件状态
    setTodos(updatedTodos);
    
    // 重置表单
    setTitle('');
    setDescription('');
    setPriority('medium');
    setPartnerTag('both');
    setLoveType('care');
    setDueDate('');
    setPoints(10);
    
    console.log("新的待办事项已添加:", newTodo.title);
  };
  
  // 删除待办事项
  const deleteTodo = (id: string) => {
    // 从localStorage获取最新的待办事项
    const storedTodos = localStorage.getItem('loveTodos');
    let currentTodos = [];
    
    if (storedTodos) {
      try {
        currentTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
      } catch (e) {
        console.error("解析待办事项出错:", e);
        currentTodos = [...todos]; // 使用当前状态作为备份
      }
    } else {
      currentTodos = [...todos];
    }
    
    // 过滤掉要删除的待办事项
    const updatedTodos = currentTodos.filter((todo: Todo) => todo.id !== id);
    
    // 保存回localStorage
    localStorage.setItem('loveTodos', JSON.stringify(updatedTodos));
    
    // 更新组件状态
    setTodos(updatedTodos);
    
    console.log("待办事项已删除");
  };
  
  // 更新待办事项完成状态
  const toggleTodo = (id: string) => {
    // 从localStorage获取最新的待办事项
    const storedTodos = localStorage.getItem('loveTodos');
    let currentTodos = [];
    
    if (storedTodos) {
      try {
        currentTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
      } catch (e) {
        console.error("解析待办事项出错:", e);
        currentTodos = [...todos]; // 使用当前状态作为备份
      }
    } else {
      currentTodos = [...todos];
    }
    
    // 更新待办事项状态
    const updatedTodos = currentTodos.map((todo: Todo) => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    
    // 保存回localStorage
    localStorage.setItem('loveTodos', JSON.stringify(updatedTodos));
    
    // 更新组件状态
    setTodos(updatedTodos);
  };
  
  // 编辑待办事项
  const editTodo = (editedTodo: Todo) => {
    // 从localStorage获取最新的待办事项
    const storedTodos = localStorage.getItem('loveTodos');
    let currentTodos = [];
    
    if (storedTodos) {
      try {
        currentTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
      } catch (e) {
        console.error("解析待办事项出错:", e);
        currentTodos = [...todos]; // 使用当前状态作为备份
      }
    } else {
      currentTodos = [...todos];
    }
    
    // 更新待办事项
    const updatedTodos = currentTodos.map((todo: Todo) => {
      if (todo.id === editedTodo.id) {
        return editedTodo;
      }
      return todo;
    });
    
    // 保存回localStorage
    localStorage.setItem('loveTodos', JSON.stringify(updatedTodos));
    
    // 更新组件状态
    setTodos(updatedTodos);
  };

  // 提交待办事项审核
  const submitForReview = (todoId: string) => {
    console.log("提交待办事项审核:", todoId);
    if (!currentUser || !partner || !relationship) {
      console.error("无法提交审核: 缺少用户、伴侣或关系数据");
      alert("您需要先登录并有伴侣关系才能提交审核");
      return;
    }
    
    // 查找要提交的任务
    const taskToSubmit = todos.find(todo => todo.id === todoId);
    if (!taskToSubmit) {
      console.error("未找到要提交的任务:", todoId);
      alert("未找到待审核任务");
      return;
    }
    
    console.log("找到任务:", taskToSubmit.title);
    console.log("当前用户:", currentUser.id, "| 伴侣:", partner.id);
    
    // 更新任务状态为待审核
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        const updatedTask = { 
          ...todo, 
          reviewStatus: 'pending' as const,
          // 确保relationshipId正确设置
          relationshipId: relationship.id
        };
        console.log("更新后的任务:", updatedTask);
        return updatedTask;
      }
      return todo;
    });
    
    // 首先确保从localStorage获取最新的任务列表
    const storedTodos = localStorage.getItem('loveTodos');
    if (storedTodos) {
      try {
        // 从本地存储中获取所有任务
        const allTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        // 合并当前状态和localStorage中的任务
        // 将要更新的任务加入到allTodos中
        const mergedTodos = allTodos.map((todo: Todo) => {
          const updatedTodo = updatedTodos.find(t => t.id === todo.id);
          return updatedTodo || todo;
        });
        
        // 检查是否存在要更新的任务不在allTodos中的情况
        const newTodos = updatedTodos.filter(todo => 
          !allTodos.some((t: Todo) => t.id === todo.id)
        );
        
        // 合并结果
        const finalTodos = [...mergedTodos, ...newTodos];
        
        // 保存回localStorage
        localStorage.setItem('loveTodos', JSON.stringify(finalTodos));
        console.log("任务已提交审核，等待伴侣审核");
        
        // 更新组件状态
        setTodos(finalTodos);
        
        // 显示成功提示
        alert(`任务"${taskToSubmit.title}"已提交审核，等待伴侣审核`);
      } catch (e) {
        console.error("合并任务数据出错:", e);
        alert("提交审核时出错，请重试");
      }
    } else {
      // 如果localStorage中没有任务，直接保存
      localStorage.setItem('loveTodos', JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
      console.log("任务已提交审核，等待伴侣审核");
      
      // 显示成功提示
      alert(`任务"${taskToSubmit.title}"已提交审核，等待伴侣审核`);
    }
  };

  // 审核批准待办事项
  const approveTask = (todoId: string, points: number, comment?: string) => {
    if (!currentUser || !relationship) return;

    // 更新任务状态
    const updatedTodos = todos.map(todo => {
      if (todo.id === todoId) {
        return {
          ...todo,
          reviewStatus: 'approved' as const,
          points: points,
          reviewerId: currentUser.id,
          reviewedAt: new Date(),
          reviewComment: comment
        };
      }
      return todo;
    });
    
    setTodos(updatedTodos);
    
    // 找到被批准的任务
    const approvedTodo = updatedTodos.find(t => t.id === todoId);
    if (approvedTodo) {
      // 为任务创建者添加积分
      addPoints(approvedTodo.createdById, points, `完成任务 "${approvedTodo.title}"`, todoId);
    }
  };

  // 审核拒绝待办事项
  const rejectTask = (todoId: string, comment: string) => {
    if (!currentUser) return;
    
    setTodos(
      todos.map(todo => {
        if (todo.id === todoId) {
          return {
            ...todo,
            reviewStatus: 'rejected' as const,
            reviewerId: currentUser.id,
            reviewedAt: new Date(),
            reviewComment: comment
          };
        }
        return todo;
      })
    );
  };

  // 添加积分
  const addPoints = (userId: string, pointsToAdd: number, reason: string, todoId?: string) => {
    if (!relationship) return;
    
    // 计算新的总积分
    const userPointHistory = pointHistory.filter(ph => ph.userId === userId);
    let newTotalPoints = pointsToAdd;
    
    if (userPointHistory.length > 0) {
      // 取最新的积分记录
      const latestRecord = userPointHistory.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      newTotalPoints = latestRecord.totalPoints + pointsToAdd;
    }
    
    // 创建新的积分记录
    const newPointRecord: PointHistory = {
      id: Date.now().toString(),
      userId,
      relationshipId: relationship.id,
      pointsChange: pointsToAdd,
      totalPoints: newTotalPoints,
      reason,
      todoId,
      createdAt: new Date()
    };
    
    // 更新积分历史
    setPointHistory([...pointHistory, newPointRecord]);
    
    // 如果是当前用户，更新显示的总积分
    if (userId === currentUser?.id) {
      setTotalPoints(newTotalPoints);
    }
  };

  // 根据筛选条件过滤待办事项
  const filteredTodos = todos
    // 按关系ID筛选
    .filter(todo => {
      if (!relationship) return false;
      return todo.relationshipId === relationship.id;
    })
    // 按完成状态筛选
    .filter(todo => {
      if (filter === 'all') return true;
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    // 按伴侣标签筛选
    .filter(todo => {
      if (tagFilter === 'all') return true;
      return todo.partnerTag === tagFilter;
    })
    // 按爱的类型筛选
    .filter(todo => {
      if (typeFilter === 'all') return true;
      return todo.loveType === typeFilter;
    })
    // 按审核状态筛选
    .filter(todo => {
      if (reviewFilter === 'all') return true;
      return todo.reviewStatus === reviewFilter;
    });

  if (!currentUser || !relationship) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <p className="mb-4">您需要先登录并添加一个伴侣才能使用恋爱清单</p>
          <Link href="/auth/login" className="btn btn-primary">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border-2 border-love-300 dark:border-love-700">
        <h2 className="text-2xl font-bold text-love-500 dark:text-love-300 mb-4 text-center">💑 恋爱清单 💑</h2>
        
        {/* 积分信息 */}
        <div className="bg-love-50 dark:bg-gray-700 p-4 rounded-lg mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-love-600 dark:text-love-300">我的爱心积分</h3>
            <p className="text-2xl font-bold text-love-700 dark:text-love-400">{totalPoints} 分</p>
          </div>
          <Link 
            href="/gifts" 
            className="btn btn-primary btn-sm bg-love-500 hover:bg-love-600 border-none"
          >
            兑换礼物
          </Link>
        </div>
        
        {/* 添加新待办事项表单 */}
        <div className="card bg-love-100 dark:bg-gray-700 shadow p-4 mb-6">
          <div className="form-control">
            <input
              type="text"
              placeholder="添加新的爱的待办事项"
              className="input input-bordered border-love-300 dark:border-love-600 focus:border-love-500 mb-2 dark:bg-gray-600 dark:text-white"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              placeholder="描述（可选）"
              className="textarea textarea-bordered border-love-300 dark:border-love-600 focus:border-love-500 mb-2 dark:bg-gray-600 dark:text-white"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="label">
                  <span className="label-text text-love-700">优先级</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={priority}
                  onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text text-love-700">截止日期</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">
                  <span className="label-text text-love-700">关联对象</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={partnerTag}
                  onChange={e => setPartnerTag(e.target.value as 'self' | 'partner' | 'both')}
                >
                  <option value="self">我的</option>
                  <option value="partner">伴侣的</option>
                  <option value="both">共同的</option>
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text text-love-700">爱的类型</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={loveType}
                  onChange={e => setLoveType(e.target.value as 'gift' | 'date' | 'care' | 'message' | 'other')}
                >
                  <option value="gift">礼物</option>
                  <option value="date">约会</option>
                  <option value="care">关心</option>
                  <option value="message">消息</option>
                  <option value="other">其他</option>
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text text-love-700">完成积分 (1-100)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input input-bordered w-full"
                  value={points}
                  onChange={e => setPoints(Number(e.target.value))}
                />
              </div>
            </div>
            
            <button
              className="btn btn-primary bg-love-500 hover:bg-love-600 border-none dark:bg-love-600 dark:hover:bg-love-700"
              onClick={addTodo}
            >
              添加爱的待办
            </button>
          </div>
        </div>
        
        {/* 筛选控件 */}
        <div className="flex flex-wrap gap-2 justify-between mb-6">
          <div className="flex-1 min-w-[120px]">
            <select
              className="select select-bordered w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={filter}
              onChange={e => setFilter(e.target.value as 'all' | 'active' | 'completed')}
            >
              <option value="all">所有状态</option>
              <option value="active">待完成</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[120px]">
            <select
              className="select select-bordered w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value as 'all' | 'self' | 'partner' | 'both')}
            >
              <option value="all">所有对象</option>
              <option value="self">我的</option>
              <option value="partner">伴侣的</option>
              <option value="both">共同的</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[120px]">
            <select
              className="select select-bordered w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as 'all' | 'gift' | 'date' | 'care' | 'message' | 'other')}
            >
              <option value="all">所有类型</option>
              <option value="gift">礼物</option>
              <option value="date">约会</option>
              <option value="care">关心</option>
              <option value="message">消息</option>
              <option value="other">其他</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[120px]">
            <select
              className="select select-bordered w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={reviewFilter}
              onChange={e => setReviewFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected' | 'not_submitted')}
            >
              <option value="all">所有审核状态</option>
              <option value="pending">等待审核</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
              <option value="not_submitted">未提交</option>
            </select>
          </div>
        </div>
        
        {/* 待办事项列表 */}
        <div>
          {filteredTodos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">暂无待办事项，快去添加吧！</p>
              <div className="text-5xl mt-4">💕</div>
            </div>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onDelete={deleteTodo}
                onToggle={toggleTodo}
                onEdit={editTodo}
                onSubmitReview={submitForReview}
                onApproveTask={approveTask}
                onRejectTask={rejectTask}
              />
            ))
          )}
        </div>
        
        {/* 底部统计信息 */}
        {todos.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
            共 {todos.length} 项，已完成 {todos.filter(t => t.completed).length} 项
          </div>
        )}
      </div>
    </div>
  );
}