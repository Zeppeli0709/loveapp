'use client';

import { useState } from 'react';
import { Todo } from '../types';

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
}

/**
 * 显示单个待办事项的组件
 */
export default function TodoItem({ todo, onDelete, onToggle, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');

  // 获取优先级对应的颜色样式
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      description: editedDescription
    });
    setIsEditing(false);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || '');
    setIsEditing(false);
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
          <div className="flex justify-end space-x-2 mt-2">
            <button onClick={handleCancelEdit} className="btn btn-sm btn-ghost">取消</button>
            <button onClick={handleSaveEdit} className="btn btn-sm btn-primary">保存</button>
          </div>
        </div>
      </div>
    );
  }

  // 查看模式渲染
  const { icon, label } = getLoveTypeInfo();
  const { style, text } = getPartnerTagInfo();

  return (
    <div className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 border-l-4 ${todo.completed ? 'border-green-500 opacity-75' : 'border-primary'}`}>
      <div className="card-body p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggle(todo.id)}
              className="checkbox checkbox-primary mr-3"
            />
            <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.title}
            </h3>
          </div>
          <div className="flex space-x-1">
            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-ghost btn-square">
              ✏️
            </button>
            <button onClick={() => onDelete(todo.id)} className="btn btn-sm btn-ghost btn-square text-red-500">
              🗑️
            </button>
          </div>
        </div>
        
        {todo.description && (
          <p className={`mt-2 text-gray-600 ${todo.completed ? 'line-through' : ''}`}>
            {todo.description}
          </p>
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
      </div>
    </div>
  );
}