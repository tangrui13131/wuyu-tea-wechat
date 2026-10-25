import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import type { Task } from '@/types/task'

interface TaskCardProps {
    task: Task
    onClick?: () => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    const getThemeName = (theme: string) => {
        const themeMap: Record<string, string> = {
            tea: '茶文化',
            farming: '农耕体验',
            red: '红色教育'
        }
        return themeMap[theme] || theme
    }

    const getDifficultyName = (difficulty: string) => {
        const diffMap: Record<string, string> = {
            easy: '简单',
            medium: '中等',
            hard: '困难'
        }
        return diffMap[difficulty] || difficulty
    }

    const handleStartTask = () => {
        Taro.navigateTo({
            url: `/pages/task-detail/index?id=${task.id}`
        })
    }

    return (
        <View className={styles.taskCard} onClick={onClick}>
            <View className={styles.taskHeader}>
                <View className={styles.taskTheme}>
                    <Text className={styles.themeText}>{getThemeName(task.theme)}</Text>
                </View>
                <View className={styles.taskDifficulty}>
                    <Text className={styles.difficultyText}>{getDifficultyName(task.difficulty)}</Text>
                </View>
            </View>
            <View className={styles.taskContent}>
                <Text className={styles.taskTitle}>{task.title}</Text>
                <Text className={styles.taskDesc}>{task.description}</Text>
                <View className={styles.taskSteps}>
                    <Text className={styles.stepsLabel}>共 {task.steps.length} 个关卡</Text>
                </View>
                <View className={styles.taskAction} onClick={handleStartTask}>
                    <Text className={styles.actionText}>开始任务</Text>
                </View>
            </View>
        </View>
    )
}

export default TaskCard
