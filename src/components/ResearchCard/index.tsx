import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ResearchTheme } from '../../data/research'
import { calculateThemeProgress } from '../../utils/research'
import './index.scss'

interface ResearchCardProps {
    theme: ResearchTheme
    onClick: () => void
}

// 色带右下角的大字水印（茶 / 耕 / 红），与 .theme-* 三套主题色一一对应
const TONE_CHAR: Record<string, string> = { tea: '茶', farm: '耕', red: '红' }

const ResearchCard: React.FC<ResearchCardProps> = ({ theme, onClick }) => {
    const [progress, setProgress] = useState(calculateThemeProgress(theme.id))

    // 每次页面显示时重新计算进度
    useEffect(() => {
        const updateProgress = () => {
            setProgress(calculateThemeProgress(theme.id))
        }

        // 立即更新一次
        updateProgress()

        // 监听页面显示事件
        Taro.eventCenter.on('researchProgressUpdated', updateProgress)

        return () => {
            Taro.eventCenter.off('researchProgressUpdated', updateProgress)
        }
    }, [theme.id])

    const status = progress.percentage === 0 ? '未开始' : progress.percentage === 100 ? '已完成' : '进行中'
    const statusClass = progress.percentage === 0 ? 'not-started' : progress.percentage === 100 ? 'completed' : 'in-progress'

    // 主题色由 data/research.ts 的 tone 字段声明；缺失时按主题名兜底，
    // 这样后端下发的主题即使没带 tone 也不会退化成统一配色
    const tone = theme.tone || (theme.name.indexOf('农耕') > -1 ? 'farm' : theme.name.indexOf('红色') > -1 ? 'red' : 'tea')
    const coverChar = TONE_CHAR[tone] || '研'
    const subtitle = theme.bannerSubtitle || '槎山 · 研学'

    return (
        <View className={`research-card theme-${tone}`} onClick={onClick}>
            {/* 顶部主题色带：副题 + 状态印章 + 大字水印 */}
            <View className='card-banner'>
                <View className='banner-subtitle'>
                    <View className='subtitle-rule' />
                    <Text>{subtitle}</Text>
                </View>
                <View className={`status-stamp ${statusClass}`}>
                    <Text>{status}</Text>
                </View>
                <Text className='watermark-char'>{coverChar}</Text>
            </View>

            {/* 卡纸内容区 */}
            <View className='card-body'>
                <Text className='card-title'>{theme.name}</Text>

                {/* 指导 NPC 微章 */}
                <View className='npc-badge'>
                    <Text className='npc-label'>指导 NPC ·</Text>
                    <Text className='npc-name'>{theme.npcName}</Text>
                </View>

                {/* 简介 */}
                <Text className='card-desc'>{theme.description}</Text>

                {/* 进度区：任务数 + 完成进度 */}
                <View className='progress-section'>
                    <View className='progress-header'>
                        <Text>{theme.levelCount}个任务</Text>
                        <Text className='progress-count'>
                            {progress.completed}/{progress.total} 已完成 {progress.percentage}%
                        </Text>
                    </View>
                    <View className='progress-track'>
                        <View
                            className='progress-bar'
                            style={{ width: progress.percentage + '%' }}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}

export default ResearchCard
