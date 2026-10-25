import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

/**
 * RubberSegment —— 胶囊分段选择器（滑块 + 回弹缓动）。
 *
 * 设计取舍：
 * 1. 只有 2~5 个互斥选项时用它；多选标签仍用 TagSelector。
 * 2. 滑块宽度按「容器 1/n」算，位置用 translateX(百分比)。注意 translateX 的百分比是
 *    「相对滑块自身宽度」，所以第 i 项要位移 i × 100%（不是 i × 100/n），这样不用拿容器
 *    真实像素宽度，也就避开了小程序端 createSelectorQuery 的异步与时机问题。
 * 3. 缓动用 cubic-bezier(0.34, 1.28, 0.64, 1) 制造轻微过冲，接近 iOS 分段控件手感。
 * 4. 不依赖任何 JS 动画：只在 onChange 时切 activeIndex，缓动交给 CSS transition。
 */
export interface RubberSegmentProps {
    options: string[]
    /** 当前选中项（受控） */
    value?: string
    onChange: (value: string) => void
    /** 追加类名，用于控制外边距等布局 */
    className?: string
}

const RubberSegment: React.FC<RubberSegmentProps> = ({ options, value, onChange, className = '' }) => {
    const count = Math.max(1, options.length)
    const rawIndex = value ? options.indexOf(value) : -1
    const activeIndex = rawIndex >= 0 ? rawIndex : 0

    return (
        <View className={`${styles.segment} ${className}`} style={{ '--seg-count': count } as any}>
            <View
                className={styles.slider}
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
            {options.map((option, index) => (
                <View
                    key={option}
                    className={`${styles.item} ${index === activeIndex ? styles.itemActive : ''}`}
                    onClick={() => onChange(option)}
                >
                    <Text className={styles.label}>{option}</Text>
                </View>
            ))}
        </View>
    )
}

export default RubberSegment
