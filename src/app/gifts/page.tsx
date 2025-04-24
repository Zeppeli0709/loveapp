'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Gift, RedeemedGift, PointHistory } from '../types';
import Link from 'next/link';
import Image from 'next/image';

/**
 * 礼物兑换页面
 */
export default function GiftsPage() {
  const { currentUser, partner, relationship } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [redeemedGifts, setRedeemedGifts] = useState<RedeemedGift[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'redeemed' | 'received'>('catalog');
  const [successMessage, setSuccessMessage] = useState('');
  const [giftToSend, setGiftToSend] = useState<RedeemedGift | null>(null);
  
  // 初始化礼物数据和加载已有数据
  useEffect(() => {
    console.log("加载礼物和积分数据");
    
    // 加载礼物目录
    const storedGifts = localStorage.getItem('gifts');
    if (!storedGifts) {
      const defaultGifts: Gift[] = [
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
        },
        {
          id: '4',
          name: '浪漫晚餐',
          description: '在家中准备一顿浪漫的晚餐',
          type: 'other',
          requiredPoints: 150,
          imageUrl: undefined
        },
        {
          id: '5',
          name: '电影之夜',
          description: '一起观看喜爱的电影',
          type: 'other',
          requiredPoints: 80,
          imageUrl: undefined
        }
      ];
      localStorage.setItem('gifts', JSON.stringify(defaultGifts));
      setGifts(defaultGifts);
      console.log("初始化礼物目录完成");
    } else {
      try {
        const parsedGifts = JSON.parse(storedGifts);
        setGifts(parsedGifts);
        console.log("加载礼物目录完成", parsedGifts.length);
      } catch (e) {
        console.error('解析礼物数据时出错:', e);
      }
    }
    
    // 加载已兑换的礼物
    loadRedeemedGifts();
    
    // 加载积分历史
    loadPointHistory();
  }, []);
  
  // 加载已兑换礼物
  const loadRedeemedGifts = () => {
    const storedRedeemedGifts = localStorage.getItem('redeemedGifts');
    if (storedRedeemedGifts) {
      try {
        const parsedRedeemedGifts = JSON.parse(storedRedeemedGifts, (key, value) => {
          if (key === 'redeemedAt' || key === 'sentAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setRedeemedGifts(parsedRedeemedGifts);
        console.log("加载已兑换礼物完成", parsedRedeemedGifts.length);
      } catch (e) {
        console.error('解析已兑换礼物数据时出错:', e);
      }
    } else {
      console.log("没有已兑换礼物数据");
    }
  };
  
  // 加载积分历史
  const loadPointHistory = () => {
    const storedPointHistory = localStorage.getItem('pointHistory');
    if (storedPointHistory) {
      try {
        // 使用自定义JSON解析器来正确处理日期对象
        const parsedHistory = JSON.parse(storedPointHistory, (key, value) => {
          if (key === 'createdAt') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        setPointHistory(parsedHistory);
        console.log("加载积分历史完成", parsedHistory.length);
        
        // 计算当前用户的总积分
        if (currentUser) {
          updateUserTotalPoints(parsedHistory, currentUser.id);
        }
      } catch (e) {
        console.error('解析积分历史时出错:', e);
        // 初始化为空数组，避免错误
        setPointHistory([]);
      }
    } else {
      console.log("没有积分历史数据");
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
      console.log("更新用户总积分:", latestRecord.totalPoints, "基于积分记录ID:", latestRecord.id);
      setTotalPoints(latestRecord.totalPoints);
    } else {
      console.log("用户没有积分记录，设置为0");
      setTotalPoints(0);
    }
  };
  
  // 当用户变更时重新计算积分
  useEffect(() => {
    if (currentUser && pointHistory.length > 0) {
      console.log("用户变更，重新计算积分");
      updateUserTotalPoints(pointHistory, currentUser.id);
    }
  }, [currentUser, pointHistory]);
  
  // 调试用：监控积分变化
  useEffect(() => {
    console.log("当前总积分更新为:", totalPoints);
  }, [totalPoints]);
  
  // 筛选当前关系的已兑换礼物
  const filteredRedeemedGifts = redeemedGifts.filter(rg => {
    if (!relationship || !currentUser) return false;
    return rg.relationshipId === relationship.id && 
           rg.userId === currentUser.id && 
           !rg.sentTo;  // 未送出的礼物
  });
  
  // 筛选收到的礼物
  const receivedGifts = redeemedGifts.filter(rg => {
    if (!relationship || !currentUser) return false;
    return rg.relationshipId === relationship.id && 
           rg.sentTo === currentUser.id; // 送给当前用户的礼物
  });
  
  // 兑换礼物
  const redeemGift = (gift: Gift) => {
    if (!currentUser || !relationship) {
      console.error("无法兑换：用户或关系不存在");
      alert("您需要先登录并添加伴侣关系才能兑换礼物");
      return;
    }
    
    // 检查积分是否足够
    if (totalPoints < gift.requiredPoints) {
      alert('积分不足，无法兑换该礼物');
      return;
    }
    
    console.log("开始兑换礼物:", gift.name, "所需积分:", gift.requiredPoints, "当前积分:", totalPoints);
    
    // 创建兑换记录
    const newRedeemedGift: RedeemedGift = {
      id: Date.now().toString(),
      giftId: gift.id,
      userId: currentUser.id,
      relationshipId: relationship.id,
      pointsUsed: gift.requiredPoints,
      redeemedAt: new Date(),
      gift: gift
    };
    
    // 扣除积分并更新积分历史
    const newTotalPoints = totalPoints - gift.requiredPoints;
    
    // 创建新的积分记录
    const newPointRecord: PointHistory = {
      id: Date.now().toString(),
      userId: currentUser.id,
      relationshipId: relationship.id,
      pointsChange: -gift.requiredPoints,
      totalPoints: newTotalPoints,
      reason: `兑换礼物: ${gift.name}`,
      createdAt: new Date()
    };
    
    try {
      // 先从localStorage获取最新的积分历史
      const storedPointHistory = localStorage.getItem('pointHistory');
      let currentPointHistory = [];
      
      if (storedPointHistory) {
        try {
          // 使用自定义JSON解析器处理日期
          currentPointHistory = JSON.parse(storedPointHistory, (key, value) => {
            if (key === 'createdAt') {
              return value ? new Date(value) : null;
            }
            return value;
          });
        } catch (e) {
          console.error("解析积分历史出错:", e);
          currentPointHistory = [];
        }
      }
      
      // 合并当前状态和localStorage中的积分历史
      const updatedPointHistory = [...currentPointHistory, newPointRecord];
      
      // 保存回localStorage
      localStorage.setItem('pointHistory', JSON.stringify(updatedPointHistory));
      setPointHistory(updatedPointHistory);
      console.log("积分已扣除，新总积分:", newTotalPoints);
      
      // 直接更新总积分显示
      setTotalPoints(newTotalPoints);
      
      // 更新已兑换礼物列表 - 同样先获取最新数据
      const storedRedeemedGifts = localStorage.getItem('redeemedGifts');
      let currentRedeemedGifts = [];
      
      if (storedRedeemedGifts) {
        try {
          currentRedeemedGifts = JSON.parse(storedRedeemedGifts, (key, value) => {
            if (key === 'redeemedAt' || key === 'sentAt') {
              return value ? new Date(value) : null;
            }
            return value;
          });
        } catch (e) {
          console.error("解析已兑换礼物出错:", e);
          currentRedeemedGifts = [];
        }
      }
      
      const updatedRedeemedGifts = [...currentRedeemedGifts, newRedeemedGift];
      localStorage.setItem('redeemedGifts', JSON.stringify(updatedRedeemedGifts));
      setRedeemedGifts(updatedRedeemedGifts);
      console.log("已兑换礼物列表已更新");
      
      // 显示成功消息
      setSuccessMessage(`成功兑换了 ${gift.name}！积分 -${gift.requiredPoints}`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error("兑换礼物时出错:", error);
      alert('兑换礼物时出错，请稍后再试');
    }
  };
  
  // 赠送礼物给伴侣
  const sendGiftToPartner = (redeemedGift: RedeemedGift) => {
    if (!partner) {
      alert('您目前没有伴侣，无法赠送礼物');
      return;
    }
    
    try {
      // 从localStorage获取最新的已兑换礼物数据
      const storedRedeemedGifts = localStorage.getItem('redeemedGifts');
      let currentRedeemedGifts = [];
      
      if (storedRedeemedGifts) {
        try {
          currentRedeemedGifts = JSON.parse(storedRedeemedGifts, (key, value) => {
            if (key === 'redeemedAt' || key === 'sentAt') {
              return value ? new Date(value) : null;
            }
            return value;
          });
        } catch (e) {
          console.error("解析已兑换礼物出错:", e);
          currentRedeemedGifts = [...redeemedGifts]; // 使用当前状态作为备份
        }
      } else {
        currentRedeemedGifts = [...redeemedGifts];
      }
      
      // 更新礼物记录，添加赠送信息
      const updatedGifts = currentRedeemedGifts.map((rg: RedeemedGift) => {
        if (rg.id === redeemedGift.id) {
          return {
            ...rg,
            sentTo: partner.id,
            sentAt: new Date()
          };
        }
        return rg;
      });
      
      localStorage.setItem('redeemedGifts', JSON.stringify(updatedGifts));
      setRedeemedGifts(updatedGifts);
      setGiftToSend(null);
      
      setSuccessMessage(`您已成功将 ${redeemedGift.gift.name} 赠送给您的伴侣！`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error("赠送礼物时出错:", error);
      alert('赠送礼物时出错，请稍后再试');
    }
  };
  
  if (!currentUser || !relationship) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="mb-4">您需要先登录并添加一个伴侣才能兑换礼物</p>
          <Link href="/auth/login" className="btn btn-primary">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-full">
      {/* 礼物赠送确认弹窗 */}
      {giftToSend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">赠送礼物</h3>
            <p className="mb-4">您确定要将 <span className="font-semibold">{giftToSend.gift.name}</span> 赠送给您的伴侣吗？</p>
            <div className="flex justify-end space-x-4">
              <button 
                className="btn btn-ghost" 
                onClick={() => setGiftToSend(null)}
              >
                取消
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => sendGiftToPartner(giftToSend)}
              >
                确认赠送
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-love-300">
        <h1 className="text-2xl font-bold text-love-500 mb-4 text-center">礼物兑换中心</h1>
        
        {/* 积分信息 */}
        <div className="bg-love-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-love-600">我的爱心积分</h2>
          <p className="text-3xl font-bold text-love-700">{totalPoints} 分</p>
        </div>
        
        {successMessage && (
          <div className="alert alert-success mb-6">
            <p>{successMessage}</p>
          </div>
        )}
        
        {/* 标签切换 */}
        <div className="tabs tabs-boxed mb-6">
          <a 
            className={`tab ${activeTab === 'catalog' ? 'tab-active bg-love-500 text-white' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            礼物目录
          </a>
          <a 
            className={`tab ${activeTab === 'redeemed' ? 'tab-active bg-love-500 text-white' : ''}`}
            onClick={() => setActiveTab('redeemed')}
          >
            我的礼物 ({filteredRedeemedGifts.length})
          </a>
          <a 
            className={`tab ${activeTab === 'received' ? 'tab-active bg-love-500 text-white' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            收到的礼物 ({receivedGifts.length})
          </a>
        </div>
        
        {/* 礼物目录 */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gifts.map(gift => (
              <div key={gift.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                <figure className="h-48 relative">
                  {gift.imageUrl ? (
                    <Image
                      src={gift.imageUrl}
                      alt={gift.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        // 图像加载失败时显示替代内容
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // 防止无限循环
                        target.style.display = 'none';
                        const parent = target.parentNode as HTMLElement;
                        if (parent) {
                          parent.classList.add('bg-gray-200');
                          const span = document.createElement('span');
                          span.className = 'text-4xl absolute inset-0 flex items-center justify-center';
                          span.innerText = '🎁';
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <span className="text-4xl">
                        {gift.type === 'flower' ? '💐' : 
                         gift.type === 'pet' ? '🐶' : 
                         gift.type === 'ring' ? '💍' : 
                         gift.type === 'other' && gift.name.includes('晚餐') ? '🍽️' :
                         gift.type === 'other' && gift.name.includes('电影') ? '🎬' : '🎁'}
                      </span>
                    </div>
                  )}
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-love-600">{gift.name}</h2>
                  <p className="text-gray-600">{gift.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-love-500">{gift.requiredPoints} 积分</span>
                    <span className="badge badge-outline">
                      {gift.type === 'flower' ? '鲜花' : 
                       gift.type === 'pet' ? '宠物' : 
                       gift.type === 'ring' ? '戒指' : '其他'}
                    </span>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className={`btn ${totalPoints >= gift.requiredPoints ? 'btn-primary bg-love-500' : 'btn-disabled'}`}
                      onClick={() => redeemGift(gift)}
                      disabled={totalPoints < gift.requiredPoints}
                    >
                      {totalPoints >= gift.requiredPoints ? '兑换' : '积分不足'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* 我的礼物（已兑换但未赠送） */}
        {activeTab === 'redeemed' && (
          <div>
            {filteredRedeemedGifts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">您还没有兑换过礼物</p>
                <button 
                  className="btn btn-primary btn-sm mt-4"
                  onClick={() => setActiveTab('catalog')}
                >
                  去兑换礼物
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRedeemedGifts
                  .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())
                  .map(redeemedGift => (
                    <div key={redeemedGift.id} className="card card-side bg-base-100 shadow-md">
                      <figure className="w-32 h-32 relative">
                        {redeemedGift.gift.imageUrl ? (
                          <Image
                            src={redeemedGift.gift.imageUrl}
                            alt={redeemedGift.gift.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              // 图像加载失败时显示替代内容
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // 防止无限循环
                              target.style.display = 'none';
                              const parent = target.parentNode as HTMLElement;
                              if (parent) {
                                parent.classList.add('bg-gray-200');
                                const span = document.createElement('span');
                                span.className = 'text-3xl absolute inset-0 flex items-center justify-center';
                                span.innerText = '🎁';
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                            <span className="text-3xl">
                              {redeemedGift.gift.type === 'flower' ? '💐' : 
                               redeemedGift.gift.type === 'pet' ? '🐶' : 
                               redeemedGift.gift.type === 'ring' ? '💍' : 
                               redeemedGift.gift.type === 'other' && redeemedGift.gift.name.includes('晚餐') ? '🍽️' :
                               redeemedGift.gift.type === 'other' && redeemedGift.gift.name.includes('电影') ? '🎬' : '🎁'}
                            </span>
                          </div>
                        )}
                      </figure>
                      <div className="card-body p-4">
                        <h3 className="card-title text-love-600 text-lg">{redeemedGift.gift.name}</h3>
                        <p className="text-gray-600 text-sm">{redeemedGift.gift.description}</p>
                        <div className="flex justify-between text-sm">
                          <span>消耗积分: {redeemedGift.pointsUsed}</span>
                          <span>兑换日期: {new Date(redeemedGift.redeemedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="card-actions justify-end mt-2">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => setGiftToSend(redeemedGift)}
                          >
                            赠送给伴侣
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
        
        {/* 收到的礼物 */}
        {activeTab === 'received' && (
          <div>
            {receivedGifts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">您还没有收到礼物</p>
                <p className="text-gray-500 mt-2">当您的伴侣送礼物给您时，将会显示在这里</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedGifts
                  .sort((a, b) => (new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime()))
                  .map(receivedGift => (
                    <div key={receivedGift.id} className="card card-side bg-base-100 shadow-md">
                      <figure className="w-32 h-32 relative">
                        {receivedGift.gift.imageUrl ? (
                          <Image
                            src={receivedGift.gift.imageUrl}
                            alt={receivedGift.gift.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.style.display = 'none';
                              const parent = target.parentNode as HTMLElement;
                              if (parent) {
                                parent.classList.add('bg-gray-200');
                                const span = document.createElement('span');
                                span.className = 'text-3xl absolute inset-0 flex items-center justify-center';
                                span.innerText = '🎁';
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                            <span className="text-3xl">
                              {receivedGift.gift.type === 'flower' ? '💐' : 
                               receivedGift.gift.type === 'pet' ? '🐶' : 
                               receivedGift.gift.type === 'ring' ? '💍' : 
                               receivedGift.gift.type === 'other' && receivedGift.gift.name.includes('晚餐') ? '🍽️' :
                               receivedGift.gift.type === 'other' && receivedGift.gift.name.includes('电影') ? '🎬' : '🎁'}
                            </span>
                          </div>
                        )}
                      </figure>
                      <div className="card-body p-4">
                        <h3 className="card-title text-love-600 text-lg">{receivedGift.gift.name}</h3>
                        <p className="text-gray-600 text-sm">{receivedGift.gift.description}</p>
                        <div className="flex justify-between text-sm">
                          <span>来自: 伴侣</span>
                          <span>收到日期: {receivedGift.sentAt ? new Date(receivedGift.sentAt).toLocaleDateString() : '未知'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="btn btn-outline">
            返回面板
          </Link>
        </div>
      </div>
    </div>
  );
} 