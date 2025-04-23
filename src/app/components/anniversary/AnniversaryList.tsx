'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Anniversary } from '../../types/anniversary';

export default function AnniversaryList() {
  const { partner, relationship } = useAuth();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isYearly, setIsYearly] = useState(true);
  const [reminderDays, setReminderDays] = useState<number | undefined>(7);

  // 加载纪念日
  useEffect(() => {
    if (!relationship) return;
    
    const storedAnniversaries = localStorage.getItem('anniversaries');
    if (storedAnniversaries) {
      try {
        const parsedAnniversaries: Anniversary[] = JSON.parse(storedAnniversaries, (key, value) => {
          if (key === 'date') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        // 筛选当前关系的纪念日
        const filteredAnniversaries = parsedAnniversaries.filter(
          ann => ann.relationshipId === relationship.id
        );
        
        setAnniversaries(filteredAnniversaries);
      } catch (e) {
        console.error('解析纪念日数据时出错:', e);
      }
    }
  }, [relationship]);

  // 添加纪念日
  const handleAddAnniversary = () => {
    if (!title.trim() || !date || !relationship) return;
    
    const newAnniversary: Anniversary = {
      id: Date.now().toString(),
      relationshipId: relationship.id,
      title: title.trim(),
      description: description.trim() || undefined,
      date: new Date(date),
      isYearly,
      reminderDays,
    };
    
    const updatedAnniversaries = [...anniversaries, newAnniversary];
    setAnniversaries(updatedAnniversaries);
    
    // 保存到本地存储
    const storedAnniversaries = localStorage.getItem('anniversaries');
    const allAnniversaries: Anniversary[] = storedAnniversaries 
      ? JSON.parse(storedAnniversaries)
      : [];
    
    allAnniversaries.push(newAnniversary);
    localStorage.setItem('anniversaries', JSON.stringify(allAnniversaries));
    
    // 重置表单
    setTitle('');
    setDescription('');
    setDate('');
    setIsYearly(true);
    setReminderDays(7);
    setIsAdding(false);
  };

  // 删除纪念日
  const handleDeleteAnniversary = (id: string) => {
    const updatedAnniversaries = anniversaries.filter(ann => ann.id !== id);
    setAnniversaries(updatedAnniversaries);
    
    // 更新本地存储
    const storedAnniversaries = localStorage.getItem('anniversaries');
    if (storedAnniversaries) {
      const allAnniversaries: Anniversary[] = JSON.parse(storedAnniversaries);
      const filteredAnniversaries = allAnniversaries.filter(ann => ann.id !== id);
      localStorage.setItem('anniversaries', JSON.stringify(filteredAnniversaries));
    }
  };

  // 格式化日期显示
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN');
  };

  // 计算剩余天数
  const daysUntil = (date: Date, isYearly: boolean) => {
    const today = new Date();
    const targetDate = new Date(date);
    
    if (isYearly) {
      // 设置为今年的日期
      targetDate.setFullYear(today.getFullYear());
      
      // 如果今年的日期已经过了，就设为明年
      if (targetDate < today) {
        targetDate.setFullYear(today.getFullYear() + 1);
      }
    }
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!partner || !relationship) {
    return (
      <div className="card bg-base-100 shadow-lg p-6 mb-6">
        <div className="text-center">
          <p className="mb-4">您需要先添加一个伴侣才能管理纪念日</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card bg-base-100 shadow-lg p-6 mb-6 border-t-4 border-love-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-love-600">你们的纪念日</h2>
          <button 
            className="btn btn-sm btn-primary bg-love-500"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? '取消' : '添加纪念日'}
          </button>
        </div>

        {/* 添加纪念日表单 */}
        {isAdding && (
          <div className="card bg-love-50 p-4 mb-6">
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">纪念日名称</span>
              </label>
              <input
                type="text"
                placeholder="例如：相识纪念日、表白纪念日"
                className="input input-bordered"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">描述(可选)</span>
              </label>
              <textarea
                placeholder="添加一些有意义的描述..."
                className="textarea textarea-bordered"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">日期</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-wrap gap-4 mb-3">
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text mr-2">每年重复</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isYearly}
                    onChange={(e) => setIsYearly(e.target.checked)}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">提前提醒(天)</span>
                </label>
                <select
                  className="select select-bordered"
                  value={reminderDays || ''}
                  onChange={(e) => setReminderDays(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">不提醒</option>
                  <option value="1">1天</option>
                  <option value="3">3天</option>
                  <option value="7">7天</option>
                  <option value="14">14天</option>
                  <option value="30">30天</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="btn btn-primary bg-love-500"
                onClick={handleAddAnniversary}
              >
                保存纪念日
              </button>
            </div>
          </div>
        )}

        {/* 纪念日列表 */}
        {anniversaries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无纪念日，快去添加你们的重要日子吧！</p>
            <div className="text-5xl mt-4">💑</div>
          </div>
        ) : (
          <div className="space-y-4">
            {anniversaries
              .sort((a, b) => daysUntil(a.date, a.isYearly) - daysUntil(b.date, b.isYearly))
              .map(anniversary => {
                const days = daysUntil(anniversary.date, anniversary.isYearly);
                let statusClass = 'bg-gray-100 text-gray-800';
                if (days <= 0) statusClass = 'bg-green-100 text-green-800';
                else if (days <= 7) statusClass = 'bg-red-100 text-red-800';
                else if (days <= 30) statusClass = 'bg-yellow-100 text-yellow-800';
                
                return (
                  <div key={anniversary.id} className="card bg-white shadow-sm border p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{anniversary.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(anniversary.date)}
                          {anniversary.isYearly && ' (每年)'}
                        </p>
                        {anniversary.description && (
                          <p className="text-gray-600 mt-1">{anniversary.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`badge ${statusClass} px-2 py-1 mb-2`}>
                          {days <= 0 ? '今天' : `还有 ${days} 天`}
                        </span>
                        <button
                          className="btn btn-xs btn-ghost text-red-500"
                          onClick={() => handleDeleteAnniversary(anniversary.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
} 