// NPC 相关类型定义

export interface NPC {
  id: string
  name: string
  title: string // 称号
  description: string
  avatar: string // 头像方图（1:1）
  portrait?: string // 立绘（3:4），列表卡片/对话页装饰用，可选
  emoji: string // 头像替代图标（避免外部随机图，离线可用）
  gradient: [string, string] // 头像/主题渐变色
  character: string // 性格设定
  triggerScenes: string[] // 触发场景
  knowledgeDomain: string[] // 知识领域
  culturalSource: string // 文化来源
  greeting: string // 开场白
  systemPrompt: string // AI 对话系统提示词
}

export interface NPCChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface NPCChatSession {
  npcId: string
  messages: NPCChatMessage[]
  lastUpdateTime: number
}
