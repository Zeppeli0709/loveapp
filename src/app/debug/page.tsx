'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [storageData, setStorageData] = useState<{[key: string]: any}>({});
  const [message, setMessage] = useState('');
  
  // 加载所有本地存储数据
  useEffect(() => {
    loadAllStorageData();
  }, []);
  
  // 加载所有存储数据
  const loadAllStorageData = () => {
    const data: {[key: string]: any} = {};
    
    // 遍历localStorage中的所有键
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            data[key] = JSON.parse(value);
          }
        } catch (e) {
          console.error(`解析键 ${key} 的值时出错:`, e);
          const value = localStorage.getItem(key);
          data[key] = value ? { rawValue: value, error: '无法解析为JSON' } : null;
        }
      }
    }
    
    setStorageData(data);
  };
  
  // 清除特定键的数据
  const clearStorageItem = (key: string) => {
    try {
      localStorage.removeItem(key);
      loadAllStorageData();
      setMessage(`已清除 ${key} 的数据`);
    } catch (e) {
      console.error(`清除键 ${key} 时出错:`, e);
      setMessage(`清除 ${key} 时出错`);
    }
  };
  
  // 清除所有数据
  const clearAllStorage = () => {
    try {
      localStorage.clear();
      loadAllStorageData();
      setMessage('已清除所有数据');
    } catch (e) {
      console.error('清除所有数据时出错:', e);
      setMessage('清除所有数据时出错');
    }
  };
  
  // 手动初始化礼物数据
  const initializeGifts = () => {
    try {
      const defaultGifts = [
        {
          id: '1',
          name: '爱心鲜花',
          description: '虚拟的爱心鲜花，表达对伴侣的爱意',
          type: 'flower',
          requiredPoints: 50,
          imageUrl: undefined
        },
        {
          id: '2',
          name: '爱心宠物',
          description: '可爱的虚拟宠物，陪伴你们的爱情旅程',
          type: 'pet',
          requiredPoints: 100,
          imageUrl: undefined
        },
        {
          id: '3',
          name: '爱心戒指',
          description: '象征永恒的爱情戒指',
          type: 'ring',
          requiredPoints: 200,
          imageUrl: undefined
        }
      ];
      localStorage.setItem('gifts', JSON.stringify(defaultGifts));
      loadAllStorageData();
      setMessage('已初始化礼物数据');
    } catch (e) {
      console.error('初始化礼物数据时出错:', e);
      setMessage('初始化礼物数据时出错');
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">调试控制台</h1>
        
        {message && (
          <div className="alert alert-info mb-4">
            <p>{message}</p>
          </div>
        )}
        
        <div className="flex space-x-4 mb-8">
          <button 
            className="btn btn-primary" 
            onClick={loadAllStorageData}
          >
            刷新数据
          </button>
          <button 
            className="btn btn-error" 
            onClick={() => {
              if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
                clearAllStorage();
              }
            }}
          >
            清除所有数据
          </button>
          <button 
            className="btn btn-success" 
            onClick={initializeGifts}
          >
            初始化礼物数据
          </button>
          <Link href="/dashboard" className="btn btn-outline">
            返回仪表盘
          </Link>
        </div>
        
        <div className="space-y-6">
          {Object.entries(storageData).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{key}</h2>
                <button 
                  className="btn btn-sm btn-error" 
                  onClick={() => {
                    if (confirm(`确定要清除 ${key} 的数据吗？`)) {
                      clearStorageItem(key);
                    }
                  }}
                >
                  清除
                </button>
              </div>
              <pre className="bg-white p-3 rounded border overflow-auto max-h-60">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 