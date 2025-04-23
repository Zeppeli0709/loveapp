'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types/auth';

export default function PartnerManager() {
  const { currentUser, partner, pendingRequests, sendRelationshipRequest, acceptRelationshipRequest, rejectRelationshipRequest, searchUsers } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // 处理搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setErrorMessage('未找到用户');
      }
    } catch (err) {
      setErrorMessage('搜索时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理发送邀请
  const handleSendInvite = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const success = await sendRelationshipRequest(selectedUser.id, inviteMessage);
      if (success) {
        setSuccessMessage(`已向 ${selectedUser.displayName} 发送伴侣邀请`);
        setSelectedUser(null);
        setInviteMessage('');
        setSearchQuery('');
        setSearchResults([]);
      } else {
        setErrorMessage('发送邀请失败，可能已经发送过邀请');
      }
    } catch (err) {
      setErrorMessage('发送邀请时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理接受邀请
  const handleAcceptInvite = async (requestId: string) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const success = await acceptRelationshipRequest(requestId);
      if (!success) {
        setErrorMessage('接受邀请失败');
      }
    } catch (err) {
      setErrorMessage('接受邀请时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理拒绝邀请
  const handleRejectInvite = async (requestId: string) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const success = await rejectRelationshipRequest(requestId);
      if (!success) {
        setErrorMessage('拒绝邀请失败');
      }
    } catch (err) {
      setErrorMessage('拒绝邀请时发生错误');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 如果用户未登录，显示提示
  if (!currentUser) {
    return (
      <div className="card bg-base-100 shadow-lg p-6">
        <div className="text-center">
          <p className="mb-4">请先登录以管理您的伴侣关系</p>
        </div>
      </div>
    );
  }
  
  // 显示已有伴侣信息
  if (partner) {
    return (
      <div className="card bg-base-100 shadow-lg p-6 border-t-4 border-love-500">
        <h2 className="text-xl font-bold mb-4 text-love-600">您的伴侣</h2>
        <div className="flex items-center space-x-4 p-4 bg-love-50 rounded-lg">
          <div className="avatar placeholder">
            <div className="bg-love-200 text-love-700 rounded-full w-16 h-16">
              <span className="text-xl">{partner.displayName.charAt(0)}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">{partner.displayName}</h3>
            <p className="text-gray-600">{partner.username}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card bg-base-100 shadow-lg p-6 border-t-4 border-love-500">
      <h2 className="text-xl font-bold mb-4 text-love-600">寻找您的伴侣</h2>
      
      {/* 错误和成功消息 */}
      {errorMessage && (
        <div className="alert alert-error mb-4">
          <p>{errorMessage}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* 伴侣请求列表 */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">伴侣请求</h3>
          <div className="space-y-2">
            {pendingRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-3 bg-gray-50">
                <p className="mb-2">有人想成为您的伴侣</p>
                {request.message && (
                  <p className="text-gray-600 mb-2">&ldquo;{request.message}&rdquo;</p>
                )}
                <div className="flex space-x-2 justify-end">
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => handleRejectInvite(request.id)}
                    disabled={isLoading}
                  >
                    拒绝
                  </button>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleAcceptInvite(request.id)}
                    disabled={isLoading}
                  >
                    接受
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 搜索表单 */}
      <div className="form-control mb-4">
        <div className="input-group">
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            className="input input-bordered flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            className="btn btn-primary bg-love-500"
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
          >
            搜索
          </button>
        </div>
      </div>
      
      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">搜索结果</h3>
          <div className="space-y-2">
            {searchResults.map(user => (
              <div 
                key={user.id} 
                className={`border rounded-lg p-3 ${selectedUser?.id === user.id ? 'bg-love-50 border-love-300' : 'bg-gray-50'} cursor-pointer`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-gray-600 text-sm">{user.username}</p>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                    }}
                  >
                    选择
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 发送邀请表单 */}
      {selectedUser && (
        <div className="border rounded-lg p-4 bg-love-50">
          <h3 className="text-md font-semibold mb-2">发送伴侣邀请</h3>
          <p className="mb-2">向 <span className="font-medium">{selectedUser.displayName}</span> 发送邀请</p>
          
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">邀请消息 (可选)</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              placeholder="输入邀请消息..."
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={3}
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button 
              className="btn btn-ghost"
              onClick={() => setSelectedUser(null)}
              disabled={isLoading}
            >
              取消
            </button>
            <button 
              className="btn btn-primary bg-love-500"
              onClick={handleSendInvite}
              disabled={isLoading}
            >
              发送邀请
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 