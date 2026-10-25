/**
 * 研学任务进度管理工具
 */

import { storage } from './storage'
import { ResearchTheme, ResearchLevel, researchThemes, getResearchThemeById } from '../data/research'

export type TaskStatus = 'locked' | 'not_started' | 'in_progress' | 'completed' | 'skipped'
export type ThemeStatus = 'not_started' | 'in_progress' | 'completed'

export interface TaskSubmission {
    type: 'location' | 'text' | 'answer' | 'image'
    content?: string
    location?: {
        lat: number
        lng: number
    }
    imageUrl?: string
    verified?: boolean
}

export interface TaskProgress {
    levelId: number
    status: TaskStatus
    startedAt?: number
    completedAt?: number
    submission?: TaskSubmission
    npcFeedback?: string
    attempts?: number  // 问答型作答次数
    submissionDraft?: string  // 中断时保存的草稿
}

export interface ThemeProgress {
    themeId: string
    status: ThemeStatus
    startedAt?: number
    completedAt?: number
    levels: TaskProgress[]
}

const RESEARCH_PREFIX = 'research_'

/**
 * 获取用户 ID
 */
const getUserId = (): string => {
    return storage.get('user_id', 'default_user')
}

/**
 * 获取研学进度存储键
 */
const getProgressKey = (): string => {
    const userId = getUserId()
    return `${RESEARCH_PREFIX}${userId}`
}

/**
 * 获取所有研学主题进度
 */
export const getAllThemeProgress = (): ThemeProgress[] => {
    const key = getProgressKey()
    return storage.get(key, [])
}

/**
 * 获取单个主题进度
 */
export const getThemeProgress = (themeId: string): ThemeProgress | null => {
    const progresses = getAllThemeProgress()
    return progresses.find(p => p.themeId === themeId) || null
}

/**
 * 初始化主题进度
 */
export const initThemeProgress = (theme: ResearchTheme): ThemeProgress => {
    const levels: TaskProgress[] = theme.levels.map((level, index) => ({
        levelId: level.levelId,
        status: index === 0 ? 'not_started' : 'locked'
    }))

    const progress: ThemeProgress = {
        themeId: theme.id,
        status: 'not_started',
        levels
    }

    return progress
}

/**
 * 保存主题进度
 */
export const saveThemeProgress = (progress: ThemeProgress): void => {
    const progresses = getAllThemeProgress()
    const index = progresses.findIndex(p => p.themeId === progress.themeId)

    if (index >= 0) {
        progresses[index] = progress
    } else {
        progresses.push(progress)
    }

    storage.set(getProgressKey(), progresses)
}

/**
 * 开始主题
 */
export const startTheme = (theme: ResearchTheme): ThemeProgress => {
    let progress = getThemeProgress(theme.id)

    if (!progress) {
        progress = initThemeProgress(theme)
    }

    if (progress.status === 'not_started') {
        progress.status = 'in_progress'
        progress.startedAt = Date.now()
        saveThemeProgress(progress)
    }

    return progress
}

/**
 * 开始关卡
 */
export const startLevel = (themeId: string, levelId: number): TaskProgress | null => {
    const progress = getThemeProgress(themeId)
    if (!progress) return null

    const taskProgress = progress.levels.find(l => l.levelId === levelId)
    if (!taskProgress) return null

    // 检查前一关是否完成
    const currentIndex = progress.levels.findIndex(l => l.levelId === levelId)
    if (currentIndex > 0) {
        const prevLevel = progress.levels[currentIndex - 1]
        if (prevLevel.status !== 'completed' && prevLevel.status !== 'skipped') {
            return null  // 前一关未完成，不能开始
        }
    }

    if (taskProgress.status === 'not_started' || taskProgress.status === 'locked') {
        taskProgress.status = 'in_progress'
        taskProgress.startedAt = Date.now()
        saveThemeProgress(progress)
    }

    return taskProgress
}

/**
 * 提交关卡任务
 */
export const completeLevel = (
    themeId: string,
    levelId: number,
    submission: TaskSubmission,
    npcFeedback: string
): void => {
    const progress = getThemeProgress(themeId)
    if (!progress) return

    const taskProgress = progress.levels.find(l => l.levelId === levelId)
    if (!taskProgress) return

    taskProgress.status = 'completed'
    taskProgress.completedAt = Date.now()
    taskProgress.submission = submission
    taskProgress.npcFeedback = npcFeedback

    // 解锁下一关
    const currentIndex = progress.levels.findIndex(l => l.levelId === levelId)
    if (currentIndex < progress.levels.length - 1) {
        const nextLevel = progress.levels[currentIndex + 1]
        nextLevel.status = 'not_started'
    }

    // 检查是否全部完成
    const allCompleted = progress.levels.every(l =>
        l.status === 'completed' || l.status === 'skipped'
    )

    if (allCompleted) {
        progress.status = 'completed'
        progress.completedAt = Date.now()
    } else {
        progress.status = 'in_progress'
    }

    saveThemeProgress(progress)
}

