// 路线相关类型定义

export interface Route {
    id: string
    name: string
    description: string
    coverImage: string // 兼容旧字段，优先使用 coverGradient
    coverGradient?: [string, string] // 封面渐变（离线可用，替代外部图片）
    coverEmoji?: string // 封面主题图标
    estimatedDuration: string // 预计时长
    difficulty: 'easy' | 'medium' | 'hard' // 难度
    tags: string[] // 适用标签
    nodes: RouteNode[]
    matchRules: MatchRule // 匹配规则
}

export interface RouteNode {
    id: string
    name: string
    description: string
    estimatedStay: string // 预计停留时间
    location: {
        latitude: number
        longitude: number
    }
    relatedNPC?: string // 关联的 NPC ID
    image?: string
}

export interface MatchRule {
    travelType: string[] // 出行类型
    duration: string[] // 停留时长
    interests: string[] // 兴趣偏好
}

export interface UserPreferences {
    travelType: string[] // 家庭 / 研学 / 团建 / 个人
    duration: string // 半天 / 一天
    interests: string[] // 茶文化 / 红色教育 / 农耕体验 / 休闲观光
}
