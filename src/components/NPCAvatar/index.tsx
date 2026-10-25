import React from 'react'
import { View, Image } from '@tarojs/components'
import styles from './index.module.scss'
import Icon from '@/components/Icon'
import { rpx2px } from '@/utils/unit'
import type { NPC } from '@/types/npc'

interface NPCAvatarProps {
    npc: NPC
    /** 直径，单位 rpx，默认 96 */
    size?: number
    /** 是否显示底部光晕 */
    glow?: boolean
}

/**
 * NPC 头像：优先渲染 `npc.avatar`（AI 生成的角色头像，走 src/assets/images 统一管理）；
 * 该字段为空时退回「渐变圆 + 线性图标」，「未配置素材」也不会出现裂图。
 * 尺寸用 rpx2px 输出 px —— 内联样式里的 rpx 在 H5 会失效（见 src/utils/unit.ts）。
 */
const NPCAvatar: React.FC<NPCAvatarProps> = ({ npc, size = 96, glow = false }) => {
    const gradient = `linear-gradient(135deg, ${npc.gradient?.[0] || '#4A7C59'} 0%, ${npc.gradient?.[1] || '#3D6B3C'} 100%)`
    const px = rpx2px(size)
    const boxStyle = { width: `${px}px`, height: `${px}px` }
    // 有真实素材就渲染图片；缺失时保留渐变+图标兜底，避免空图裂开
    if (npc.avatar) {
        return (
            <View className={`${styles.avatar} ${styles.avatarImage} ${glow ? styles.avatarGlow : ''}`} style={boxStyle}>
                <Image className={styles.avatarPic} src={npc.avatar} mode='aspectFill' />
            </View>
        )
    }
    return (
        <View
            className={`${styles.avatar} ${glow ? styles.avatarGlow : ''}`}
            style={{ ...boxStyle, background: gradient }}
        >
            <Icon name={npc.emoji || 'tea'} size={Math.round(size * 0.46)} color='white' />
        </View>
    )
}

export default NPCAvatar
