import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Icon from '@/components/Icon'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { getTask } from '@/services'
import { storage } from '@/utils/storage'
import { getNPCById } from '@/data/npcs'
import { unlockNPC, isNPCUnlocked } from '@/utils/chat'
import { track } from '@/services'
import type { Task } from '@/types/task'

const THEME_MAP: Record<string, string> = {
    tea: '茶文化',
    farming: '农耕体验',
    red: '红色教育'
}

const DIFFICULTY_MAP: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
}

const TYPE_MAP: Record<string, string> = {
    observation: '观察记录',
    question: '问答',
    checkin: '打卡',
    experience: '体验'
}

const SUBMIT_MAP: Record<string, string> = {
    text: '文字记录',
    image: '拍照上传',
    both: '文字 + 拍照'
}

const progressKey = (taskId: string) => `task_done_steps_${taskId}`

const TaskDetailPage: React.FC = () => {
    const router = useRouter()
    const taskId = router.params.id || ''

    const [task, setTask] = useState<Task | null>(null)
    const [doneSteps, setDoneSteps] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        if (!taskId) { setLoading(false); return }
        setLoading(true)
        try {
            const t = await getTask(taskId)
            setTask(t || null)
            setDoneSteps(storage.get<string[]>(progressKey(taskId), []))
        } catch (e) {
            setTask(null)
        } finally {
            setLoading(false)
        }
    }, [taskId])

    useEffect(() => {
        load()
        track('page_view', 'pages/task-detail/index', { taskId })
    }, [load, taskId])

    /** 标记/取消某一步完成，进度存本地，离线可用 */
    const handleToggleStep = (stepId: string) => {
        if (!task) return
        const next = doneSteps.includes(stepId)
            ? doneSteps.filter(s => s !== stepId)
            : [...doneSteps, stepId]
        setDoneSteps(next)
        storage.set(progressKey(taskId), next)
        track('task_step_toggle', 'pages/task-detail/index', { taskId, stepId, done: next.includes(stepId) })

        if (!doneSteps.includes(stepId) && next.length === task.steps.length) {
            Taro.showToast({ title: '任务全部完成', icon: 'success', duration: 2000 })
        }
    }

    /** 找引导 NPC 对话 */
    const handleAskNpc = () => {
        if (!task) return
        if (!isNPCUnlocked(task.npcId)) {
            unlockNPC(task.npcId, task.id)
        }
        track('task_npc_open', 'pages/task-detail/index', { taskId, npcId: task.npcId })
        Taro.navigateTo({ url: `/pages/npc-chat/index?id=${task.npcId}` })
    }

    if (loading) {
        return (
            <View className={styles.taskDetailPage}>
                <Text className={styles.loadingText}>加载中...</Text>
            </View>
        )
    }

    if (!task) {
        return (
            <View className={styles.taskDetailPage}>
                <View className={styles.emptyBox}>
                    <Icon className={styles.emptyIcon} name='note' size={72} color='tertiary' />
                    <Text className={styles.emptyTitle}>未找到该任务</Text>
                    <Text className={styles.emptyDesc}>任务可能已下架，或后端未启动导致数据拉取失败</Text>
                </View>
            </View>
        )
    }

    const npc = getNPCById(task.npcId)
    const total = task.steps.length
    const done = task.steps.filter(s => doneSteps.includes(s.id)).length
    const allDone = total > 0 && done === total
    const percent = total ? Math.round((done / total) * 100) : 0

    return (
        <ScrollView className={styles.taskDetailPage} scrollY>
            {/* 任务概览 */}
            <View className={styles.heroCard}>
                <View className={styles.tagRow}>
                    <Text className={styles.themeTag}>{THEME_MAP[task.theme] || task.theme}</Text>
                    <Text className={`${styles.diffTag} ${styles[`diff_${task.difficulty}`]}`}>
                        {DIFFICULTY_MAP[task.difficulty] || task.difficulty}
                    </Text>
                    <Text className={styles.typeTag}>{TYPE_MAP[task.type] || task.type}</Text>
                </View>
                <Text className={styles.taskTitle}>{task.title}</Text>
                <Text className={styles.taskDesc}>{task.description}</Text>

                <View className={styles.progressRow}>
                    <View className={styles.progressBar}>
                        <View className={styles.progressFill} style={{ width: `${percent}%` }} />
                    </View>
                    <Text className={styles.progressText}>{done}/{total} 步</Text>
                </View>

                <View className={styles.rewardRow}>
                    <Icon className={styles.rewardIcon} name='medal' size={32} color='accent' />
                    <Text className={styles.rewardText}>完成奖励：{task.reward}</Text>
                </View>
            </View>

            {/* 引导 NPC */}
            {npc && (
                <View className={styles.npcCard} onClick={handleAskNpc}>
                    <View className={styles.npcAvatar}>
                        <Icon name={npc.emoji || 'tea'} size={56} color='white' />
                    </View>
                    <View className={styles.npcInfo}>
                        <Text className={styles.npcName}>{npc.name}</Text>
                        <Text className={styles.npcTitle}>{npc.title}</Text>
                    </View>
                    <Text className={styles.npcAction}>问问他 ›</Text>
                </View>
            )}

            {/* 步骤列表 */}
            <View className={styles.sectionTitle}>任务步骤</View>
            <View className={styles.stepsWrap}>
                {task.steps.map((step, index) => {
                    const isDone = doneSteps.includes(step.id)
                    return (
                        <View key={step.id} className={`${styles.stepItem} ${isDone ? styles.stepItemDone : ''}`}>
                            <View className={styles.stepHead}>
                                <View className={`${styles.stepNo} ${isDone ? styles.stepNoDone : ''}`}>
                                    {isDone ? (
                                        <Icon name='check' size={24} color='white' />
                                    ) : (
                                        <Text className={styles.stepNoText}>{index + 1}</Text>
                                    )}
                                </View>
                                <Text className={styles.stepTitle}>{step.title}</Text>
                            </View>
                            <Text className={styles.stepDesc}>{step.description}</Text>

                            {step.npcGuidance ? (
                                <View className={styles.guidanceBox}>
                                    <Text className={styles.guidanceText}>“{step.npcGuidance}”</Text>
                                    <Text className={styles.guidanceFrom}>— {npc?.name || '讲解员'}</Text>
                                </View>
                            ) : null}

                            <View className={styles.stepMeta}>
                                <Text className={styles.metaChip}>条件：{step.completionCondition}</Text>
                                <Text className={styles.metaChip}>提交：{SUBMIT_MAP[step.submitType] || step.submitType}</Text>
                            </View>

                            <View
                                className={`${styles.stepBtn} ${isDone ? styles.stepBtnDone : ''}`}
                                onClick={() => handleToggleStep(step.id)}
                            >
                                <Text className={styles.stepBtnText}>
                                    {isDone ? '已完成，点击撤销' : '标记完成'}
                                </Text>
                            </View>
                        </View>
                    )
                })}
            </View>

            {/* 完成后解锁知识卡片 */}
            {allDone && (
                <View className={styles.knowledgeCard}>
                    <View className={styles.knowledgeHead}>
                        <Icon name='graduation' size={30} color='primary' />
                        <Text className={styles.knowledgeTitle}>{task.knowledgeCard.title}</Text>
                    </View>
                    <Text className={styles.knowledgeContent}>{task.knowledgeCard.content}</Text>
                    {task.knowledgeCard.source ? (
                        <Text className={styles.knowledgeSource}>来源：{task.knowledgeCard.source}</Text>
                    ) : null}
                    <Text className={styles.knowledgeReward}>已获得「{task.reward}」</Text>
                </View>
            )}

            <View className={styles.footTip}>
                <Text className={styles.footTipText}>
                    步骤进度保存在本机，用于现场研学记录；正式运营后将同步到后端研学档案。
                </Text>
            </View>
        </ScrollView>
    )
}

export default TaskDetailPage
