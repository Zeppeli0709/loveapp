'use client';

import { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import { Todo } from '../types';

/**
 * 待办事项列表组件
 */
export default function TodoList() {
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
  // 筛选状态
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  // 标签筛选状态
  const [tagFilter, setTagFilter] = useState<'all' | 'self' | 'partner' | 'both'>('all');
  // 爱的类型筛选状态
  const [typeFilter, setTypeFilter] = useState<'all' | 'gift' | 'date' | 'care' | 'message' | 'other'>('all');

  // 从本地存储加载待办事项
  useEffect(() => {
    const storedTodos = localStorage.getItem('loveTodos');
    if (storedTodos) {
      try {
        // 需要转换日期字符串为Date对象
        const parsedTodos = JSON.parse(storedTodos, (key, value) => {
          if (key === 'createdAt' || key === 'dueDate') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setTodos(parsedTodos);
      } catch (e) {
        console.error('解析本地存储中的待办事项时出错:', e);
      }
    }
  }, []);

  // 保存待办事项到本地存储
  useEffect(() => {
    localStorage.setItem('loveTodos', JSON.stringify(todos));
  }, [todos]);

  // 添加新待办事项
  const addTodo = () => {
    if (title.trim() === '') return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      partnerTag,
      loveType,
      createdAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdById: '1',
      isShared: partnerTag === 'both',
    };
    
    setTodos([...todos, newTodo]);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setPartnerTag('both');
    setLoveType('care');
    setDueDate('');
  };

  // 删除待办事项
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 切换待办事项完成状态
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 编辑待办事项
  const editTodo = (updatedTodo: Todo) => {
    setTodos(
      todos.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
  };

  // 根据筛选条件过滤待办事项
  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'all') return true;
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .filter(todo => {
      if (tagFilter === 'all') return true;
      return todo.partnerTag === tagFilter;
    })
    .filter(todo => {
      if (typeFilter === 'all') return true;
      return todo.loveType === typeFilter;
    });

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border-2 border-love-300 dark:border-love-700">
        <h2 className="text-2xl font-bold text-love-500 dark:text-love-300 mb-4 text-center">💑 恋爱清单 💑</h2>
        
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
                  onChange={e => setPriority(e.target.value as any)}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">
                  <span className="label-text text-love-700">关联对象</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={partnerTag}
                  onChange={e => setPartnerTag(e.target.value as any)}
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
                  onChange={e => setLoveType(e.target.value as any)}
                >
                  <option value="gift">礼物</option>
                  <option value="date">约会</option>
                  <option value="care">关心</option>
                  <option value="message">消息</option>
                  <option value="other">其他</option>
                </select>
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
          <div className="flex-1 min-w-[150px]">
            <select
              className="select select-bordered w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
            >
              <option value="all">所有状态</option>
              <option value="active">待完成</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <select
              className="select select-bordered w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={tagFilter}
              onChange={e => setTagFilter(e.target.value as any)}
            >
              <option value="all">所有对象</option>
              <option value="self">我的</option>
              <option value="partner">伴侣的</option>
              <option value="both">共同的</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <select
              className="select select-bordered w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
            >
              <option value="all">所有类型</option>
              <option value="gift">礼物</option>
              <option value="date">约会</option>
              <option value="care">关心</option>
              <option value="message">消息</option>
              <option value="other">其他</option>
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