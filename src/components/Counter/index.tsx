import React, { useEffect, useRef, useState } from 'react'
import { Text } from '@tarojs/components'

/**
 * Counter —— 数字滚动（0 → 目标值）。
 *
 * 设计取舍：
 * 1. 小程序端没有稳定的 requestAnimationFrame，用 setTimeout(≈30ms) 驱动，60 帧/秒左右足够
 *    数字滚动这种低频场景，且不会因为 rAF 缺失而完全不跑。
 * 2. 缓动用 easeOutCubic（先快后慢），比线性更「有落点」，结束时不会有突然刹停的突兀感。
 * 3. 只做数值插值 + setState，不碰 DOM；不用 CSS transform，避免和父级动画叠加。
 * 4. 值不变不重播：依赖 [value, duration]，页面 rerender 不会让数字反复从 0 跳。
 */
export interface CounterProps {
    /** 目标值 */
    value: number
    /** 动画时长（毫秒） */
    duration?: number
    /** 小数位，0 表示整数 */
    decimals?: number
    /** 前缀（如「¥」） */
    prefix?: string
    /** 后缀（如「%」「/6」） */
    suffix?: string
    /** 追加类名，用于复用父页面字号/颜色 */
    className?: string
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

const Counter: React.FC<CounterProps> = ({
    value,
    duration = 900,
    decimals = 0,
    prefix = '',
    suffix = '',
    className = ''
}) => {
    const target = Number.isFinite(value) ? value : 0
    const [display, setDisplay] = useState(0)
    const timerRef = useRef<any>(null)

    useEffect(() => {
        // 目标为 0 时直接显示 0，省掉一整轮定时器
        if (target === 0) {
            setDisplay(0)
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current)
            }
        }
        const startAt = Date.now()
        const tick = () => {
            const progress = Math.min(1, (Date.now() - startAt) / Math.max(1, duration))
            setDisplay(target * easeOutCubic(progress))
            if (progress < 1) {
                timerRef.current = setTimeout(tick, 32)
            } else {
                setDisplay(target)
            }
        }
        tick()
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [target, duration])

    const text = decimals > 0 ? display.toFixed(decimals) : String(Math.round(display))

    return (
        <Text className={className}>
            {prefix}
            {text}
            {suffix}
        </Text>
    )
}

export default Counter
