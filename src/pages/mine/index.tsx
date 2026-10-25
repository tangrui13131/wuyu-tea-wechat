import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Icon from '@/components/Icon'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import Reveal from '@/components/Reveal'
import Counter from '@/components/Counter'
import { studyReportStorage } from '@/utils/storage'
import { getTasks } from '@/services'
import { getCheckins, getCheckinCount, type CheckinRecord } from '@/utils/checkin'
import { SCENE_LOCATIONS } from '@/utils/location'
import { SCENE_DETAILS } from '@/data/scenes'
import { IMG } from '@/assets/images'

interface MenuItem {
    key: string
    label: string
    desc: string
    url: string
}

const MinePage: React.FC = () => {
    const [nickname] = useState('游客')
    // 景点展示信息（渐变底色 + 图标）按 id 建索引：
    // SCENE_LOCATIONS 只有坐标，渐变与图标在 data/scenes.ts，之前直接读 s.gradient 会崩
    const sceneStyleById = useMemo(() => {
        const map: Record<string, { gradient: [string, string]; icon: string }> = {}
        SCENE_DETAILS.forEach(d => { map[d.id] = { gradient: d.gradient, icon: d.icon } })
        return map
    }, [])
    const [stats, setStats] = useState({
        completedTasks: 0,
        studyReports: 0,
        totalScore: 0
    })
    const [checkinCount, setCheckinCount] = useState(0)
    const [checkins, setCheckins] = useState<CheckinRecord[]>([])

    /** 我的服务：跳转地址与 report 页的 tab 参数对应 */
    const serviceMenus: MenuItem[] = [
        { key: 'report', label: '我的研学报告', desc: '查看已生成的报告与记录', url: '/pages/report/index?tab=history' },
        { key: 'modules', label: '研学课程', desc: '浏览可选的研学主题模块', url: '/pages/report/index?tab=modules' },
        { key: 'ranking', label: '研学排行榜', desc: '班级 / 团队打卡与任务排名', url: '/pages/ranking/index' },
        { key: 'dashboard', label: '运营看板', desc: '客流·点位·销量·预约概览', url: '/pages/dashboard/index' }
    ]

    useEffect(() => { loadStats() }, [])

    const loadStats = async () => {
        const reports = studyReportStorage.get() || []
        let completed = 0
        try {
            const tasks: any[] = (await getTasks()) || []
            completed = tasks.filter((t: any) => t.status === 'completed').length
        } catch (e) {
            // 离线时沿用本地报告数据，任务数保持 0
        }
        setStats({
            completedTasks: completed,
            studyReports: reports.length,
            totalScore: reports.reduce((sum: number, r: any) => sum + (r.totalScore || 0), 0)
        })
        setCheckinCount(getCheckinCount())
        setCheckins(getCheckins())
    }

    const handleNavigate = (item: MenuItem) => {
        Taro.navigateTo({ url: item.url })
    }

    const handleClearPreferences = () => {
        Taro.showModal({
            title: '提示',
            content: '确定要清除偏好设置吗？清除后需重新选择偏好。',
            success: (res) => {
                if (res.confirm) {
                    Taro.removeStorageSync('chashan_wenlv_user_preferences')
                    Taro.showToast({ title: '已清除', icon: 'success' })
                    Taro.switchTab({ url: '/pages/home/index' })
                }
            }
        })
    }

    return (
        <ScrollView className={styles.minePage} scrollY>
            <View className={styles.profileSection}>
                <View className={styles.avatar}>
                    <Text className={styles.avatarText}>{nickname.charAt(0)}</Text>
                </View>
                <View className={styles.userInfo}>
                    <View className={styles.nicknameRow}>
                        <Text className={styles.nickname}>{nickname}</Text>
                        <Image className={styles.nicknameBadge} src={IMG.states.badge} mode="aspectFill" />
                    </View>
                    <Text className={styles.visitCount}>槎山智慧文旅 · 游客端</Text>
                </View>
            </View>

            <Reveal variant="scale-in" className={styles.statsCard}>
                <View className={styles.statItem}>
                    <Counter className={styles.statValue} value={stats.completedTasks} />
                    <Text className={styles.statLabel}>完成任务</Text>
                </View>
                <View className={styles.statItem}>
                    <Counter className={styles.statValue} value={stats.studyReports} />
                    <Text className={styles.statLabel}>研学报告</Text>
                </View>
                <View className={styles.statItem} onClick={() => Taro.navigateTo({ url: '/pages/route-detail/index' })}>
                    <Counter className={styles.statValue} value={checkinCount} suffix="/6" />
                    <Text className={styles.statLabel}>景点打卡</Text>
                </View>
            </Reveal>

            {/* 我的打卡画廊 */}
            <Reveal variant="fade-up" delay={80} className={styles.menuSection}>
                <View className={styles.sectionTitleRow}>
                    <Text className={styles.sectionTitle}>我的打卡</Text>
                    <Text className={styles.sectionSub} onClick={() => Taro.navigateTo({ url: '/pages/route-detail/index' })}>去打卡 ›</Text>
                </View>
                {checkins.length > 0 ? (
                    <View className={styles.checkinGallery}>
                        {SCENE_LOCATIONS.map((s) => {
                            const rec = checkins.find(c => c.sceneId === s.id)
                            // 渐变与图标来自 SCENE_DETAILS（按 id 索引），坐标仍用 SCENE_LOCATIONS，
                            // 避免两处维护坐标；查不到时给兜底色，绝不因缺字段崩页
                            const display = sceneStyleById[s.id]
                            return (
                                <View
                                    key={s.id}
                                    className={`${styles.checkinCell} ${rec ? styles.checkinCellDone : ''}`}
                                    style={rec && display ? { background: `linear-gradient(135deg, ${display.gradient[0]} 0%, ${display.gradient[1]} 100%)` } : {}}
                                    onClick={() => rec && Taro.navigateTo({ url: '/pages/route-detail/index' })}
                                >
                                    <Icon className={styles.checkinCellIcon} name={rec && display ? display.icon : 'lock'} size={40} color={rec ? 'primary' : 'tertiary'} />
                                    <Text className={styles.checkinCellName}>{s.name.replace('景区', '').replace('景观区', '').replace('展示区', '')}</Text>
                                </View>
                            )
                        })}
                    </View>
                ) : (
                    <View className={styles.checkinEmpty}>
                        <Text className={styles.checkinEmptyText}>还没有打卡记录，去园区导览地图打卡吧～</Text>
                    </View>
                )}
            </Reveal>

            <Reveal variant="fade-up" delay={140} className={styles.menuSection}>
                <Text className={styles.sectionTitle}>我的服务</Text>
                <View className={styles.menuList}>
                    {serviceMenus.map((item) => (
                        <View
                            key={item.key}
                            className={styles.menuItem}
                            onClick={() => handleNavigate(item)}
                        >
                            <View className={styles.menuLeft}>
                                <Text className={styles.menuLabel}>{item.label}</Text>
                                <Text className={styles.menuDesc}>{item.desc}</Text>
                            </View>
                            <Text className={styles.menuArrow}>›</Text>
                        </View>
                    ))}
                </View>
            </Reveal>

            <Reveal variant="fade-up" delay={200} className={styles.menuSection}>
                <Text className={styles.sectionTitle}>设置</Text>
                <View className={styles.menuList}>
                    <View className={styles.menuItem} onClick={handleClearPreferences}>
                        <View className={styles.menuLeft}>
                            <Text className={styles.menuLabel}>清除偏好设置</Text>
                        </View>
                        <Text className={styles.menuArrow}>›</Text>
                    </View>
                    <View className={styles.menuItem}>
                        <View className={styles.menuLeft}>
                            <Text className={styles.menuLabel}>关于我们</Text>
                            <Text className={styles.menuDesc}>武昌首义学院 首义先锋团队</Text>
                        </View>
                        <Text className={styles.menuArrow}>›</Text>
                    </View>
                </View>
            </Reveal>
        </ScrollView>
    )
}

export default MinePage
