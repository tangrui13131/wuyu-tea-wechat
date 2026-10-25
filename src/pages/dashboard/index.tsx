import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import DashboardChart, { type ChartItem } from '@/components/DashboardChart'
import {
    DASHBOARD_MOCK,
    PAGE_LABEL_MAP,
    BOOKING_STATUS_TEXT,
    type OverviewData
} from '@/data/dashboardMock'
import { getDashboard } from '@/services'

/** 真实埋点数据达到该量级以上才展示真实值，否则回落演示数据（避免展示个位数的空看板） */
const LIVE_DATA_THRESHOLD = 30

const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true)
    const [source, setSource] = useState<'live' | 'demo'>('demo')
    const [overview, setOverview] = useState<OverviewData>(DASHBOARD_MOCK.overview)
    const [profiles, setProfiles] = useState<ChartItem[]>(DASHBOARD_MOCK.profiles)
    const [interests, setInterests] = useState<ChartItem[]>(DASHBOARD_MOCK.interests)
    const [hotPages, setHotPages] = useState<ChartItem[]>(DASHBOARD_MOCK.hotSpots)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res: any = await getDashboard()
            const d = res?.data ?? res
            const ov = d?.overview
            // 后端未连接或埋点量过少时，保持演示数据
            if (ov && (ov.activeUsers30d ?? 0) >= LIVE_DATA_THRESHOLD) {
                setOverview({
                    todayVisitors: ov.activeUsers30d ?? 0,
                    newUsers: ov.newUsers30d ?? 0,
                    shopClicks: ov.shopClicks ?? 0,
                    taskCompletionRate: ov.taskCompletionRate ?? 0
                })
                if (Array.isArray(d.profiles) && d.profiles.length) {
                    setProfiles(d.profiles.map((x: any) => ({
                        label: x.name || '未知', value: Number(x.value) || 0
                    })))
                }
                if (Array.isArray(d.interests) && d.interests.length) {
                    setInterests(d.interests.map((x: any) => ({
                        label: x.name || '未知', value: Number(x.value) || 0
                    })))
                }
                if (Array.isArray(d.hotPages) && d.hotPages.length) {
                    const mapped = d.hotPages
                        .map((x: any) => ({
                            label: PAGE_LABEL_MAP[x.name] || x.name || '',
                            value: Number(x.value) || 0
                        }))
                        .filter((x: ChartItem) => x.label && x.value > 0)
                    if (mapped.length) setHotPages(mapped)
                }
                setSource('live')
            } else {
                setSource('demo')
            }
        } catch (e) {
            setSource('demo')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleRefresh = () => {
        Taro.showLoading({ title: '刷新中' })
        load().then(() => Taro.hideLoading())
    }

    const metrics = [
        { label: '今日客流', value: overview.todayVisitors, unit: '人', color: '#4A7C59' },
        { label: '新增用户', value: overview.newUsers, unit: '人', color: '#165DFF' },
        { label: '商城点击', value: overview.shopClicks, unit: '次', color: '#C49A6C' },
        { label: '任务完成率', value: overview.taskCompletionRate, unit: '%', color: '#C41E3A' }
    ]

    return (
        <ScrollView className={styles.dashboardPage} scrollY>
            {/* 顶部标题 + 数据来源 */}
            <View className={styles.header}>
                <View className={styles.headerLeft}>
                    <Text className={styles.headerTitle}>运营看板</Text>
                    <Text className={styles.headerSub}>槎山白茶产业园 · 经营数据概览</Text>
                </View>
                <View
                    className={`${styles.sourceTag} ${source === 'live' ? styles.sourceLive : styles.sourceDemo}`}
                    onClick={handleRefresh}
                >
                    <Text className={styles.sourceText}>
                        {loading ? '加载中' : (source === 'live' ? '● 实时数据' : '● 演示数据')}
                    </Text>
                </View>
            </View>

            {source === 'demo' && (
                <View className={styles.noticeBar}>
                    <Text className={styles.noticeText}>
                        当前为演示数据：后端未连接或埋点样本不足时自动展示，用于向经营者说明看板能力
                    </Text>
                </View>
            )}

            {/* 核心指标 */}
            <View className={styles.metricGrid}>
                {metrics.map((m, i) => (
                    <View key={i} className={styles.metricCard}>
                        <Text className={styles.metricValue} style={{ color: m.color }}>
                            {m.value}
                            <Text className={styles.metricUnit}>{m.unit}</Text>
                        </Text>
                        <Text className={styles.metricLabel}>{m.label}</Text>
                    </View>
                ))}
            </View>

            {/* 客流趋势 */}
            <View className={styles.section}>
                <View className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>近 7 日客流趋势</Text>
                    <Text className={styles.sectionTag}>模拟</Text>
                </View>
                <View className={styles.card}>
                    <DashboardChart type="bar" data={DASHBOARD_MOCK.trend} unit="人" color="#4A7C59" />
                </View>
            </View>

            {/* 热门点位 */}
            <View className={styles.section}>
                <View className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>热门点位 TOP6</Text>
                    <Text className={styles.sectionTag}>
                        {source === 'live' ? '实时' : '模拟'}
                    </Text>
                </View>
                <View className={styles.card}>
                    <DashboardChart type="hbar" data={hotPages} unit="人次" color="#4A7C59" />
                </View>
            </View>

            {/* 商品销量 */}
            <View className={styles.section}>
                <View className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>茶产品销量 TOP5</Text>
                    <Text className={styles.sectionTag}>模拟</Text>
                </View>
                <View className={styles.card}>
                    <DashboardChart type="hbar" data={DASHBOARD_MOCK.sales} unit="件" color="#C49A6C" />
                </View>
            </View>

            {/* 研学预约 */}
            <View className={styles.section}>
                <View className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>研学预约（近 7 日）</Text>
                    <Text className={styles.sectionTag}>模拟</Text>
                </View>
                <View className={styles.card}>
                    {DASHBOARD_MOCK.bookings.map((b) => (
                        <View key={b.id} className={styles.bookingRow}>
                            <View className={styles.bookingLeft}>
                                <Text className={styles.bookingOrg}>{b.org}</Text>
                                <Text className={styles.bookingMeta}>
                                    {b.type} · {b.date} · {b.people}人
                                </Text>
                            </View>
                            <View className={`${styles.bookingStatus} ${styles[`status_${b.status}`]}`}>
                                <Text className={styles.bookingStatusText}>
                                    {BOOKING_STATUS_TEXT[b.status]}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* 游客画像 */}
            <View className={styles.section}>
                <View className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>游客画像构成</Text>
                    <Text className={styles.sectionTag}>
                        {source === 'live' ? '实时' : '模拟'}
                    </Text>
                </View>
                <View className={styles.card}>
                    <DashboardChart type="ratio" data={profiles} />
                </View>
            </View>

            {/* 兴趣分布 */}
            <View className={styles.section}>
                <View className={styles.sectionHeader}>
                    <Text className={styles.sectionTitle}>兴趣偏好分布</Text>
                    <Text className={styles.sectionTag}>
                        {source === 'live' ? '实时' : '模拟'}
                    </Text>
                </View>
                <View className={styles.card}>
                    <DashboardChart type="ratio" data={interests} color="#C49A6C" />
                </View>
            </View>

            <View className={styles.footer}>
                <Text className={styles.footerText}>
                    数据每 5 分钟更新 · 经营看板为第二阶段建设内容
                </Text>
            </View>
        </ScrollView>
    )
}

export default DashboardPage
