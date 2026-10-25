import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import type { NPC } from '@/types/npc'
import NPCAvatar from '@/components/NPCAvatar'

interface NPCCardProps {
    npc: NPC
    isUnlocked?: boolean
    lastMessage?: string | null
    onClick?: () => void
}

const NPCCard: React.FC<NPCCardProps> = ({ npc, isUnlocked = false, lastMessage, onClick }) => {
    const handleCardClick = () => {
        // 统一由父组件的 onClick 处理
        if (onClick) {
            onClick()
        }
    }

    const handleChat = () => {
        if (!isUnlocked) {
            Taro.showToast({
                title: '请前往景点解锁',
                icon: 'none'
            })
            return
        }
        Taro.navigateTo({
            url: `/pages/npc-chat/index?id=${npc.id}`
        })
    }

    return (
        <View className={`${styles.npcCard} ${!isUnlocked ? styles.npcCardLocked : ''}`} onClick={handleCardClick}>
            <View className={styles.npcHeader}>
                <NPCAvatar npc={npc} size={96} />
                <View className={styles.npcInfo}>
                    <View className={styles.npcNameRow}>
                        <Text className={styles.npcName}>{npc.name}</Text>
                        {isUnlocked && (
                            <View className={styles.unlockedBadge}>
                                <Text className={styles.unlockedText}>已解锁</Text>
                            </View>
                        )}
                    </View>
                    <Text className={styles.npcTitle}>{npc.title}</Text>
                    {!isUnlocked && (
                        <Text className={styles.lockTip}>前往 {npc.triggerScenes?.[0] || '对应景点'} 解锁</Text>
                    )}
                </View>
                {npc.portrait && (
                    <Image className={styles.npcPortrait} src={npc.portrait} mode="aspectFill" />
                )}
            </View>
            <View className={styles.npcContent}>
                <Text className={styles.npcDesc}>{npc.description}</Text>
                {isUnlocked && lastMessage && (
                    <View className={styles.lastMessagePreview}>
                        <Text className={styles.lastMessageLabel}>最近对话：</Text>
                        <Text className={styles.lastMessageContent}>{lastMessage}</Text>
                    </View>
                )}
                <View className={styles.npcTags}>
                    {(npc.knowledgeDomain || []).slice(0, 3).map((domain, index) => (
                        <View key={index} className={styles.npcTag}>
                            <Text className={styles.npcTagText}>{domain}</Text>
                        </View>
                    ))}
                </View>
                <View
                    className={`${styles.npcAction} ${!isUnlocked ? styles.npcActionLocked : ''}`}
                    onClick={handleChat}
                >
                    <Text className={styles.actionText}>
                        {isUnlocked ? '开始对话' : '未解锁'}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default NPCCard
