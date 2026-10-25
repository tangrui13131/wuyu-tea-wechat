import React, { useState, useEffect } from 'react'
import Taro, { navigateTo } from '@tarojs/taro'
import { View, Text, Button, Image } from '@tarojs/components'
import Icon from '@/components/Icon'
import NPCCard from '../../components/NPCCard'
import { IMG } from '@/assets/images'
import { npcs } from '../../data/npcs'
import {
    isNPCUnlocked,
    unlockNPC,
    triggerNPC,
    getUserId,
    UNLOCK_PREFIX
} from '../../utils/chat'
import { checkSceneTrigger, handleQRCodeScan, startScan } from '../../utils/location'
import { storage } from '../../utils/storage'
import './index.scss'

// 园区景点坐标（GPS 到达触发，当前版本支持手动选择位置打卡）
const PARK_SPOTS = [
    { name: '茶筐展示区', latitude: 31.2888, longitude: 113.7535 },
    { name: '制茶工坊', latitude: 31.2880, longitude: 113.7540 },
    { name: '白茶树景观区', latitude: 31.2898, longitude: 113.7520 }
]

export default function NPC() {
    const [npcList, setNpcList] = useState<any[]>(npcs)

    useEffect(() => {
        updateNpcList()
    }, [])

    const updateNpcList = () => {
        const updatedList = npcs.map(npc => ({
            ...npc,
            unlocked: isNPCUnlocked(npc.id)
        }))
        setNpcList(updatedList)
    }

    // 重置解锁状态（换游客演示用）
    const resetAllUnlockStatus = () => {
        Taro.showModal({
            title: '换一位游客',
            content: '确定要重置所有 NPC 的解锁状态吗？',
            success: (res) => {
                if (res.confirm) {
                    const npcIds = ['npc-fairy', 'npc-tea-farmer', 'npc-soldier']
                    npcIds.forEach(npcId => {
                        const userId = getUserId()
                        const key = `${UNLOCK_PREFIX}${userId}_${npcId}`
                        storage.remove(key)
                    })
                    Taro.showToast({
                        title: '已重置',
                        icon: 'success'
                    })
                    updateNpcList()
                }
            }
        })
    }

    // 到达景点：触发对应 NPC 解锁 + 主动搭话（GPS 接入后由定位自动调用）
    const arriveSpot = (lat: number, lng: number) => {
        const scene = checkSceneTrigger(lat, lng)
        if (scene) {
            unlockNPC(scene.npcId, scene.sceneName)
            triggerNPC(scene.npcId, scene.sceneName)

            Taro.showModal({
                title: scene.npcId === 'npc-fairy' ? '白叶仙姑' : scene.npcId === 'npc-tea-farmer' ? '双泉老茶农' : '红军交通员',
                content: scene.npcId === 'npc-fairy' ? '这片茶园在等你，五百年前的故事想讲给你听~' :
                    scene.npcId === 'npc-tea-farmer' ? '来啦？正泡着茶呢，坐下来聊聊制茶的手艺吧！' :
                        '同志，有段历史需要你来了解，跟我来。',
                showCancel: true,
                cancelText: '稍后再说',
                confirmText: '开始对话',
                success: (res) => {
                    if (res.confirm) {
                        updateNpcList()
                        setTimeout(() => {
                            navigateTo({
                                url: `/pages/npc-chat/index?id=${scene.npcId}`
                            })
                        }, 300)
                    } else {
                        updateNpcList()
                    }
                }
            })
        } else {
            Taro.showToast({
                title: '未匹配到景点',
                icon: 'none'
            })
        }
    }

    // 演示模式：一键解锁全部 NPC（GPS 未接时的体验入口）
    const unlockAllForDemo = () => {
        Taro.showModal({
            title: '体验模式',
            content: '一键解锁全部 NPC，方便体验对话流程。',
            success: (res) => {
                if (res.confirm) {
                    npcs.forEach(npc => unlockNPC(npc.id, 'demo-unlock'))
                    Taro.showToast({ title: '全部解锁', icon: 'success' })
                    updateNpcList()
                }
            }
        })
    }

    /** 调起微信扫一扫，按二维码类型统一路由（溯源码 / NPC 触发码） */
    const handleScan = async () => {
        const r = await startScan()
        if (r) await handleQRCodeScan(r)
    }

    const handleNPCClick = (npc: any) => {
        const isUnlocked = isNPCUnlocked(npc.id)
        if (isUnlocked) {
            navigateTo({
                url: `/pages/npc-chat/index?id=${npc.id}`
            })
        } else {
            Taro.showToast({
                title: `前往 ${npc.triggerScenes?.[0] || '对应景点'} 解锁`,
                icon: 'none'
            })
        }
    }

    return (
        <View className='npc-page'>
            {/* 顶部提示 */}
            <View className='npc-header'>
                {/* 实拍底图（同源照片的另一个裁切：近景逆光叶），铺满后用 scrim 压住 */}
                <Image className='npc-hero-bg' src={IMG.hero.rows} mode='aspectFill' />
                <View className='npc-hero-scrim' />
                <View className='npc-header-inner'>
                    <View className='npc-header-top'>
                        <View className='npc-header-left'>
                            <Text className='npc-title'>NPC 互动</Text>
                            <Text className='npc-subtitle'>
                                走到对应景点，NPC 会主动找你聊天
                            </Text>
                            <View className='npc-scan-btn' onClick={handleScan}>
                                <Icon className='npc-scan-icon' name='search' size={28} color='ink' />
                                <Text className='npc-scan-text'>扫码验真</Text>
                            </View>
                        </View>
                        {npcList.length > 0 && npcList.every(n => !n.unlocked) && (
                            <Button className='demo-unlock-btn' onClick={unlockAllForDemo}>
                                体验：一键解锁
                            </Button>
                        )}
                    </View>
                </View>
            </View>

            {/* 园区打卡：GPS 到达触发（当前版本手动选择位置） */}
            <View className='checkin-panel'>
                <View className='checkin-header'>
                    <Text className='checkin-title'>园区打卡</Text>
                </View>
                <View className='checkin-locations'>
                    <Text className='checkin-locations-title'>我到达了：</Text>
                    {PARK_SPOTS.map((location, index) => (
                        <Button
                            key={index}
                            className='checkin-location-btn'
                            onClick={() => arriveSpot(location.latitude, location.longitude)}
                        >
                            {location.name}
                        </Button>
                    ))}
                    <Button
                        className='checkin-reset-btn'
                        onClick={resetAllUnlockStatus}
                    >
                        换一位游客（重置）
                    </Button>
                </View>
            </View>

            {/* NPC 列表 */}
            <View className='npc-list'>
                {npcList.length > 0 ? (
                    npcList.map((npc, index) => (
                        <NPCCard
                            key={index}
                            npc={npc}
                            isUnlocked={npc.unlocked}
                            onClick={() => handleNPCClick(npc)}
                        />
                    ))
                ) : (
                    <View className='empty-list'>
                        <Text>加载中...</Text>
                    </View>
                )}
            </View>
        </View>
    )
}
