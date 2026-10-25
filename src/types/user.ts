// 用户相关类型定义

export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  visitCount: number
  lastVisitTime: number
  preferences?: UserPreferences // 用户偏好标签
  completedTasks: string[] // 已完成任务 ID 列表
  studyReports: StudyReport[] // 研学报告
}

export interface UserBehavior {
  userId: string
  action: string
  timestamp: number
  page?: string
  extra?: Record<string, any>
}

// 运营数据看板类型
export interface DashboardData {
  userProfiles: {
    travelTypeDistribution: Record<string, number>
    interestDistribution: Record<string, number>
  }
  heatMap: {
    areaStayDuration: Record<string, number>
    conversionRate: Record<string, number>
  }
  studyCompletion: {
    themeCompletionRate: Record<string, number>
    averageCompletionTime: Record<string, number>
  }
  dateRange: {
    start: string
    end: string
  }
}
