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
}