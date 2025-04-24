'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { Todo } from '../../types';
import Link from 'next/link';

/**
 * 待审核任务列表页面
 */
export default function TaskReviewPage() {
  const { isAuthenticated, currentUser, partner, relationship } = useAuth();
  const router = useRouter();
  const [pendingTasks, setPendingTasks] = useState<Todo[]>([]);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [reviewPoints, setReviewPoints] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('正在加载待审核任务...');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // 加载等待审核的任务
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!currentUser || !partner || !relationship) {
      console.error('用户、伴侣或关系数据缺失，无法加载审核任务');
      setLoadingMessage('需要先登录并建立伴侣关系');
      return;
    }

    console.log('加载审核任务...');
    console.log('当前用户ID:', currentUser.id);
    console.log('伴侣ID:', partner.id);
    console.log('关系ID:', relationship.id);

    const todosData = localStorage.getItem('loveTodos');
    if (!todosData) {
      console.log('本地存储中没有任务数据');
      setLoadingMessage('没有找到任何待办任务');
      return;
    }

    try {
      const parsedTodos = JSON.parse(todosData, (key, value) => {
        if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
          return value ? new Date(value) : null;
        }
        return value;
      });
      console.log('从本地存储加载的任务总数:', parsedTodos.length);

      // 筛选出需要当前用户审核的任务
      // 1. 状态为pending的任务
      // 2. 由伴侣创建的任务（当前用户需要审核）
      // 3. 属于当前关系的任务
      const tasksToReview = parsedTodos.filter((todo: Todo) => {
        const isPending = todo.reviewStatus === 'pending';
        const isCreatedByPartner = todo.createdById === partner.id;
        const belongsToCurrentRelationship = todo.relationshipId === relationship?.id;
        const shouldReview = isPending && isCreatedByPartner && belongsToCurrentRelationship;
        
        console.log(`任务 "${todo.title}" 筛选结果:`);
        console.log(`- 待审核状态: ${isPending}`);
        console.log(`- 由伴侣创建: ${isCreatedByPartner} (任务创建者ID: ${todo.createdById}, 伴侣ID: ${partner.id})`);
        console.log(`- 属于当前关系: ${belongsToCurrentRelationship} (任务关系ID: ${todo.relationshipId}, 当前关系ID: ${relationship?.id})`);
        console.log(`- 最终结果: ${shouldReview}`);
        
        return shouldReview;
      });
      
      console.log('筛选后的待审核任务数量:', tasksToReview.length);
      if (tasksToReview.length === 0) {
        console.log('没有找到待审核的任务');
        setLoadingMessage('目前没有待审核的任务');
      } else {
        console.log('待审核任务列表:', JSON.stringify(tasksToReview, null, 2));
        setLoadingMessage('');
      }

      setPendingTasks(tasksToReview);
    } catch (error) {
      console.error('解析任务数据时出错:', error);
      setLoadingMessage('加载任务时出错，请刷新页面重试');
    }
  }, [currentUser, partner, relationship, refreshKey]);

  // 处理批准任务
  const handleApproveTask = (task: Todo) => {
    if (!currentUser || !relationship) return;

    console.log('准备批准任务:', task.id, task.title);

    // 更新任务状态
    const storedTodos = localStorage.getItem('loveTodos');
    if (storedTodos) {
      try {
        const allTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });

        // 更新任务状态
        const updatedTodos = allTodos.map((todo: Todo) => {
          if (todo.id === task.id) {
            console.log('找到要批准的任务');
            return {
              ...todo,
              reviewStatus: 'approved',
              points: reviewPoints || task.points,
              reviewerId: currentUser.id,
              reviewedAt: new Date(),
              reviewComment: reviewComment
            };
          }
          return todo;
        });
        
        // 保存回本地存储
        localStorage.setItem('loveTodos', JSON.stringify(updatedTodos));
        console.log('更新任务状态完成');
        
        // 为任务创建者添加积分
        const awardPoints = reviewPoints || task.points;
        console.log('准备为创建者添加积分:', awardPoints);
        addPoints(task.createdById, awardPoints, `完成任务 "${task.title}"`);
        
        // 从待审核列表中移除该任务
        setPendingTasks(pendingTasks.filter(t => t.id !== task.id));
        setSelectedTask(null);
        setReviewPoints(0);
        setReviewComment('');
        setSuccessMessage(`已批准任务"${task.title}"，并奖励了 ${awardPoints} 积分`);
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (e) {
        console.error('更新任务状态时出错:', e);
      }
    }
  };

  // 处理拒绝任务
  const handleRejectTask = (task: Todo) => {
    if (!currentUser) return;

    console.log('准备拒绝任务:', task.id, task.title);

    // 更新任务状态
    const storedTodos = localStorage.getItem('loveTodos');
    if (storedTodos) {
      try {
        const allTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate' || key === 'reviewedAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });

        // 更新任务状态
        const updatedTodos = allTodos.map((todo: Todo) => {
          if (todo.id === task.id) {
            console.log('找到要拒绝的任务');
            return {
              ...todo,
              reviewStatus: 'rejected',
              reviewerId: currentUser.id,
              reviewedAt: new Date(),
              reviewComment: reviewComment
            };
          }
          return todo;
        });
        
        // 保存回本地存储
        localStorage.setItem('loveTodos', JSON.stringify(updatedTodos));
        console.log('更新任务状态完成');
        
        // 从待审核列表中移除该任务
        setPendingTasks(pendingTasks.filter(t => t.id !== task.id));
        setSelectedTask(null);
        setReviewComment('');
        setSuccessMessage(`已拒绝任务"${task.title}"`);
        
        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (e) {
        console.error('更新任务状态时出错:', e);
      }
    }
  };

  // 添加积分
  const addPoints = (userId: string, points: number, reason: string) => {
    if (!relationship) return;
    
    console.log('开始添加积分:', points, '给用户:', userId);
    
    // 从本地存储中获取积分历史
    const storedPointHistory = localStorage.getItem('pointHistory');
    let pointHistory = [];
    let newTotalPoints = points;
    
    if (storedPointHistory) {
      try {
        pointHistory = JSON.parse(storedPointHistory, (key, value) => {
          if (key === 'createdAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        // 筛选该用户的积分历史
        const userPointHistory = pointHistory.filter((ph: any) => ph.userId === userId);
        
        if (userPointHistory.length > 0) {
          // 取最新的积分记录
          const latestRecord = userPointHistory.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          
          newTotalPoints = latestRecord.totalPoints + points;
          console.log('用户当前总积分:', latestRecord.totalPoints, '添加后总积分:', newTotalPoints);
        } else {
          console.log('用户没有积分记录，从', points, '开始');
        }
      } catch (e) {
        console.error('解析积分历史时出错:', e);
      }
    } else {
      console.log('本地存储中没有积分历史数据');
    }
    
    // 创建新的积分记录
    const newPointRecord = {
      id: Date.now().toString(),
      userId,
      relationshipId: relationship.id,
      pointsChange: points,
      totalPoints: newTotalPoints,
      reason,
      createdAt: new Date()
    };
    
    console.log('创建新积分记录:', newPointRecord);
    
    // 更新积分历史
    const updatedPointHistory = [...pointHistory, newPointRecord];
    localStorage.setItem('pointHistory', JSON.stringify(updatedPointHistory));
    console.log('积分历史已更新');
  };

  // 格式化日期显示
  const formatDate = (date?: Date) => {
    if (!date) return '无日期';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  // 添加手动刷新功能
  const refreshData = () => {
    console.log('手动刷新数据...');
    // 重新触发useEffect
    setPendingTasks([]);
    // 创建一个临时对象强制组件重新渲染
    setRefreshKey(prev => prev + 1);
  };

  if (!isAuthenticated || !currentUser || !partner) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-love-500 mb-4">请先登录</h1>
          <p className="text-gray-600 mb-6">您需要登录并有伴侣关系才能查看审核任务</p>
          <Link href="/auth/login" className="btn btn-primary bg-love-500 hover:bg-love-600 text-white border-none">
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-love-100 to-white dark:from-gray-800 dark:to-gray-900 py-8 min-h-full">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-love-600 dark:text-love-400 mb-2">待审核任务</h1>
          <p className="text-love-500 dark:text-love-300">审核您伴侣完成的爱的任务</p>
        </header>

        {successMessage && (
          <div className="alert alert-success mb-6">
            <p>{successMessage}</p>
          </div>
        )}

        {selectedTask ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-love-500 dark:text-love-300 mb-4">审核任务</h2>
            
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
              {selectedTask.description && (
                <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedTask.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-gray-500 dark:text-gray-400">创建日期:</span>
                <span className="ml-2">{formatDate(selectedTask.createdAt)}</span>
              </div>
              {selectedTask.dueDate && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">截止日期:</span>
                  <span className="ml-2">{formatDate(selectedTask.dueDate)}</span>
                </div>
              )}
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">奖励积分 (原始积分: {selectedTask.points})</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={reviewPoints || selectedTask.points}
                onChange={(e) => setReviewPoints(Number(e.target.value))}
                className="input input-bordered w-full"
              />
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">审核评论</span>
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="textarea textarea-bordered w-full"
                placeholder="添加评论..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedTask(null);
                  setReviewPoints(0);
                  setReviewComment('');
                }}
              >
                返回
              </button>
              <button 
                className="btn btn-error"
                onClick={() => handleRejectTask(selectedTask)}
                disabled={!reviewComment.trim()}
              >
                拒绝
              </button>
              <button 
                className="btn btn-success"
                onClick={() => handleApproveTask(selectedTask)}
              >
                批准
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            {loadingMessage ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{loadingMessage}</p>
                <div className="text-5xl mt-8">⏳</div>
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">暂无待审核任务</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">当您的伴侣完成任务并提交审核后，会显示在这里</p>
                <p className="text-gray-500 dark:text-gray-400 mt-4">
                  <span className="font-semibold">提示：</span>请确保您的伴侣已经：
                </p>
                <ul className="text-gray-500 dark:text-gray-400 list-disc list-inside mt-2">
                  <li>完成了任务（勾选复选框）</li>
                  <li>点击了"提交审核"按钮</li>
                  <li>任务状态显示为"等待审核"</li>
                </ul>
                <div className="text-5xl mt-8">✅</div>
                
                {/* 调试信息 */}
                <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded text-left">
                  <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-300">数据同步问题？</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    如果您的伴侣已提交任务但您在这里看不到，可能是由于本地存储同步问题。
                    浏览器的本地存储在不同设备或浏览器之间不会自动同步。
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    请点击上方的"刷新数据"按钮，或者请伴侣重新提交任务。
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-love-500 dark:text-love-300">待审核任务 ({pendingTasks.length})</h2>
                  <button 
                    className="btn btn-sm btn-outline" 
                    onClick={refreshData}
                  >
                    刷新数据
                  </button>
                </div>
                
                {pendingTasks.map(task => (
                  <div key={task.id} className="card bg-base-100 dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        {task.description && (
                          <p className="text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          创建日期: {formatDate(task.createdAt)}
                          {task.dueDate && ` | 截止日期: ${formatDate(task.dueDate)}`}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="badge badge-primary mb-2">积分: {task.points}</span>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            setSelectedTask(task);
                            setReviewPoints(task.points);
                          }}
                        >
                          审核
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="text-center">
          <Link href="/dashboard" className="btn btn-outline">
            返回待办清单
          </Link>
        </div>
      </div>
    </div>
  );
} 