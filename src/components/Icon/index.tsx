import React from 'react'
import { View } from '@tarojs/components'
import { rpx2px } from '@/utils/unit'
import {
    EMOJI_TO_ICON,
    ICON_COLORS,
    ICON_PATHS,
    type IconColor,
    type IconName
} from './icons'

/**
 * Icon —— 全站唯一的图标出口（替代 emoji）。
 *
 * 实现要点（都是踩过的坑）：
 * 1. 小程序 WXML 不支持内联 `<svg>`，所以图标以 `data:image/svg+xml` 塞进
 *    background-image。与 src/pages/study/index.scss 里的 $icon-* 同一方案。
 * 2. 尺寸走 `rpx2px` 换算（见 src/utils/unit.ts）：JSX 内联样式里的 `32rpx`
 *    在 H5 会被丢弃，元素尺寸归零、图标直接消失。
 * 3. data URI 拼装较费字符串操作，按 `name+color` 缓存，列表滚动时不重复构造。
 * 4. 颜色用 ICON_COLORS 令牌名（如 'primary'），也允许直接传 '#FF0000' 这种临时值；
 *    未知名字一律回退到 ink，绝不渲染成空白。
 */
export interface IconProps {
    /** 图标名，或历史遗留的 emoji 字符串（会自动映射） */
    name: IconName | string
    /** 尺寸（rpx），默认 32rpx，与 $font-size-md 同档 */
    size?: number
    /** 颜色令牌名或任意 CSS 颜色，默认 ink */
    color?: IconColor | string
    className?: string
    style?: React.CSSProperties
    onClick?: (e: any) => void
}

const uriCache = new Map<string, string>()

function buildUri(icon: IconName, color: string): string {
    const key = `${icon}|${color}`
    const hit = uriCache.get(key)
    if (hit) return hit
    const inner = ICON_PATHS[icon] || ICON_PATHS.leaf
    const svg =
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' " +
        `stroke='${color}' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>` +
        `${inner}</svg>`
    const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`
    uriCache.set(key, uri)
    return uri
}

const Icon: React.FC<IconProps> = ({
    name,
    size = 32,
    color = 'ink',
    className,
    style,
    onClick
}) => {
    const iconName: IconName = (EMOJI_TO_ICON[name] ||
        (name in ICON_PATHS ? (name as IconName) : 'leaf')) as IconName
    const resolved = (ICON_COLORS as Record<string, string>)[color as string] || color || ICON_COLORS.ink
    const px = rpx2px(size)

    return (
        <View
            className={className}
            onClick={onClick}
            style={{
                width: `${px}px`,
                height: `${px}px`,
                backgroundImage: `url("${buildUri(iconName, resolved)}")`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                flexShrink: 0,
                ...style
            }}
        />
    )
}

export default Icon
export type { IconName, IconColor }
