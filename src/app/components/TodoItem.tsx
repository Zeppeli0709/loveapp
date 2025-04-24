'use client';

import { useState } from 'react';
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
  onEdit: (todo: Todo) => void;
  /** 提交审核的回调函数 */
  onSubmitReview: (todoId: string) => void;
  /** 批准任务的回调函数 */
  onApproveTask: (todoId: string, points: number, comment?: string) => void;
  /** 拒绝任务的回调函数 */
  onRejectTask: (todoId: string, comment: string) => void;
}

/**
 * 显示单个待办事项的组件
 */
export default function TodoItem({ 
  todo, 
  onDelete, 
  onToggle, 
  onEdit, 
  onSubmitReview, 
  onApproveTask, 
  onRejectTask 
}: TodoItemProps) {
  const { currentUser, partner, relationship } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');
  const [editedPoints, setEditedPoints] = useState(todo.points || 10);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // 检查当前用户是否是任务的创建者
  const isCreator = currentUser?.id === todo.createdById;
  // 检查当前用户是否可以审核任务（非创建者且伴侣）
  const canReview = !isCreator && todo.partnerTag !== 'self';

  // 获取优先级对应的颜色样式
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  // 保存编辑内容
  const handleSaveEdit = () => {
    onEdit({
      ...todo,
      title: editedTitle,
      description: editedDescription,
      points: editedPoints
    });
    setIsEditing(false);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || '');
    setEditedPoints(todo.points || 10);
    setIsEditing(false);
  };

  // 处理提交审核
  const handleSubmitReview = () => {
    console.log("请求提交任务审核:", todo.id, todo.title);
    
    // 验证任务是否已完成
    if (!todo.completed) {
      alert("只有已完成的任务才能提交审核");
      return;
    }
    
    // 验证当前用户是否是任务的创建者
    if (!isCreator) {
      alert("只有任务创建者才能提交审核");
      return;
    }
    
    // 验证任务状态
    if (todo.reviewStatus !== 'not_submitted') {
      alert("该任务已经处于审核流程中或已被审核");
      return;
    }
    
    // 调用父组件传入的提交审核函数
    onSubmitReview(todo.id);
  };

  // 处理审核批准
  const handleApprove = () => {
    onApproveTask(todo.id, editedPoints, reviewComment);
    setShowReviewForm(false);
    setReviewComment('');
  };

  // 处理审核拒绝
  const handleReject = () => {
    onRejectTask(todo.id, reviewComment);
    setShowReviewForm(false);
    setReviewComment('');
  };

  // 格式化日期显示
  const formatDate = (date?: Date) => {
    if (!date) return '无日期';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  // 编辑模式渲染
  if (isEditing) {
    return (
      <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 border-l-4 border-primary">
        <div className="card-body p-4">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="input input-bordered w-full mb-2"
            placeholder="待办事项标题"
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="textarea textarea-bordered w-full mb-2"
            placeholder="详细描述"
            rows={2}
          />
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">积分值 (1-100)</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={editedPoints}
              onChange={(e) => setEditedPoints(Number(e.target.value))}
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex justify-end space-x-2 mt-2">
            <button onClick={handleCancelEdit} className="btn btn-sm btn-ghost">取消</button>
            <button onClick={handleSaveEdit} className="btn btn-sm btn-primary">保存</button>
          </div>
        </div>
      </div>
    );
  }

  // 审核表单
  if (showReviewForm) {
    return (
      <div className="card bg-base-100 dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 border-l-4 border-yellow-500">
        <div className="card-body p-4">
          <h3 className="text-lg font-medium mb-2">审核任务: {todo.title}</h3>
          
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300 mb-1">原始积分: {todo.points} 点</p>
            <div className="form-control">
              <label className="label">
                <span className="label-text">调整积分 (可选)</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={editedPoints}
                onChange={(e) => setEditedPoints(Number(e.target.value))}
                className="input input-bordered w-full"
              />
            </div>
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
              rows={2}
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-2">
            <button 
              onClick={() => setShowReviewForm(false)} 
              className="btn btn-sm btn-ghost"
            >
              取消
            </button>
            <button 
              onClick={handleReject} 
              className="btn btn-sm btn-error"
              disabled={!reviewComment.trim()}
            >
              拒绝
            </button>
            <button 
              onClick={handleApprove} 
              className="btn btn-sm btn-success"
            >
              批准
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 查看模式渲染
  const { icon, label } = getLoveTypeInfo();
  const { style, text } = getPartnerTagInfo();
  const { style: reviewStyle, text: reviewText } = getReviewStatusInfo();

  return (
    <div className={`card bg-base-100 dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 border-l-4 ${todo.completed ? 'border-green-500 opacity-75' : 'border-primary'}`}>
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              className="checkbox checkbox-primary mr-3"
              disabled={!isCreator || todo.reviewStatus === 'pending'}
            />
            <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'dark:text-white'}`}>
              {todo.title}
            </h3>
          </div>
          <div className="flex space-x-1">
            {isCreator && todo.reviewStatus !== 'pending' && (
              <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-ghost btn-square dark:text-gray-300">
                ✏️
              </button>
            )}
            {isCreator && (
              <button onClick={() => onDelete(todo.id)} className="btn btn-sm btn-ghost btn-square text-red-500">
                🗑️
              </button>
            )}
          </div>
        </div>
        
        {todo.description && (
          <p className={`mt-2 text-gray-600 dark:text-gray-300 ${todo.completed ? 'line-through' : ''}`}>
            {todo.description}
          </p>
        )}

        <div className="mt-2 flex items-center">
          <span className="text-love-600 font-semibold mr-2">积分: {todo.points}</span>
          <span className={`badge ${reviewStyle} px-2 py-1`}>
            {reviewText}
          </span>
        </div>
        
        {todo.reviewComment && (
          <div className="mt-2 bg-gray-50 dark:bg-gray-600 p-2 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">审核评论:</span> {todo.reviewComment}
            </p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`badge ${getPriorityColor()} px-2 py-1`}>
            {todo.priority === 'high' ? '高优先级' : todo.priority === 'medium' ? '中优先级' : '低优先级'}
          </span>
          <span className={`badge ${style} px-2 py-1`}>
            {text}
          </span>
          <span className="badge bg-love-100 text-love-800 px-2 py-1">
            {icon} {label}
          </span>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>创建日期: {formatDate(todo.createdAt)}</span>
          {todo.dueDate && <span>截止日期: {formatDate(todo.dueDate)}</span>}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end mt-3 space-x-2">
          {isCreator && todo.completed && todo.reviewStatus === 'not_submitted' && (
            <button 
              onClick={handleSubmitReview} 
              className="btn btn-sm btn-primary bg-love-500"
            >
              提交审核
            </button>
          )}
          
          {canReview && todo.reviewStatus === 'pending' && (
            <button 
              onClick={() => setShowReviewForm(true)} 
              className="btn btn-sm btn-primary"
            >
              审核
            </button>
          )}
        </div>
      </div>
    </div>
  );
}