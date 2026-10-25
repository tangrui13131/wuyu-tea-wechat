import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Icon from '@/components/Icon'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface RankItem {
    id: string
    name: string
    score: number // 打卡数
    tasks: number // 完成任务数
    avatarColor: [string, string]
    isCurrent?: boolean
}

// 班级排行榜（一日研学营口径：以班级为单位统计打卡与任务完成）
const CLASS_RANK: RankItem[] = [
    { id: 'c1', name: '武昌首义学院 计算机2401班', score: 6, tasks: 22, avatarColor: ['#4A7C59', '#3D6B3C'] },
    { id: 'c2', name: '安陆一中 高一(3)班', score: 6, tasks: 19, avatarColor: ['#C49A6C', '#A87B4F'] },
    { id: 'c3', name: '孝感文昌中学 初二(7)班', score: 5, tasks: 17, avatarColor: ['#7AB379', '#4A7C59'] },
    { id: 'c4', name: '武汉光谷二小 五年级2班', score: 5, tasks: 15, avatarColor: ['#4A7C59', '#2E5A39'] },
    { id: 'c5', name: '安陆实验小学 四年级1班', score: 4, tasks: 14, avatarColor: ['#8FBC8F', '#4A7C59'] }
]

// 团队排行榜（红色团建/党建口径：以团队为单位统计）
const TEAM_RANK: RankItem[] = [
    { id: 't1', name: '首义先锋党员先锋队', score: 6, tasks: 24, avatarColor: ['#C41E3A', '#8B1428'], isCurrent: true },
    { id: 't2', name: '安陆茶企联合党支部', score: 6, tasks: 21, avatarColor: ['#C41E3A', '#A02030'] },
    { id: 't3', name: '武昌首义学院 团委分队', score: 5, tasks: 18, avatarColor: ['#C0392B', '#7B1018'] },
    { id: 't4', name: '孝感青年志愿者队', score: 5, tasks: 16, avatarColor: ['#D14B3C', '#9B2D20'] },
    { id: 't5', name: '槎山村委会工作队', score: 4, tasks: 15, avatarColor: ['#A93226', '#6E1E15'] }
]

/** 前三名只改颜色不改字形：数字本位比奖牌图形更克制，也不会与线性图标混搭 */

const RankingPage: React.FC = () => {
    const [tab, setTab] = useState<'class' | 'team'>('class')
    const data = tab === 'class' ? CLASS_RANK : TEAM_RANK
    const maxScore = Math.max(...data.map(d => d.score), 1)
    const totalCheckins = data.reduce((s, d) => s + d.score, 0)

    return (
        <ScrollView className={styles.rankingPage} scrollY>
            <View className={styles.header}>
                <Text className={styles.headerTitle}>研学排行榜</Text>
                <Text className={styles.headerSub}>槎山白茶产业园 · 红色团建 / 一日研学</Text>
            </View>

            <View className={styles.tabBar}>
                <View
                    className={`${styles.tab} ${tab === 'class' ? styles.tabActive : ''}`}
                    onClick={() => setTab('class')}
                >
                    <Text className={styles.tabText}>班级排行</Text>
                </View>
                <View
                    className={`${styles.tab} ${tab === 'team' ? styles.tabActive : ''}`}
                    onClick={() => setTab('team')}
                >
                    <Text className={styles.tabText}>团队排行</Text>
                </View>
            </View>

            <View className={styles.summaryBar}>
                <Text className={styles.summaryText}>
                    参与{tab === 'class' ? '班级' : '团队'} {data.length} 支 · 累计打卡 {totalCheckins} 次
                </Text>
            </View>

            <View className={styles.list}>
                {data.map((item, idx) => (
                    <View
                        key={item.id}
                        className={`${styles.rankItem} ${item.isCurrent ? styles.rankItemCurrent : ''}`}
                    >
                        <View className={styles.rankLeft}>
                            <Text className={`${styles.rankNo} ${idx < 3 ? styles.rankNoTop : ''}`}>
                                {idx + 1}
                            </Text>
                            <View
                                className={styles.rankAvatar}
                                style={{ background: `linear-gradient(135deg, ${item.avatarColor[0]} 0%, ${item.avatarColor[1]} 100%)` }}
                            >
                                <Text className={styles.rankAvatarText}>{item.name.slice(0, 1)}</Text>
                            </View>
                            <View className={styles.rankInfo}>
                                <Text className={styles.rankName}>{item.name}</Text>
                                <Text className={styles.rankMeta}>完成任务 {item.tasks} 项</Text>
                            </View>
                        </View>
                        <View className={styles.rankRight}>
                            <View className={styles.scoreBarWrap}>
                                <View
                                    className={styles.scoreBar}
                                    style={{
                                        width: `${(item.score / maxScore) * 100}%`,
                                        background: `linear-gradient(90deg, ${item.avatarColor[0]}, ${item.avatarColor[1]})`
                                    }}
                                />
                            </View>
                            <Text className={styles.scoreText}>{item.score} 打卡</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View className={styles.footTip}>
                <Text className={styles.footTipText}>
                    说明：排名为研学活动演示数据。正式运营后将对接后端真实打卡与任务完成记录。
                </Text>
            </View>
        </ScrollView>
    )
}

export default RankingPage
