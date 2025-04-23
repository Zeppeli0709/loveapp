/**
 * 纪念日类型
 */
export interface Anniversary {
  /** 纪念日ID */
  id: string;
  /** 关系ID */
  relationshipId: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 日期 */
  date: Date;
  /** 是否每年重复 */
  isYearly: boolean;
  /** 提醒天数 */
  reminderDays?: number;
} 