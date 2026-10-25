/**
 * 景点打卡工具
 * 记录用户在槎山各景点的打卡（到达/解锁 NPC 即视为打卡成功），
 * 用于「我的打卡」画廊、研学成果与排行榜统计。数据存于本地，离线可用。
 */

import { storage } from './storage'
import { SCENE_LOCATIONS } from './location'
import { getNPCById } from '@/data/npcs'

export interface CheckinRecord {
    sceneId: string
    sceneName: string
    npcId: string
    npcName: string
    time: number // 打卡时间戳
    note?: string
}

const CHECKIN_KEY = 'checkin_records'
const CHECKIN_SET_KEY = 'checkin_scene_set' // 已打卡景点 id 集合，便于 O(1) 判重

const getRecords = (): CheckinRecord[] => storage.get<CheckinRecord[]>(CHECKIN_KEY, [])

const getSet = (): string[] => storage.get<string[]>(CHECKIN_SET_KEY, [])

/**
 * 是否已打卡某景点
 */
export const hasCheckedIn = (sceneId: string): boolean => getSet().includes(sceneId)

/**
 * 已打卡景点数量
 */
export const getCheckinCount = (): number => getSet().length

/**
 * 全部打卡记录（按时间倒序）
 */
export const getCheckins = (): CheckinRecord[] =>
    [...getRecords()].sort((a, b) => b.time - a.time)

/**
 * 是否已集齐全部真实景点打卡
 */
export const isAllCheckedIn = (): boolean => {
    const sceneIds = SCENE_LOCATIONS.map(s => s.id)
    const set = new Set(getSet())
    return sceneIds.every(id => set.has(id))
}

/**
 * 写入一条打卡记录（同一景点重复打卡只更新最近时间，不重复计数）
 */
export const addCheckin = (sceneId: string): CheckinRecord | null => {
    const scene = SCENE_LOCATIONS.find(s => s.id === sceneId)
    if (!scene) return null
    const npc = getNPCById(scene.npcId)
    const record: CheckinRecord = {
        sceneId: scene.id,
        sceneName: scene.sceneName || scene.name,
        npcId: scene.npcId,
        npcName: npc?.name || '景点讲解员',
        time: Date.now()
    }

    const records = getRecords()
    const existingIdx = records.findIndex(r => r.sceneId === sceneId)
    if (existingIdx >= 0) {
        records[existingIdx] = record // 更新最近打卡时间
    } else {
        records.push(record)
    }
    storage.set(CHECKIN_KEY, records)

    const set = getSet()
    if (!set.includes(sceneId)) {
        set.push(sceneId)
        storage.set(CHECKIN_SET_KEY, set)
    }
    return record
}

/**
 * 格式化打卡时间为「2026-09-10 14:30」
 */
export const formatCheckinTime = (ts: number): string => {
    const d = new Date(ts)
    const pad = (n: number) => `${n}`.padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 重置全部打卡（测试/演示用）
 */
export const resetCheckins = (): void => {
    storage.remove(CHECKIN_KEY)
    storage.remove(CHECKIN_SET_KEY)
}
