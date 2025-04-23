import { ReactNode } from 'react';

/**
 * 个人资料页面布局组件
 * @param param0 包含子组件的参数对象
 * @returns 布局组件
 */
export default function ProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

export const metadata = {
  title: '个人资料 | 恋爱清单',
  description: '查看和编辑您的个人资料信息',
}; 