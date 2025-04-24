'use client';

import './globals.css';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { Geist as GeistSans, Geist_Mono } from 'next/font/google';
import { useState, useEffect } from 'react';

const geistSans = GeistSans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

/**
 * 根布局组件
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 状态用于跟踪深色模式
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState('loveTheme');

  // 在客户端检查用户深色模式设置
  useEffect(() => {
    // 从本地存储中检查所有用户的深色模式设置
    const checkDarkMode = () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const settings = localStorage.getItem(`settings_${user.id}`);
          
          if (settings) {
            const parsedSettings = JSON.parse(settings);
            setDarkMode(parsedSettings.darkMode || false);
            setTheme(parsedSettings.darkMode ? 'loveDarkTheme' : 'loveTheme');
          }
        }
      } catch (error) {
        console.error('检查深色模式设置时出错:', error);
      }
    };
    
    checkDarkMode();
    
    // 监听存储变化以更新主题
    const handleStorageChange = () => {
      checkDarkMode();
    };
    
    // 监听自定义主题变化事件
    const handleThemeChange = (event: CustomEvent) => {
      const { darkMode: newDarkMode } = event.detail;
      setDarkMode(newDarkMode);
      setTheme(newDarkMode ? 'loveDarkTheme' : 'loveTheme');
    };
    
    // 监听自定义语言变化事件
    const handleLanguageChange = (event: CustomEvent) => {
      const { language } = event.detail;
      document.documentElement.lang = language;
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    window.addEventListener('languageChange', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  return (
    <html lang="zh-CN" data-theme={theme} className={darkMode ? 'dark' : ''}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
