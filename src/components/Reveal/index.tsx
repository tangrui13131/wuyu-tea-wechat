import React, { useEffect, useRef, useState } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'

/**
 * Reveal —— 元素进入视口时播放入场动效的容器。
 *
 * 设计取舍：
 * 1. keyframes 与 `.anim-*` 工具类已存在于 src/styles/animations.scss（全局文件，类名不会被
 *    CSS Modules 改写），本组件只负责“什么时候加类名”，不重复定义动效，也不会再踩
 *    module 内 animation-name 被哈希成悬空名字的坑。
 * 2. 失败必须可见：页面实例缺失、观察器创建失败、元素始终未进入视口时，元素保持静态展示。
 *    动画类只是“锦上添花”，绝不用它来控制内容显隐。
 * 3. 只改 transform / opacity，走 GPU 合成，低端机也不掉帧。
 */

export type RevealVariant = 'fade-up' | 'fade-in' | 'pop-in' | 'scale-in'

export interface RevealProps {
    children?: React.ReactNode
    /** 动效类型，对应 animations.scss 里的 .anim-* 工具类 */
    variant?: RevealVariant
    /** 延迟（毫秒），用于同屏多元素错峰入场 */
    delay?: number
    /** 追加类名（通常传页面 CSS Module 的布局类，让动效直接作用在真实节点上） */
    className?: string
    /** 视口底部内缩量（px），值越大越晚触发 */
    offset?: number
    onClick?: () => void
}

const ANIM_CLASS: Record<RevealVariant, string> = {
    'fade-up': 'anim-fade-up',
    'fade-in': 'anim-fade-in',
    'pop-in': 'anim-pop-in',
    'scale-in': 'anim-scale-in'
}

const Reveal: React.FC<RevealProps> = ({
    children,
    variant = 'fade-up',
    delay = 0,
    className = '',
    offset = 0,
    onClick
}) => {
    const [shown, setShown] = useState(false)
    const markerRef = useRef(`rv-${Math.random().toString(36).slice(2, 9)}`)

    useEffect(() => {
        const marker = markerRef.current
        let observer: any = null
        try {
            const page = Taro.getCurrentInstance().page
            // H5 端没有 page 实例，直接保持静态展示
            if (!page) return
            observer = Taro.createIntersectionObserver(page, { thresholds: [0.01] })
            observer.relativeToViewport({ bottom: -Math.max(0, offset) })
            observer.observe(`.${marker}`, (res: { intersectionRatio: number }) => {
                if (res.intersectionRatio > 0) {
                    setShown(true)
                    observer?.disconnect()
                }
            })
        } catch (e) {
            // 观察失败不影响可见性：不加动画类即可
            observer = null
        }
        return () => {
            try {
                observer?.disconnect()
            } catch (e) {
                /* 忽略卸载期的重复 disconnect */
            }
        }
    }, [offset])

    const classNames = [markerRef.current]
    if (shown) classNames.push(ANIM_CLASS[variant])
    if (className) classNames.push(className)

    return (
        <View
            className={classNames.join(' ')}
            style={shown && delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
            onClick={onClick}
        >
            {children}
        </View>
    )
}

export default Reveal
