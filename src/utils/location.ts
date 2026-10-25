/**
 * 位置服务工具
 * 用于景点定位触发、距离计算等
 */

import Taro from '@tarojs/taro'
import { storage } from './storage'

export interface SceneLocation {
    id: string
    name: string
    latitude: number
    longitude: number
    triggerRadius: number // 触发半径（米）
    npcId: string
    sceneName: string
}

// 景点配置（湖北孝感安陆槎山景区真实坐标）
export const SCENE_LOCATIONS: SceneLocation[] = [
    {
        id: 'scene-tea-garden',
        name: '茶园观光区',
        latitude: 31.2892,
        longitude: 113.7528,
        triggerRadius: 50,
        npcId: 'npc-fairy',
        sceneName: '茶园观光区'
    },
    {
        id: 'scene-shuangquan-temple',
        name: '双泉寺',
        latitude: 31.2875,
        longitude: 113.7545,
        triggerRadius: 50,
        npcId: 'npc-tea-farmer',
        sceneName: '双泉寺'
    },
    {
        id: 'scene-red-memorial',
        name: '红色纪念点',
        latitude: 31.2905,
        longitude: 113.7510,
        triggerRadius: 50,
        npcId: 'npc-soldier',
        sceneName: '红色纪念点'
    },
    {
        id: 'scene-tea-basket',
        name: '茶筐展示区',
        latitude: 31.2888,
        longitude: 113.7535,
        triggerRadius: 50,
        npcId: 'npc-soldier',
        sceneName: '茶筐展示区'
    },
    {
        id: 'scene-tea-workshop',
        name: '制茶工坊',
        latitude: 31.2880,
        longitude: 113.7540,
        triggerRadius: 50,
        npcId: 'npc-tea-farmer',
        sceneName: '制茶工坊'
    },
    {
        id: 'scene-white-tea-tree',
        name: '白茶树景观区',
        latitude: 31.2898,
        longitude: 113.7520,
        triggerRadius: 50,
        npcId: 'npc-fairy',
        sceneName: '白茶树景观区'
    }
]

export interface LocationPermission {
    granted: boolean
    accuracy: 'high' | 'medium' | 'low' | 'unknown'
}

/**
 * 计算两点之间的距离（Haversine 公式）
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371000 // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

/**
 * 检查位置权限
 */
export const checkLocationPermission = async (): Promise<LocationPermission> => {
    try {
        // 检查是否已授权
        const setting = await Taro.getSetting({
            success: (res) => res.authSetting['scope.userLocation']
        })

        if (!setting) {
            return { granted: false, accuracy: 'unknown' }
        }

        // 获取当前位置测试精度
        const location = await Taro.getLocation({
            type: 'wgs84',
            isHighAccuracy: true
        })

        // 根据精度返回等级
        const accuracy = location.accuracy || 0
        if (accuracy <= 20) {
            return { granted: true, accuracy: 'high' }
        } else if (accuracy <= 50) {
            return { granted: true, accuracy: 'medium' }
        } else {
            return { granted: true, accuracy: 'low' }
        }
    } catch (error) {
        console.error('[Location] 检查权限失败:', error)
        return { granted: false, accuracy: 'unknown' }
    }
}

/**
 * 请求位置权限
 */
export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        await Taro.authorize({
            scope: 'scope.userLocation'
        })
        return true
    } catch (error) {
        console.error('[Location] 请求权限失败:', error)

        // 用户拒绝，引导去设置页
        Taro.showModal({
            title: '定位权限',
            content: '需要开启定位权限才能在景点解锁 NPC 对话哦~',
            confirmText: '去设置',
            cancelText: '暂不开启',
            success: (res) => {
                if (res.confirm) {
                    Taro.openSetting({
                        success: (settingRes) => {
                            if (settingRes.authSetting['scope.userLocation']) {
                                console.log('[Location] 用户已授权')
                            }
                        }
                    })
                }
            }
        })

        return false
    }
}

/**
 * 开始监听位置变化
 */
export const startLocationMonitoring = (
    onLocationChange: (latitude: number, longitude: number) => void
): void => {
    // 请求后台定位权限
    Taro.authorize({
        scope: 'scope.userLocationBackground'
    }).catch(() => {
        console.log('[Location] 后台定位权限未授权')
    })

    // 开始监听
    Taro.onLocationChange((res) => {
        console.log('[Location] 位置更新:', res.latitude, res.longitude, '精度:', res.accuracy)
        onLocationChange(res.latitude, res.longitude)
    })
}

/**
 * 停止监听位置变化
 */
export const stopLocationMonitoring = (): void => {
    Taro.offLocationChange()
}

/**
 * 检查是否进入景点范围
 */
