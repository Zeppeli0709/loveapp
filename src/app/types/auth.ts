/**
 * 用户信息接口
 */
export interface User {
  /** 用户唯一标识符 */
  id: string;
  /** 用户名 */
  username: string;
  /** 电子邮箱 */
  email: string;
  /** 显示名称 */
  displayName: string;
  /** 头像URL */
  avatar?: string;
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 关系状态枚举
 */
export type RelationshipStatus = 'pending' | 'accepted' | 'rejected';

/**
 * 关系请求接口
 */
export interface RelationshipRequest {
  /** 请求ID */
  id: string;
  /** 发送请求的用户ID */
  senderId: string;
  /** 接收请求的用户ID */
  receiverId: string;
  /** 请求消息 */
  message?: string;
  /** 请求状态 */
  status: RelationshipStatus;
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 恋人关系接口
 */
export interface Relationship {
  /** 关系ID */
  id: string;
  /** 用户1的ID */
  user1Id: string;
  /** 用户2的ID */
  user2Id: string;
  /** 关系开始日期 */
  startDate: Date;
  /** 纪念日日期列表 */
  anniversaries?: {date: Date, description: string}[];
} 