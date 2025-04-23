import { ReactNode } from 'react';

/**
 * 设置页面布局组件
 * @param param0 包含子组件的参数对象
 * @returns 布局组件
 */
export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

export const metadata = {
  title: '设置 | 恋爱清单',
  description: '管理您的应用设置和偏好',
}; 