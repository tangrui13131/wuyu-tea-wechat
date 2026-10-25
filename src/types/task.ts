// 任务相关类型定义

export interface Task {
  id: string
  title: string
  description: string
  theme: 'tea' | 'farming' | 'red' // 茶文化 / 农耕体验 / 红色教育
  difficulty: 'easy' | 'medium' | 'hard'
  type: TaskType
  npcId: string // 引导 NPC
  steps: TaskStep[]
  reward: string // 完成奖励
  knowledgeCard: KnowledgeCard // 知识卡片
}

export type TaskType = 
  | 'observation'    // 观察记录型
  | 'question'       // 问答型
  | 'checkin'        // 打卡型
  | 'experience'     // 体验型

export interface TaskStep {
  id: string
  title: string
  description: string
  npcGuidance: string // NPC 引导语
  completionCondition: string // 完成条件
  submitType: 'text' | 'image' | 'both' // 提交方式
}

export interface TaskSubmission {
  taskId: string
  stepId: string
  answer?: string
  images?: string[]
  submitTime: number
  status: 'pending' | 'completed' | 'incorrect'
  npcFeedback?: string
}

export interface KnowledgeCard {
  title: string
  content: string
  source?: string
}

export interface StudyReport {
  id: string
  theme: string
  completionDate: string
  userInfo: {
    nickname: string
    avatar: string
  }
  tasks: TaskCompletion[]
  photos: string[]
  totalScore: number
}

export interface TaskCompletion {
  taskId: string
  taskTitle: string
  submission: TaskSubmission
  knowledgeCard?: KnowledgeCard
}