/**
 * 跳过关卡
 */
export const skipLevel = (themeId: string, levelId: number): void => {
    const progress = getThemeProgress(themeId)
    if (!progress) return

    const taskProgress = progress.levels.find(l => l.levelId === levelId)
    if (!taskProgress) return

    taskProgress.status = 'skipped'
    taskProgress.completedAt = Date.now()

    // 解锁下一关
    const currentIndex = progress.levels.findIndex(l => l.levelId === levelId)
    if (currentIndex < progress.levels.length - 1) {
        const nextLevel = progress.levels[currentIndex + 1]
        nextLevel.status = 'not_started'
    }

    saveThemeProgress(progress)
}

/**
 * 保存关卡草稿
 */
export const saveLevelDraft = (themeId: string, levelId: number, draft: string): void => {
    const progress = getThemeProgress(themeId)
    if (!progress) return

    const taskProgress = progress.levels.find(l => l.levelId === levelId)
    if (!taskProgress) return

    taskProgress.submissionDraft = draft
    saveThemeProgress(progress)
}

/**
 * 获取关卡进度
 */
export const getLevelProgress = (themeId: string, levelId: number): TaskProgress | null => {
    const progress = getThemeProgress(themeId)
    if (!progress) return null
    return progress.levels.find(l => l.levelId === levelId) || null
}

/**
 * 计算主题完成进度
 */
export const calculateThemeProgress = (themeId: string): {
    completed: number
    total: number
    percentage: number
} => {
    const progress = getThemeProgress(themeId)
    if (!progress) {
        return { completed: 0, total: 4, percentage: 0 }
    }

    const completed = progress.levels.filter(
        l => l.status === 'completed' || l.status === 'skipped'
    ).length
    const total = progress.levels.length
    const percentage = Math.round((completed / total) * 100)

    return { completed, total, percentage }
}

/**
 * 重置主题进度（用于测试）
 */
export const resetThemeProgress = (themeId: string): void => {
    const progresses = getAllThemeProgress()
    const index = progresses.findIndex(p => p.themeId === themeId)

    if (index >= 0) {
        progresses.splice(index, 1)
        storage.set(getProgressKey(), progresses)
    }
}

/**
 * 重置所有研学进度（用于测试）
 */
export const resetAllResearchProgress = (): void => {
    storage.remove(getProgressKey())
}

/**
 * 根据 NPC ID 找到其绑定的研学主题（主题与 NPC 是一对一绑定的）
 */
export const getResearchThemeByNpcId = (npcId: string): ResearchTheme | null => {
    return researchThemes.find(t => t.npcId === npcId) || null
}

/**
 * 获取研学主题的下一个未完成关卡（用于驱动 NPC 提示"下一步"）
 * 返回 null 表示所有关卡已完成
 */
export const getNextResearchLevel = (themeId: string): ResearchLevel | null => {
    const theme = getResearchThemeById(themeId)
    if (!theme) return null

    const progress = getThemeProgress(themeId)
    if (!progress) return theme.levels[0] || null

    for (const level of theme.levels) {
        const lp = progress.levels.find(l => l.levelId === level.levelId)
        if (lp && lp.status !== 'completed' && lp.status !== 'skipped') {
            return level
        }
    }
    return null
}

/**
 * 按 NPC 汇总研学进度，供 NPC 对话页驱动"当前任务/下一步"阶段条
 * 返回 null 表示该 NPC 没有绑定的研学主题
 */
export const getResearchStateForNpc = (npcId: string): {
    themeId: string
    themeName: string
    npcName: string
    total: number
    completed: number
    nextLevel: ResearchLevel | null
    allCompleted: boolean
} | null => {
    const theme = getResearchThemeByNpcId(npcId)
    if (!theme) return null

    const progress = getThemeProgress(theme.id)
    const completed = progress
        ? progress.levels.filter(l => l.status === 'completed' || l.status === 'skipped').length
        : 0

    return {
        themeId: theme.id,
        themeName: theme.name,
        npcName: theme.npcName,
        total: theme.levels.length,
        completed,
        nextLevel: getNextResearchLevel(theme.id),
        allCompleted: completed >= theme.levels.length
    }
}