export const checkSceneTrigger = (
    latitude: number,
    longitude: number
): SceneLocation | null => {
    for (const scene of SCENE_LOCATIONS) {
        const distance = calculateDistance(
            latitude,
            longitude,
            scene.latitude,
            scene.longitude
        )

        if (distance <= scene.triggerRadius) {
            return scene
        }
    }

    return null
}

/**
 * 检查 24 小时内是否已触发过
 */
export const hasTriggeredToday = (npcId: string): boolean => {
    const key = `npc_trigger_${npcId}`
    const lastTriggerTime = storage.get<number>(key, 0)

    if (lastTriggerTime === 0) {
        return false
    }

    const now = Date.now()
    const hoursSinceTrigger = (now - lastTriggerTime) / (1000 * 60 * 60)

    return hoursSinceTrigger < 24
}

/**
 * 记录触发时间
 */
export const recordTriggerTime = (npcId: string): void => {
    const key = `npc_trigger_${npcId}`
    storage.set(key, Date.now())
}

/**
 * 生成扫码 URL
 */
export const generateSceneQRCode = (npcId: string, sceneId: string): string => {
    return `chashan://npc/${npcId}?scene=${sceneId}`
}

/**
 * 解析扫码 URL
 */
export const parseSceneQRCode = (url: string): { npcId: string; sceneId: string } | null => {
    try {
        if (!url.startsWith('chashan://npc/')) {
            return null
        }

        const parts = url.replace('chashan://npc/', '').split('?scene=')
        if (parts.length !== 2) {
            return null
        }

        return {
            npcId: parts[0],
            sceneId: parts[1]
        }
    } catch (error) {
        console.error('[Location] 解析二维码失败:', error)
        return null
    }
}

/**
 * 解析溯源二维码：chashan://trace/{traceId}
 * @returns traceId 或 null
 */
export const parseTraceQRCode = (url: string): string | null => {
    const m = url.match(/^chashan:\/\/trace\/(.+)$/)
    return m ? m[1] : null
}

/**
 * 调起微信扫一扫，返回扫码结果（用户取消则返回 null）
 */
export const startScan = (): Promise<string | null> =>
    new Promise((resolve) => {
        Taro.scanCode({
            success: (res) => resolve(res.result || null),
            fail: () => resolve(null)
        })
    })

/**
 * 处理扫码触发（统一路由：溯源码 / NPC 码 / 无效码）
 * - chashan://trace/{id}  → 跳转溯源页
 * - chashan://npc/{id}?scene= → 解锁并跳转 NPC 对话
 * - 其他                   → 友好提示
 * @param onTriggerNPC 仅在 NPC 码时回调（页面可自定义跳转逻辑）；不传则走默认跳转
 */
export const handleQRCodeScan = async (
    scanResult: string,
    onTriggerNPC?: (npcId: string, sceneId: string) => void
): Promise<void> => {
    // 溯源码优先识别
    const traceId = parseTraceQRCode(scanResult)
    if (traceId) {
        Taro.navigateTo({ url: `/pages/trace/index?traceId=${encodeURIComponent(traceId)}` })
        return
    }

    const parsed = parseSceneQRCode(scanResult)

    if (!parsed) {
        Taro.showToast({
            title: '无法识别的二维码',
            icon: 'none'
        })
        return
    }

    // 未传入回调时，默认跳转 NPC 对话页（npc-chat 读 router.params.id）
    const fire = (npcId: string, sceneId: string) => {
        if (onTriggerNPC) {
            onTriggerNPC(npcId, sceneId)
        } else {
            Taro.navigateTo({ url: `/pages/npc-chat/index?id=${npcId}&sceneId=${encodeURIComponent(sceneId)}` })
        }
    }

    // 检查是否已解锁
    const { isNPCUnlocked } = await import('./chat')
    if (isNPCUnlocked(parsed.npcId)) {
        Taro.showModal({
            title: '提示',
            content: '你已经解锁过这个 NPC 了，确定要再次进入吗？',
            success: (res) => {
                if (res.confirm) {
                    fire(parsed.npcId, parsed.sceneId)
                }
            }
        })
    } else {
        // 直接解锁并进入
        fire(parsed.npcId, parsed.sceneId)
    }
}

/**
 * 获取当前位置的精度提示
 */
export const getAccuracyTip = (accuracy: 'high' | 'medium' | 'low' | 'unknown'): string => {
    switch (accuracy) {
        case 'high':
            return '定位精确'
        case 'medium':
            return '定位较准确'
        case 'low':
            return '定位可能不太准，试试扫描景点二维码？'
        case 'unknown':
            return '定位不可用，请开启定位权限'
        default:
            return ''
    }
}
