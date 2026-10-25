/**
 * NPC 对话历史管理工具
 */

import { storage } from './storage'

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: number
    sceneId?: string
    isRead?: boolean
}

export interface ChatSession {
    npcId: string
    messages: ChatMessage[]
    lastUpdateTime: number
    unreadCount: number
    isUnlocked: boolean
    unlockTime?: number
    sceneId?: string
}

const CHAT_PREFIX = 'npc_chat_'
export const UNLOCK_PREFIX = 'npc_unlock_'

/**
 * 获取用户 ID（简化版本，实际应该从登录信息获取）
 */
export const getUserId = (): string => {
    return storage.get('user_id', 'default_user')
}

/**
 * 获取 NPC 对话会话
 */
export const getChatSession = (npcId: string): ChatSession | null => {
    const userId = getUserId()
    const key = `${CHAT_PREFIX}${userId}_${npcId}`
    return storage.get(key, null)
}

/**
 * 保存 NPC 对话会话
 */
export const saveChatSession = (session: ChatSession): void => {
    const userId = getUserId()
    const key = `${CHAT_PREFIX}${userId}_${session.npcId}`
    storage.set(key, session)
}

/**
 * 添加消息到对话历史
 */
export const addMessage = (
    npcId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
): ChatMessage => {
    const newMessage: ChatMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
    }

    let session = getChatSession(npcId)

    if (!session) {
        session = {
            npcId,
            messages: [],
            lastUpdateTime: Date.now(),
            unreadCount: 0,
            isUnlocked: false
        }
    }

    // 限制消息数量为最近 50 条
    if (session.messages.length >= 50) {
        session.messages = session.messages.slice(1)
    }

    session.messages.push(newMessage)
    session.lastUpdateTime = Date.now()

    // 如果是 NPC 消息，增加未读数
    if (message.role === 'assistant') {
        session.unreadCount += 1
    }

    saveChatSession(session)
    return newMessage
}

/**
 * 获取最近对话摘要（最后一条消息）
 */
export const getLastMessagePreview = (npcId: string): string | null => {
    const session = getChatSession(npcId)
    if (!session || session.messages.length === 0) {
        return null
    }

    const lastMessage = session.messages[session.messages.length - 1]
    return lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
}

/**
 * 标记消息为已读
 */
export const markMessagesAsRead = (npcId: string): void => {
    const session = getChatSession(npcId)
    if (session) {
        session.unreadCount = 0
        session.messages.forEach(msg => {
            msg.isRead = true
        })
        saveChatSession(session)
    }
}

/**
 * 清空对话历史
 */
export const clearChatHistory = (npcId: string): void => {
    const userId = getUserId()
    const key = `${CHAT_PREFIX}${userId}_${npcId}`
    storage.remove(key)
}

/**
 * 获取所有 NPC 对话会话
 */
export const getAllChatSessions = (): ChatSession[] => {
    const userId = getUserId()
    const sessions: ChatSession[] = []

    // 遍历所有可能的 NPC
    const npcIds = ['npc-fairy', 'npc-tea-farmer', 'npc-soldier']
    npcIds.forEach(npcId => {
        const session = getChatSession(npcId)
        if (session) {
            sessions.push(session)
        }
    })

    return sessions
}

/**
 * 收藏对话消息
 */
export interface FavoriteMessage {
    id: string
    npcId: string
    npcName: string
    content: string
    timestamp: number
    sceneId?: string
    favoriteTime: number
}

export const addFavoriteMessage = (
    npcId: string,
    npcName: string,
    messageId: string,
    content: string,
    sceneId?: string
): void => {
    const userId = getUserId()
    const key = `npc_favorites_${userId}`
    const favorites: FavoriteMessage[] = storage.get(key, [])

    const favorite: FavoriteMessage = {
        id: `fav_${Date.now()}`,
        npcId,
        npcName,
        content,
        timestamp: Date.now(),
        sceneId,
        favoriteTime: Date.now()
    }

    favorites.unshift(favorite)
    storage.set(key, favorites)
}

/**
 * 获取收藏的对话
 */
export const getFavoriteMessages = (): FavoriteMessage[] => {
    const userId = getUserId()
    const key = `npc_favorites_${userId}`
    return storage.get(key, [])
}

/**
 * 删除收藏
 */
export const removeFavoriteMessage = (favoriteId: string): void => {
    const userId = getUserId()
    const key = `npc_favorites_${userId}`
    const favorites: FavoriteMessage[] = storage.get(key, [])
    const filtered = favorites.filter(fav => fav.id !== favoriteId)
    storage.set(key, filtered)
}

/**
 * 解锁 NPC
 */
export const unlockNPC = (npcId: string, sceneId?: string): void => {
    const userId = getUserId()
    const key = `${UNLOCK_PREFIX}${userId}_${npcId}`
    storage.set(key, {
        isUnlocked: true,
        unlockTime: Date.now(),
        sceneId,
        lastTriggerTime: Date.now()
    })
}

/**
 * 检查 NPC 是否已解锁
 */
export const isNPCUnlocked = (npcId: string): boolean => {
    const userId = getUserId()
    const key = `${UNLOCK_PREFIX}${userId}_${npcId}`
    const data = storage.get(key, null)
    return data?.isUnlocked || false
}

/**
 * 获取 NPC 解锁信息
 */
export const getNPCUnlockInfo = (npcId: string): {
    isUnlocked: boolean
    unlockTime?: number
    sceneId?: string
    lastTriggerTime?: number
} | null => {
    const userId = getUserId()
    const key = `${UNLOCK_PREFIX}${userId}_${npcId}`
    return storage.get(key, null)
}

/**
 * 检查 24 小时内是否已触发过（已禁用，允许无限次触发）
 */
export const hasTriggeredToday = (npcId: string): boolean => {
    // 禁用 24 小时限制，允许重复触发
    return false
    // 原逻辑保留但不再使用
    // const info = getNPCUnlockInfo(npcId)
    // if (!info || !info.lastTriggerTime) {
    //     return false
    // }
    // const now = Date.now()
    // const hoursSinceTrigger = (now - info.lastTriggerTime) / (1000 * 60 * 60)
    // return hoursSinceTrigger < 24
}

/**
 * 触发 NPC 推送（用于园区打卡 / GPS 到达场景）
 */
export const triggerNPC = (npcId: string, sceneId: string): void => {
    // 解锁 NPC
    unlockNPC(npcId, sceneId)

    // 更新触发时间
    const userId = getUserId()
    const key = `${UNLOCK_PREFIX}${userId}_${npcId}`
    const data = storage.get(key, {})
    data.lastTriggerTime = Date.now()
    storage.set(key, data)
}

/**
 * 检查 NPC 是否已解锁（兼容旧版本）
 */
export const checkNPCUnlocked = (npcId: string): boolean => {
    return isNPCUnlocked(npcId)
}

/**
 * 解锁所有 NPC（测试用）
 */
export const unlockAllNPCs = (): void => {
    const npcIds = ['npc-fairy', 'npc-tea-farmer', 'npc-soldier']
    npcIds.forEach(npcId => {
        unlockNPC(npcId, 'test_mode')
    })
}

/**
 * 重置所有 NPC 解锁状态（测试用）
 */
export const resetAllResearchProgress = (): void => {
    const npcIds = ['npc-fairy', 'npc-tea-farmer', 'npc-soldier']
    const userId = getUserId()
    npcIds.forEach(npcId => {
        const key = `${UNLOCK_PREFIX}${userId}_${npcId}`
        storage.remove(key)
    })
}
