'use client';

import React, { useState } from 'react';
import { Todo } from '../types';
import { useAuth } from '../contexts/AuthContext';

/**
 * TodoItem组件属性接口
 */
interface TodoItemProps {
  /** 待办事项数据 */
  todo: Todo;
  /** 删除待办事项的回调函数 */
  onDelete: (id: string) => void;
  /** 更新待办事项的回调函数 */
  onToggle: (id: string) => void;
  /** 编辑待办事项的回调函数 */
  onEdit: (editedTodo: Todo) => void;
  /** 提交审核的回调函数 */
  onSubmitReview: (id: string) => void;
  /** 批准任务的回调函数 */
  onApproveTask: (todoId: string, points: number, comment?: string) => void;
  /** 拒绝任务的回调函数 */
  onRejectTask: (todoId: string, comment: string) => void;
}

// 格式化日期函数
const formatDate = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * TodoItem组件，用于显示单个待办事项
 * @param props TodoItemProps类型的属性
 * @returns TodoItem组件
 */
const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onDelete,
  onToggle,
  onEdit,
  onSubmitReview,
  onApproveTask,
  onRejectTask
}) => {
  const { currentUser, partner, relationship } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [points, setPoints] = useState(todo.points || 10);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewComments, setReviewComments] = useState('');

  // 检查当前用户是否是任务的创建者
  const isCreator = currentUser?.id === todo.createdById;
  
  // 检查是否能审核（非创建者且任务处于待审核状态）
  const userCanReview = currentUser && todo.reviewStatus === 'pending' && !isCreator;

  // 检查任务是否已被审核（approved或rejected）
  const isReviewed = todo.reviewStatus === 'approved' || todo.reviewStatus === 'rejected';

  // 获取优先级对应的颜色样式
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  // 获取审核状态对应的样式
  const getReviewStatusInfo = () => {
    switch (todo.reviewStatus) {
      case 'approved': return { style: 'bg-green-100 text-green-800', text: '已批准' };
      case 'rejected': return { style: 'bg-red-100 text-red-800', text: '已拒绝' };
      case 'pending': return { style: 'bg-yellow-100 text-yellow-800', text: '等待审核' };
      default: return { style: 'bg-gray-100 text-gray-800', text: '未提交' };
    }
  };

  // 获取爱的类型对应的图标和标签
  const getLoveTypeInfo = () => {
    switch (todo.loveType) {
      case 'gift': return { icon: '🎁', label: '礼物' };
      case 'date': return { icon: '💖', label: '约会' };
      case 'care': return { icon: '🤗', label: '关心' };
      case 'message': return { icon: '💌', label: '消息' };
      default: return { icon: '❤️', label: '其他' };
    }
  };

  // 获取伴侣标签对应的样式和文本
  const getPartnerTagInfo = () => {
    switch (todo.partnerTag) {
      case 'self': return { style: 'bg-blue-100 text-blue-800', text: '我的' };
      case 'partner': return { style: 'bg-pink-100 text-pink-800', text: '伴侣的' };
      case 'both': return { style: 'bg-purple-100 text-purple-800', text: '共同的' };
      default: return { style: 'bg-gray-100 text-gray-800', text: '未标记' };
    }
  };

  // 修复 linter 错误：使用正确的 reviewStatus 类型
  const isTaskPending = todo.reviewStatus === 'pending';
  const isTaskApproved = todo.reviewStatus === 'approved';
  const isTaskRejected = todo.reviewStatus === 'rejected';
  const isTaskNotSubmitted = todo.reviewStatus === 'not_submitted';

  // 保存编辑内容
  const handleSave = () => {
    const updatedTodo = {
      ...todo,
      title,
      description,
      points
    };
    onEdit(updatedTodo);
    setIsEditing(false);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setTitle(todo.title);
    setDescription(todo.description || '');
    setPoints(todo.points || 10);
    setIsEditing(false);
  };

  // 处理提交审核
  const handleSubmitForReview = () => {
    onSubmitReview(todo.id);
  };

  // 处理审核表单提交
  const handleReviewSubmit = (isApproved: boolean) => {
    if (isApproved) {
      onApproveTask(todo.id, points, reviewComments);
    } else {
      onRejectTask(todo.id, reviewComments);
    }
    setShowReviewForm(false);
    setReviewComments('');
  };

  // 检查当前用户是否有权限处理待办事项，根据状态决定显示哪些操作按钮
  const renderActionButtons = () => {
    // 是否正在编辑
    if (showReviewForm || isEditing) return null;
    
    return (
      <div className="flex justify-end space-x-2 mt-2">
        {/* 编辑按钮 - 只有创建者可见 */}
        {isCreator && todo.reviewStatus !== 'pending' && (
          <button
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            onClick={() => setIsEditing(true)}
          >
            编辑
          </button>
        )}
        
        {/* 删除按钮 - 只有创建者可见且非审核中 */}
        {isCreator && todo.reviewStatus !== 'pending' && (
          <button
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            onClick={() => onDelete(todo.id)}
          >
            删除
          </button>
        )}
        
        {/* 提交审核按钮 - 已完成但未提交审核时可见 */}
        {isCreator && todo.completed && todo.reviewStatus === 'not_submitted' && (
          <button
            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
            onClick={handleSubmitForReview}
          >
            提交审核
          </button>
        )}
        
        {/* 审核按钮 - 非创建者且任务待审核时可见 */}
        {!isCreator && todo.reviewStatus === 'pending' && (
          <button
            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            onClick={() => setShowReviewForm(true)}
          >
            审核
          </button>
        )}
      </div>
    );
  };

  // 编辑模式渲染
  if (isEditing) {
    return (
      <div className={`mb-4 p-4 bg-white rounded shadow ${getPriorityColor()}`}>
        <input
          type="text"
          className="w-full mb-2 p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full mb-2 p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="mb-2">
          <label className="mr-2">积分:</label>
          <input
            type="number"
            className="p-1 border rounded w-20"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded"
            onClick={handleCancelEdit}
          >
            取消
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>
    );
  }

  // 审核表单
  if (showReviewForm) {
    return (
      <div className={`mb-4 p-4 bg-white rounded shadow ${getPriorityColor()}`}>
        <h3 className="font-bold mb-2">{todo.title}</h3>
        <p className="mb-2">{todo.description}</p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-sm text-yellow-800 font-medium">您正在审核伴侣的任务，请认真评价。</p>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium">审核评论:</label>
          <textarea
            className="w-full p-2 border rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            placeholder="添加您的审核评论..."
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-1 font-medium">奖励积分: {points}</label>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={points} 
            onChange={(e) => setPoints(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>1</span>
            <span>10</span>
            <span>20</span>
            <span>30</span>
            <span>40</span>
            <span>50</span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            onClick={() => setShowReviewForm(false)}
          >
            取消
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            onClick={() => handleReviewSubmit(false)}
          >
            拒绝
          </button>
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            onClick={() => handleReviewSubmit(true)}
          >
            批准
          </button>
        </div>
      </div>
    );
  }

  // 查看模式渲染
  const { icon, label } = getLoveTypeInfo();
  const { style, text } = getPartnerTagInfo();
  const { style: reviewStyle, text: reviewText } = getReviewStatusInfo();

  return (
    <div className={`mb-4 p-4 bg-white rounded shadow ${getPriorityColor()}`}>
      <div className="flex items-start mb-2">
        <input
          type="checkbox"
          className="mt-1 mr-2"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          disabled={todo.reviewStatus === 'pending' || isReviewed}
        />
        <div className="flex-grow">
          <h3 className={`font-bold ${todo.completed ? 'line-through' : ''}`}>
            {todo.title}
          </h3>
          <p className={todo.completed ? 'line-through text-gray-500' : ''}>{todo.description}</p>
          
          {todo.dueDate && (
            <p className="text-sm text-gray-600 mt-1">
              截止日期: {formatDate(todo.dueDate)}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {/* 优先级标签 */}
            {todo.priority && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {todo.priority === 'high' ? '高优先级' : 
                 todo.priority === 'medium' ? '中优先级' : '低优先级'}
              </span>
            )}
            
            {/* 伴侣标签 */}
            {todo.partnerTag && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                todo.partnerTag === 'self' ? 'bg-blue-100 text-blue-800' :
                todo.partnerTag === 'partner' ? 'bg-pink-100 text-pink-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {todo.partnerTag === 'self' ? '我的' : 
                 todo.partnerTag === 'partner' ? '伴侣的' : '共同的'}
              </span>
            )}
            
            {/* 爱的类型标签 */}
            {todo.loveType && (
              <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">
                {icon} {
                  todo.loveType === 'gift' ? '礼物' :
                  todo.loveType === 'date' ? '约会' :
                  todo.loveType === 'care' ? '关心' :
                  todo.loveType === 'message' ? '消息' : '其他'
                }
              </span>
            )}
            
            {/* 积分标签 */}
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              {todo.points} 积分
            </span>
            
            {/* 审核状态标签 */}
            <span className={`text-xs px-2 py-1 rounded-full ${
              todo.reviewStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              todo.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
              todo.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {todo.reviewStatus === 'pending' ? '等待审核' : 
               todo.reviewStatus === 'approved' ? '已批准' : 
               todo.reviewStatus === 'rejected' ? '已拒绝' : '未提交'}
            </span>
          </div>
          
          {/* 审核评论显示 */}
          {todo.reviewComment && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm font-semibold text-gray-700">审核评论:</p>
              <p className="text-sm text-gray-600">{todo.reviewComment}</p>
            </div>
          )}
          
          {/* 审核状态提示 */}
          {isTaskPending && isCreator && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
              <p className="text-sm text-yellow-800">此任务正在等待伴侣审核，请耐心等待。</p>
            </div>
          )}
          
          {isTaskApproved && isCreator && (
            <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded">
              <p className="text-sm text-green-800">恭喜！此任务已被批准，您已获得 {todo.points} 积分。</p>
            </div>
          )}
          
          {isTaskRejected && isCreator && (
            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded">
              <p className="text-sm text-red-800">此任务被拒绝，请查看评论了解原因。</p>
            </div>
          )}
          
          {userCanReview && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
              <p className="text-sm text-blue-800">您的伴侣已完成此任务，请进行审核。</p>
            </div>
          )}
        </div>
        
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default TodoItem;