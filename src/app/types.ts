/**
 * 表示待办事项的接口
 */
export interface Todo {
    /** 待办事项的唯一标识符 */
    id: string;
    /** 待办事项的标题 */
    title: string;
    /** 待办事项的详细描述 */
    description?: string;
    /** 标记待办事项是否已完成 */
    completed: boolean;
    /** 待办事项的优先级：低、中、高 */
    priority: 'low' | 'medium' | 'high';
    /** 与伴侣相关的标签 */
    partnerTag?: 'self' | 'partner' | 'both';
    /** 表示爱的类型（如：送礼物、约会、关心等） */
    loveType?: 'gift' | 'date' | 'care' | 'message' | 'other';
    /** 创建日期 */
    createdAt: Date;
    /** 截止日期 */
    dueDate?: Date;
    /** 创建者ID */
    createdById: string;
    /** 关系ID */
    relationshipId?: string;
    /** 是否与伴侣共享 */
    isShared: boolean;
    /** 积分值 */
    points: number;
    /** 审核状态 */
    reviewStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
    /** 审核者ID */
    reviewerId?: string;
    /** 审核时间 */
    reviewedAt?: Date;
    /** 审核评论 */
    reviewComment?: string;
}

/**
 * 积分历史记录
 */
export interface PointHistory {
    /** 唯一标识符 */
    id: string;
    /** 用户ID */
    userId: string;
    /** 关系ID */
    relationshipId: string;
    /** 积分变动 */
    pointsChange: number;
    /** 总积分 */
    totalPoints: number;
    /** 变动原因 */
    reason: string;
    /** 关联的任务ID（如果有） */
    todoId?: string;
    /** 创建时间 */
    createdAt: Date;
}

/**
 * 可兑换礼物
 */
export interface Gift {
    /** 唯一标识符 */
    id: string;
    /** 礼物名称 */
    name: string;
    /** 礼物描述 */
    description: string;
    /** 礼物类型 */
    type: 'flower' | 'pet' | 'ring' | 'other';
    /** 所需积分 */
    requiredPoints: number;
    /** 礼物图片URL */
    imageUrl?: string;
}

/**
 * 已兑换的礼物记录
 */
export interface RedeemedGift {
    /** 唯一标识符 */
    id: string;
    /** 礼物ID */
    giftId: string;
    /** 用户ID */
    userId: string;
    /** 关系ID */
    relationshipId: string;
    /** 兑换时消耗的积分 */
    pointsUsed: number;
    /** 兑换时间 */
    redeemedAt: Date;
    /** 礼物信息 */
    gift: Gift;
    /** 赠送给谁的ID（如果已赠送） */
    sentTo?: string;
    /** 赠送时间 */
    sentAt?: Date;
}