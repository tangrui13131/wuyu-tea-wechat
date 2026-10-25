import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { View, Text, Map as MapView, ScrollView } from '@tarojs/components'
import Icon from '@/components/Icon'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { getSceneFullList, getParkCenter, type SceneFull } from '@/data/scenes'
import { haptic } from '@/utils/feedback'
import { routes } from '@/data/routes'
import { calculateDistance } from '@/utils/location'
import { getNPCById } from '@/data/npcs'
import { unlockNPC, isNPCUnlocked } from '@/utils/chat'
import { track } from '@/services'
import { isTTSAvailable, speak, stopSpeak, buildSceneSpeech } from '@/utils/tts'
import { addCheckin, hasCheckedIn, getCheckinCount, formatCheckinTime, type CheckinRecord } from '@/utils/checkin'
import { handleQRCodeScan, startScan } from '@/utils/location'

type ViewMode = 'map' | 'list'

/** 距离格式化：1000 米内按米显示，超出按公里 */
const formatDistance = (meters: number): string => {
    if (!isFinite(meters)) return '—'
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
}

const RouteDetailPage: React.FC = () => {
    const scenes = useMemo(() => getSceneFullList(), [])
    const center = useMemo(() => getParkCenter(), [])

    const [mode, setMode] = useState<ViewMode>('map')
    const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [locationTip, setLocationTip] = useState('正在获取定位...')
    const [selectedId, setSelectedId] = useState<string>(scenes[0]?.id || '')
    const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>({})

    /** 从路线卡片「开始游览」进入时携带的路线上下文 */
    const routerParams = Taro.useRouter()?.params || {}
    const [routeId, setRouteId] = useState<string>(routerParams.routeId || '')
    const activeRoute = useMemo(
        () => (routeId ? routes.find(r => r.id === routeId) || null : null),
        [routeId]
    )
    /** 路线站点名 → 第几站。
     *  节点名可能带主题后缀（如「茶园观光区·采茶」），匹配景点时取「·」前的主名。 */
    const routeStopMap = useMemo(() => {
        const map: Record<string, number> = {}
        if (!activeRoute) return map
        activeRoute.nodes.forEach((node, index) => {
            const base = node.name.split('·')[0].trim()
            if (base && !map[base]) map[base] = index + 1
        })
        return map
    }, [activeRoute])

    /**
     * 展示用景点列表：游览模式下只显示该路线覆盖的景点、并严格按路线顺序排列，
     * 避免「点开研学路线却看到不相关景点」的割裂感；普通园区导览仍展示全部景点。
     * 兜底：路线节点全部匹配失败时退回全部景点，避免页面空白。
     */
    const displayScenes = useMemo(() => {
        if (!activeRoute) return scenes
        const byName = new Map(scenes.map(s => [s.name, s]))
        const stops: typeof scenes = []
        activeRoute.nodes.forEach(node => {
            const base = node.name.split('·')[0].trim()
            const scene = byName.get(base)
            if (scene && !stops.some(s => s.id === scene.id)) stops.push(scene)
        })
        return stops.length ? stops : scenes
    }, [activeRoute, scenes])

    /** 进入游览模式时默认选中第一站 */
    useEffect(() => {
        if (activeRoute && displayScenes.length) {
            setSelectedId(displayScenes[0].id)
        }
    }, [activeRoute, displayScenes])
    /** 语音插件是否可用：不可用时隐藏语音入口而非报错 */
    const [ttsAvailable] = useState<boolean>(() => isTTSAvailable())
    const [speakingId, setSpeakingId] = useState<string | null>(null)
    /** 打卡成功浮层 */
    const [checkinRecord, setCheckinRecord] = useState<CheckinRecord | null>(null)
    const [checkinCount, setCheckinCount] = useState<number>(() => getCheckinCount())

    const selected = useMemo(
        () => displayScenes.find(s => s.id === selectedId) || displayScenes[0],
        [displayScenes, selectedId]
    )

    /** 各景点与当前位置的距离（未定位时为空对象） */
    const distanceMap = useMemo(() => {
        const map: Record<string, number> = {}
        if (!myLocation) return map
        displayScenes.forEach(s => {
            map[s.id] = calculateDistance(
                myLocation.latitude, myLocation.longitude,
                s.latitude, s.longitude
            )
        })
        return map
    }, [displayScenes, myLocation])

    /**
     * 列表排序：游览模式严格按路线站点顺序（第1站→第N站）；
     * 普通导览按距离升序（未定位时保持原始顺序）。
     */
    const sortedScenes = useMemo(() => {
        if (activeRoute) return displayScenes
        if (!myLocation) return displayScenes
        return [...displayScenes].sort(
            (a, b) => (distanceMap[a.id] ?? Infinity) - (distanceMap[b.id] ?? Infinity)
        )
    }, [activeRoute, displayScenes, myLocation, distanceMap])

    /** 刷新各 NPC 解锁状态 */
    const refreshUnlockState = useCallback(() => {
        const map: Record<string, boolean> = {}
        scenes.forEach(s => { map[s.npcId] = isNPCUnlocked(s.npcId) })
        setUnlockedMap(map)
    }, [scenes])

    /** 获取当前位置并判断是否进入任一景点围栏 */
    const fetchLocation = useCallback(() => {
        Taro.getLocation({
            type: 'wgs84',
            isHighAccuracy: true,
            success: (res) => {
                setMyLocation({ latitude: res.latitude, longitude: res.longitude })
                const accuracy = res.accuracy ?? 999
                setLocationTip(
                    accuracy <= 50 ? `定位精度 ±${Math.round(accuracy)}m`
                        : `定位精度较低（±${Math.round(accuracy)}m），可点击景点查看`
                )

                // 地理围栏：进入景点范围自动解锁对应 NPC
                let triggered: SceneFull | null = null
                for (const s of scenes) {
                    const d = calculateDistance(res.latitude, res.longitude, s.latitude, s.longitude)
                    if (d <= s.triggerRadius) { triggered = s; break }
                }
                if (triggered && !isNPCUnlocked(triggered.npcId)) {
                    unlockNPC(triggered.npcId, triggered.id)
                    stopSpeak()
                    setSpeakingId(null)
                    setSelectedId(triggered.id)
                    Taro.showToast({
                        title: `已解锁「${triggered.name}」讲解`,
                        icon: 'none',
                        duration: 2000
                    })
                    // 到达景点即自动打卡
                    handleAutoCheckin(triggered)
                }
                refreshUnlockState()
            },
            fail: () => {
                setLocationTip('未获取定位，可直接点击景点查看介绍')
            }
        })
    }, [scenes, refreshUnlockState])

    useEffect(() => {
        refreshUnlockState()
        fetchLocation()
        track('page_view', 'pages/route-detail/index')
        // 离开页面时停止语音，避免后台继续播放
        return () => { stopSpeak() }
    }, [fetchLocation, refreshUnlockState])

    /** 微信转发：默认分享园区导览，若刚打卡则带上景点名 */
    Taro.useShareAppMessage(() => ({
        title: checkinRecord
            ? `我在槎山白茶产业园打卡了「${checkinRecord.sceneName}」`
            : '槎山白茶产业园 · 智慧文旅园区导览',
        path: '/pages/route-detail/index'
    }))

    const markers = useMemo(
        () => displayScenes.map((s, index) => {
            const stop = routeStopMap[s.name]
            return {
                id: index,
                latitude: s.latitude,
                longitude: s.longitude,
                title: s.name,
                callout: {
                    // 游览模式下标注「第N站」，与路线导航语义一致
                    content: stop ? `${stop}·${s.name}` : s.name,
                    color: '#FFFFFF',
                    bgColor: s.gradient[0],
                    padding: 8,
                    borderRadius: 8,
                    fontSize: 12,
                    textAlign: 'center' as const,
                    display: selectedId === s.id ? ('ALWAYS' as const) : ('BYCLICK' as const)
                }
            }
        }),
        [displayScenes, routeStopMap, selectedId]
    )

    /** 切换选中景点：先停止语音，避免切换后仍在播上一个景点 */
    const handleSelect = (id: string) => {
        stopSpeak()
        setSpeakingId(null)
        setSelectedId(id)
    }

    /** 语音讲解：再次点击同一景点则停止播放 */
    const handleToggleSpeech = () => {
        if (!selected) return
        if (speakingId === selected.id) {
            stopSpeak()
            setSpeakingId(null)
            return
        }
        speak(buildSceneSpeech(selected), {
            onStart: () => setSpeakingId(selected.id),
            onEnd: () => setSpeakingId(null),
            onError: (err: any) => {
                setSpeakingId(null)
                const unavailable = err?.errMsg === 'TTS_PLUGIN_UNAVAILABLE'
                Taro.showToast({
                    title: unavailable
                        ? '语音插件未启用，请在小程序后台添加同声传译插件'
                        : '语音播放失败，请重试',
                    icon: 'none',
                    duration: 2500
                })
            }
        })
        track('scene_speech_play', 'pages/route-detail/index', { sceneId: selected.id })
    }

    const handleMarkerTap = (e: any) => {
        const index = e?.detail?.markerId
        if (typeof index === 'number' && scenes[index]) {
            handleSelect(scenes[index].id)
        }
    }

    const handleOpenChat = (scene: SceneFull) => {
        if (!isNPCUnlocked(scene.npcId)) {
            unlockNPC(scene.npcId, scene.id)
        }
        track('scene_npc_open', 'pages/route-detail/index', { sceneId: scene.id })
        Taro.navigateTo({ url: `/pages/npc-chat/index?id=${scene.npcId}` })
    }

    /** 退出游览模式：清掉路线上下文，回到普通园区导览 */
    const handleExitTour = () => {
        setRouteId('')
        Taro.showToast({ title: '已退出游览模式', icon: 'none', duration: 1500 })
    }

    /** 自动打卡（地理围栏触发时调用，不弹浮层，仅静默记录） */
    const handleAutoCheckin = (scene: SceneFull) => {
        if (hasCheckedIn(scene.id)) return
        addCheckin(scene.id)
        setCheckinCount(getCheckinCount())
        haptic('medium')
    }

    /** 手动打卡：插入打卡记录并弹出可分享的打卡成功卡 */
    const handleManualCheckin = (scene: SceneFull) => {
        const record = addCheckin(scene.id)
        setCheckinCount(getCheckinCount())
        if (record) {
            haptic('medium')
            setCheckinRecord(record)
            track('scene_checkin', 'pages/route-detail/index', { sceneId: scene.id })
        } else {
            Taro.showToast({ title: '打卡失败，请重试', icon: 'none' })
        }
    }

    /** 关闭打卡浮层 */
    const handleCloseCheckin = () => setCheckinRecord(null)

    const handleLocateBack = () => {
        fetchLocation()
    }

    /** 调起微信扫一扫，按二维码类型统一路由（溯源码 / NPC 触发码） */
    const handleScan = async () => {
        const r = await startScan()
        if (r) await handleQRCodeScan(r)
    }

    const npcName = selected ? (getNPCById(selected.npcId)?.name || '景点讲解员') : ''
    const dist = myLocation && selected ? distanceMap[selected.id] : undefined
    const inPark = dist !== undefined && dist <= 1000

    return (
        <View className={styles.routeDetailPage}>
            {/* 顶部：标题 + 视图切换 */}
            <View className={styles.header}>
                <View className={styles.headerLeft}>
                    <Text className={styles.headerTitle}>园区导览</Text>
                    <Text className={styles.headerSub}>槎山白茶产业园 · {scenes.length}个景点</Text>
                    <View className={styles.scanBtnInline} onClick={handleScan}>
                        <Icon className={styles.scanBtnIcon} name='search' size={26} color='white' />
                        <Text className={styles.scanBtnText}>扫一扫 · 验真/触发 NPC</Text>
                    </View>
                </View>
                <View className={styles.modeSwitch}>
                    <View
                        className={`${styles.modeBtn} ${mode === 'map' ? styles.modeBtnActive : ''}`}
                        onClick={() => setMode('map')}
                    >
                        <Text className={mode === 'map' ? styles.modeTextActive : styles.modeText}>地图</Text>
                    </View>
                    <View
                        className={`${styles.modeBtn} ${mode === 'list' ? styles.modeBtnActive : ''}`}
                        onClick={() => setMode('list')}
                    >
                        <Text className={mode === 'list' ? styles.modeTextActive : styles.modeText}>列表</Text>
                    </View>
                </View>
            </View>

            {/* 游览模式：从路线卡片「开始游览」进入时显示 */}
            {activeRoute && (
                <View className={styles.tourBar}>
                    <View className={styles.tourEmojiBox}>
                        <Icon className={styles.tourEmoji} name={activeRoute.coverEmoji || 'tea'} size={56} color='white' />
                    </View>
                    <View className={styles.tourTextCol}>
                        <Text className={styles.tourTitle}>正在游览：{activeRoute.name}</Text>
                        <Text className={styles.tourSub}>
                            全程 {activeRoute.nodes.length} 站 · 建议用时 {activeRoute.estimatedDuration}
                        </Text>
                    </View>
                    <View className={styles.tourExit} onClick={handleExitTour}>
                        <Text className={styles.tourExitText}>退出</Text>
                    </View>
                </View>
            )}

            {/* 定位状态条 */}
            <View className={styles.locationBar}>
                <Icon className={styles.locationIcon} name='pin' size={26} color='primary' />
                <Text className={styles.locationText}>{locationTip}</Text>
                <View className={styles.relocateBtn} onClick={handleLocateBack}>
                    <Text className={styles.relocateText}>重新定位</Text>
                </View>
            </View>

            {mode === 'map' ? (
                <View className={styles.mapWrapper}>
                    <MapView
                        className={styles.map}
                        latitude={center.latitude}
                        longitude={center.longitude}
                        scale={15}
                        markers={markers}
                        showLocation
                        onMarkerTap={handleMarkerTap}
                    />
                </View>
            ) : (
                <ScrollView className={styles.listWrapper} scrollY>
                    {sortedScenes.map((s) => (
                        <View
                            key={s.id}
                            className={`${styles.sceneItem} ${selectedId === s.id ? styles.sceneItemActive : ''}`}
                            onClick={() => handleSelect(s.id)}
                        >
                            <View className={styles.sceneIcon} style={{ background: `linear-gradient(135deg, ${s.gradient[0]} 0%, ${s.gradient[1]} 100%)` }}>
                                <Text className={styles.sceneIconText}>{s.icon}</Text>
                            </View>
                            <View className={styles.sceneInfo}>
                                <View className={styles.sceneNameRow}>
                                    {routeStopMap[s.name] ? (
                                        <Text className={styles.stopBadge}>第{routeStopMap[s.name]}站</Text>
                                    ) : null}
                                    <Text className={styles.sceneName}>{s.name}</Text>
                                    {unlockedMap[s.npcId] && <Text className={styles.unlockTag}>已解锁</Text>}
                                </View>
                                <Text className={styles.sceneSummary}>{s.summary}</Text>
                                <Text className={styles.sceneMeta}>
                                    {s.category} · 建议{s.suggestedStay}
                                    {distanceMap[s.id] !== undefined ? ` · ${formatDistance(distanceMap[s.id])}` : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* 底部：选中景点详情卡片 */}
            {selected && (
                <View className={styles.detailCard}>
                    <View className={styles.detailHeader}>
                        <View className={styles.detailTitleRow}>
                            <Text className={styles.detailName}>{selected.name}</Text>
                            <View className={styles.categoryTag} style={{ background: selected.gradient[0] }}>
                                <Text className={styles.categoryText}>{selected.category}</Text>
                            </View>
                        </View>
                        <View className={styles.detailMetaRow}>
                            <Text className={styles.detailMeta}>建议停留 {selected.suggestedStay}</Text>
                            {dist !== undefined && (
                                <Text className={`${styles.detailMeta} ${inPark ? styles.detailMetaNear : ''}`}>
                                    · 距您 {formatDistance(dist)}
                                </Text>
                            )}
                        </View>
                    </View>

                    <Text className={styles.detailDesc}>{selected.description}</Text>

                    <View className={styles.highlightRow}>
                        {selected.highlights.map((h, i) => (
                            <View key={i} className={styles.highlightTag}>
                                <Text className={styles.highlightText}>{h}</Text>
                            </View>
                        ))}
                    </View>

                    {selected.tips && (
                        <View className={styles.tipsRow}>
                            <Icon name='bulb' size={26} color='accentText' />
                            <Text className={styles.tipsText}>{selected.tips}</Text>
                        </View>
                    )}

                    <View className={styles.actionRow}>
                        <View
                            className={`${styles.checkinBtn} ${hasCheckedIn(selected.id) ? styles.checkinBtnDone : ''}`}
                            onClick={() => handleManualCheckin(selected)}
                        >
                            <Text className={styles.checkinBtnText}>
                                {hasCheckedIn(selected.id) ? '已打卡' : '打卡'}
                            </Text>
                        </View>
                        {ttsAvailable && (
                            <View
                                className={`${styles.voiceBtn} ${speakingId === selected.id ? styles.voiceBtnActive : ''}`}
                                onClick={handleToggleSpeech}
                            >
                                <Text className={styles.voiceBtnText}>
                                    {speakingId === selected.id ? '停止播放' : '语音讲解'}
                                </Text>
                            </View>
                        )}
                        <View className={styles.chatBtn} onClick={() => handleOpenChat(selected)}>
                            <Text className={styles.chatBtnText}>与「{npcName}」对话</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* 打卡成功浮层（可转发分享） */}
            {checkinRecord && (
                <View className={styles.checkinMask} onClick={handleCloseCheckin}>
                    <View className={styles.checkinCard} onClick={(e: any) => e.stopPropagation()}>
                        <View
                            className={styles.checkinCardHeader}
                            style={{ background: `linear-gradient(135deg, ${selected?.gradient[0]} 0%, ${selected?.gradient[1]} 100%)` }}
                        >
                            <Icon name={selected?.icon || 'tea'} size={64} color='white' />
                            <Text className={styles.checkinCardTitle}>打卡成功</Text>
                        </View>
                        <View className={styles.checkinCardBody}>
                            <Text className={styles.checkinSceneName}>{checkinRecord.sceneName}</Text>
                            <Text className={styles.checkinMeta}>槎山白茶产业园 · {formatCheckinTime(checkinRecord.time)}</Text>
                            <Text className={styles.checkinTip}>已收集 {checkinCount}/6 个景点印章 · 集齐可生成研学证书</Text>
                            <Button
                                className={styles.checkinShareBtn}
                                openType='share'
                            >
                                <Text className={styles.checkinShareText}>分享我的打卡</Text>
                            </Button>
                            <View className={styles.checkinCloseBtn} onClick={handleCloseCheckin}>
                                <Text className={styles.checkinCloseText}>关闭</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

export default RouteDetailPage
