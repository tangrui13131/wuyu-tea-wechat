import React, { useRef, useState } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

/**
 * SpotlightCard —— 触屏高光卡片。
 *
 * 设计取舍：
 * 1. 小程序没有 hover / mousemove，只有触摸事件，所以「鼠标跟随光斑」改成「手指按住时
 *    在触点位置透出一圈柔光」，抬起淡出——同样的质感，但是触摸语义。
 * 2. 触点坐标必须是「相对组件自身」的像素值：touch 事件只给 clientX/clientY，所以按下时
 *    用 Taro.createSelectorQuery 取一次 boundingClientRect 缓存下来，后续 move 直接相减，
 *    避免每次移动都查一次节点（那才是真的卡）。
 * 3. 查询是异步的，且可能失败（页面未就绪）：失败就当普通可点卡片，高光不出现，不影响点击。
 * 4. move 事件按 50ms 节流：setState 频率过高会让小程序的逻辑层 setData 排队，触屏滑动手感变粘。
 * 5. 所有视觉都压在 transform / opacity 上，光斑本身是 radial-gradient 背景，不做逐帧重排。
 */
export interface SpotlightCardProps {
    children?: React.ReactNode
    /** 追加类名（通常传页面自己的卡片类，让布局与原来一致） */
    className?: string
    /** 高光颜色，默认暖白 */
    glowColor?: string
    onClick?: () => void
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
    children,
    className = '',
    glowColor = 'rgba(255, 255, 255, 0.42)',
    onClick
}) => {
    const [pressed, setPressed] = useState(false)
    const [point, setPoint] = useState({ x: 0, y: 0 })
    const rectRef = useRef<{ left: number; top: number } | null>(null)
    const lastUpdateRef = useRef(0)

    const queryRect = () => {
        try {
            Taro.createSelectorQuery()
                .select(`.${styles.root}`)
                .boundingClientRect((rect: any) => {
                    if (rect && typeof rect.left === 'number') {
                        rectRef.current = { left: rect.left, top: rect.top }
                    }
                })
                .exec()
        } catch (e) {
            rectRef.current = null
        }
    }

    const handleTouchStart = (e: any) => {
        const touch = e?.touches?.[0] || e?.changedTouches?.[0]
        setPressed(true)
        rectRef.current = null
        queryRect()
        if (touch) {
            // 还没拿到 rect 时先按「触点相对视口」兜底，光斑可能略偏，但不会不显示
            setPoint({ x: touch.clientX ?? touch.pageX ?? 0, y: touch.clientY ?? touch.pageY ?? 0 })
        }
    }

    const handleTouchMove = (e: any) => {
        const now = Date.now()
        if (now - lastUpdateRef.current < 50) return
        lastUpdateRef.current = now
        const touch = e?.touches?.[0] || e?.changedTouches?.[0]
        if (!touch) return
        const rect = rectRef.current
        const x = (touch.clientX ?? touch.pageX ?? 0) - (rect ? rect.left : 0)
        const y = (touch.clientY ?? touch.pageY ?? 0) - (rect ? rect.top : 0)
        setPoint({ x, y })
    }

    const handleTouchEnd = () => {
        setPressed(false)
    }

    const glowStyle: React.CSSProperties = {
        background: `radial-gradient(circle at ${point.x}px ${point.y}px, ${glowColor} 0%, rgba(255, 255, 255, 0) 62%)`
    }

    return (
        <View
            className={`${styles.root} ${pressed ? styles.pressed : ''} ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onClick={onClick}
        >
            {children}
            <View className={styles.glow} style={glowStyle} />
        </View>
    )
}

export default SpotlightCard
