'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, partner, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isUserMenuOpen && 
        menuRef.current && 
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);
  
  const toggleUserMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md py-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-love-500 text-2xl">❤️</span>
            <span className="font-bold text-xl text-love-600">恋爱清单</span>
          </Link>

          {/* 移动端菜单按钮 */}
          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* 桌面端菜单 */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-love-500">
                  待办清单
                </Link>
                <Link href="/relationship" className="text-gray-600 hover:text-love-500">
                  伴侣关系
                </Link>
                {partner && (
                  <Link href="/anniversaries" className="text-gray-600 hover:text-love-500">
                    纪念日
                  </Link>
                )}
                <div className="relative">
                  <button 
                    ref={buttonRef}
                    className="flex items-center space-x-1 text-gray-600 hover:text-love-500"
                    onClick={toggleUserMenu}
                  >
                    <span>{currentUser?.displayName || '用户'}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isUserMenuOpen && (
                    <div 
                      ref={menuRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    >
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-love-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        个人资料
                      </Link>
                      <Link 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-love-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        设置
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-love-50"
                      >
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-love-500">
                  登录
                </Link>
                <Link href="/auth/register" className="btn btn-sm btn-primary bg-love-500 hover:bg-love-600 text-white border-none">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 移动端展开菜单 */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block py-2 text-gray-600 hover:text-love-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  待办清单
                </Link>
                <Link 
                  href="/relationship" 
                  className="block py-2 text-gray-600 hover:text-love-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  伴侣关系
                </Link>
                {partner && (
                  <Link 
                    href="/anniversaries" 
                    className="block py-2 text-gray-600 hover:text-love-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    纪念日
                  </Link>
                )}
                <Link 
                  href="/profile" 
                  className="block py-2 text-gray-600 hover:text-love-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  个人资料
                </Link>
                <Link 
                  href="/settings" 
                  className="block py-2 text-gray-600 hover:text-love-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  设置
                </Link>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-600 hover:text-love-500"
                >
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="block py-2 text-gray-600 hover:text-love-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登录
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block py-2 text-gray-600 hover:text-love-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  注册
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 