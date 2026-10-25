import React, { useState, useEffect } from 'react'
import Taro, { useRouter, navigateBack, navigateTo } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import Icon from '@/components/Icon'
import { getResearchThemeById, ResearchTheme, ResearchLevel } from '@/data/research'
import { getThemeProgress, startTheme, startLevel, calculateThemeProgress, TaskProgress, resetThemeProgress } from '@/utils/research'
import { getNPCById } from '@/data/npcs'
import NPCAvatar from '@/components/NPCAvatar'
import { IMG } from '@/assets/images'
import './index.scss'

// 关卡示意缩略图（按关卡序号循环使用 4 张氛围图）
const LEVEL_THUMBS = [IMG.levels.temperature, IMG.levels.aroma, IMG.levels.picking, IMG.levels.relics]

// 任务类型标签配置
const TASK_TYPE_CONFIG = {
    checkin: { label: '打卡', color: '#4CAF50' },
    observation: { label: '观察', color: '#2196F3' },
    qa: { label: '问答', color: '#FF9800' },
    experience: { label: '体验', color: '#E91E63' }
}

export default function StudyDetail() {
    const router = useRouter()
    const { id: themeId } = router.params
    const [theme, setTheme] = useState<ResearchTheme | null>(null)
    const [progress, setProgress] = useState<TaskProgress[]>([])
    const [totalProgress, setTotalProgress] = useState({ completed: 0, total: 4, percentage: 0 })

    useEffect(() => {
        if (!themeId) return

        // 加载主题数据
        const loadedTheme = getResearchThemeById(themeId)
        if (!loadedTheme) {
            Taro.showToast({
                title: '主题不存在',
                icon: 'none'
            })
            return
        }

        setTheme(loadedTheme)

        // 开始主题（如果未开始）
        startTheme(loadedTheme)

        // 加载进度
        loadProgress(loadedTheme)
    }, [themeId])

    const loadProgress = (loadedTheme: ResearchTheme) => {
        const themeProgress = getThemeProgress(loadedTheme.id)
        if (themeProgress) {
            setProgress(themeProgress.levels)
            const calcProgress = calculateThemeProgress(loadedTheme.id)
            setTotalProgress(calcProgress)
        } else {
            // 初始化进度
            const initialProgress = loadedTheme.levels.map((level, index) => ({
                levelId: level.levelId,
                status: index === 0 ? 'not_started' : 'locked' as const
            }))
            setProgress(initialProgress)
        }
    }

    const handleLevelClick = (level: ResearchLevel, taskProgress: TaskProgress) => {
        if (taskProgress.status === 'locked') {
            Taro.showToast({
                title: '请先完成前一关',
                icon: 'none'
            })
            return
        }

        // 开始关卡
        startLevel(themeId!, level.levelId)

        // 跳转到任务执行页
        navigateTo({
            url: `/subpackages/study/pages/study-task/index?themeId=${themeId}&levelId=${level.levelId}`
        })
    }

    const handleResetProgress = () => {
        Taro.showModal({
            title: '重置本主题进度',
            content: '确定要重新开始本主题吗？之前记录的打卡、答题和照片会被清空。',
            success: (res) => {
                if (res.confirm && themeId) {
                    resetThemeProgress(themeId)
                    loadProgress(theme!)
                    Taro.showToast({ title: '已重置', icon: 'success' })
                }
            }
        })
    }

    const getGuideText = () => {
        if (totalProgress.percentage === 100) return '太棒了，你都完成了！可以去生成研学报告和证书了。'
        if (totalProgress.percentage === 0) return '从这里开始，逐个完成四个关卡，最后生成研学报告。'
        return '继续加油，完成当前任务就能解锁下一关。'
    }

    if (!theme) {
        return (
            <View className='loading'>
                <Text>加载中...</Text>
            </View>
        )
    }

    return (
        <View className='study-detail-page'>
            {/* 顶部导航栏 */}
            <View className='nav-bar'>
                <View className='back-btn' onClick={() => navigateBack()}>
                    <Text>‹</Text>
                </View>
                <Text className='page-title'>{theme.name}</Text>
                <View className='progress-display'>
                    <Text>{totalProgress.completed}/{theme.levelCount}</Text>
                </View>
            </View>

            {/* 整体进度条 */}
            <View className='overall-progress'>
                <View className='progress-bar-bg'>
                    <View
                        className='progress-bar-fill'
                        style={{ width: `${totalProgress.percentage}%` }}
                    />
                </View>
                <Text className='progress-text'>总进度 {totalProgress.percentage}%</Text>
                <View className='reset-btn' onClick={handleResetProgress}>
                    <Text className='reset-btn-text'>重置本主题进度</Text>
                </View>
            </View>

            {/* NPC 引导区 */}
            <View className='npc-guide'>
                {theme.npcId && getNPCById(theme.npcId) && (
                    <NPCAvatar npc={getNPCById(theme.npcId)!} size={88} />
                )}
                <View className='npc-content'>
                    <Text className='npc-name'>{theme.npcName}</Text>
                    <View className='guide-bubble'>
                        <Text>{getGuideText()}</Text>
                    </View>
                </View>
            </View>

            {/* 关卡列表 */}
            <View className='level-list'>
                {theme.levels.map((level, index) => {
                    const taskProgress = progress.find(p => p.levelId === level.levelId)
                    const isUnlocked = taskProgress?.status !== 'locked'
                    const isCompleted = taskProgress?.status === 'completed'
                    const isSkipped = taskProgress?.status === 'skipped'
                    const isInProgress = taskProgress?.status === 'in_progress'

                    const typeConfig = TASK_TYPE_CONFIG[level.type]

                    return (
                        <View
                            key={level.id}
                            className={`level-item ${taskProgress?.status || 'locked'}`}
                            onClick={() => handleLevelClick(level, taskProgress!)}
                        >
                            {/* 关卡序号 */}
                            <View className={`level-badge ${isCompleted ? 'completed' : ''}`}>
                                {isCompleted ? (
                                    <Icon name='check' size={26} color='white' />
                                ) : isSkipped ? (
                                    <Text>○</Text>
                                ) : (
                                    <Text>{level.levelId}</Text>
                                )}
                            </View>

                            {/* 连线 */}
                            {index < theme.levels.length - 1 && (
                                <View className={`level-line ${isCompleted ? 'completed' : ''}`} />
                            )}

                            {/* 关卡内容 */}
                            <View className='level-content'>
                                <View className='level-header'>
                                    <View className='level-name-wrap'>
                                        <Image
                                            className='level-thumb'
                                            src={LEVEL_THUMBS[index % LEVEL_THUMBS.length]}
                                            mode='aspectFill'
                                        />
                                        <Text className='level-name'>{level.name}</Text>
                                    </View>
                                    <View
                                        className='type-tag'
                                        style={{ backgroundColor: typeConfig.color }}
                                    >
                                        <Text style={{ color: '#fff' }}>{typeConfig.label}</Text>
                                    </View>
                                </View>

                                <Text className='level-desc'>{level.description}</Text>

                                <View className='level-footer'>
                                    <Text className='completion-condition'>{level.completionCondition}</Text>
                                    {isInProgress && (
                                        <Text className='in-progress-tag'>进行中</Text>
                                    )}
                                    {isSkipped && (
                                        <Text className='skipped-tag'>已跳过</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}
