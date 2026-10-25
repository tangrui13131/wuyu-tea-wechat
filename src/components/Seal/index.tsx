import React from 'react'
import { View, Text } from '@tarojs/components'
import { rpx2px } from '@/utils/unit'
import styles from './index.module.scss'

/**
 * Seal —— 印章 / 签章 / 落款。
 *
 * 为什么值得单独做一个组件：
 * 国风页面的「可信感」很大程度来自落款——一张图配一枚朱印，立刻从「设计稿」变成「文档」。
 * 但印章极容易做脏：字体一换、边角一圆、颜色一艳，就变成对话框水印。
 * 这里把三条规矩固化下来：
 * 1. 颜色只能用 $color-seal（朱红），不要跟暖金抢；
 * 2. 字用宋体栈（$font-family-seal），1~2 个字，竖排；
 * 3. 必须带颗粒层，边缘轻微旋转（默认 -4deg），别摆得笔直。
 *
 * 用法：
 *   <Seal text='槎山' size={64} />                  // 白文（红底白字）
 *   <Seal text='研学' size={72} variant='yang' />   // 朱文（白底红框），浅底页面更雅
 */
export interface SealProps {
    /** 印文，1~2 个字最好看，超过 3 个字会挤 */
    text?: string
    /** 边长（rpx），默认 64 */
    size?: number
    /** yin=白文（红底白字，最像公章）/ yang=朱文（白底红框） */
    variant?: 'yin' | 'yang'
    /** 旋转角度（deg），默认 -4，摆正会显得像贴图 */
    rotate?: number
    opacity?: number
    className?: string
    style?: React.CSSProperties
}

const Seal: React.FC<SealProps> = ({
    text = '槎山',
    size = 64,
    variant = 'yin',
    rotate = -4,
    opacity = 0.92,
    className,
    style
}) => {
    const chars = text.split('').slice(0, 3)
    const px = rpx2px(size)
    // 单字占边长的 56%，两字各占 40%，三字收到 32%，字与字之间留出朱白对比
    const ratio = chars.length === 1 ? 0.56 : chars.length === 2 ? 0.42 : 0.32
    const fontSize = rpx2px(size * ratio)

    return (
        <View
            className={`${styles.seal} ${variant === 'yang' ? styles.yang : styles.yin} ${className || ''}`}
            style={{
                width: `${px}px`,
                height: `${px}px`,
                transform: `rotate(${rotate}deg)`,
                opacity,
                ...style
            }}
        >
            {chars.map((c, i) => (
                <Text key={`${c}-${i}`} className={styles.char} style={{ fontSize: `${fontSize}px` }}>
                    {c}
                </Text>
            ))}
            <View className={styles.grain} />
        </View>
    )
}

export default Seal
