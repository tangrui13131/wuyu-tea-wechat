import React from 'react'
import { View } from '@tarojs/components'
import { rpx2px } from '@/utils/unit'
import {
    MOTIF_COLORS,
    MOTIF_PATHS,
    MOTIF_VIEWBOX,
    type MotifColor,
    type MotifName
} from './motifs'

/**
 * Motif —— 国风线描纹样出口（页头分隔、页脚水波、卡片角饰）。
 *
 * 与 Icon 同一套实现（小程序不支持内联 svg，只能 data:image/svg+xml + background-image），
 * 区别是：
 * 1. 纹样是「宽阔装饰」，默认 `repeat-x` 横向平铺，height 决定线宽视觉密度；
 * 2. 颜色可以跟主题走，但一次只允许一色（金 / 墨 / 绿），不要在同一屏混两种纹样颜色。
 *
 * 用法：
 *   <Motif name='branch' height={16} color='accent' opacity={0.55} />   // 横向分隔
 *   <Motif name='vine' height={96} width={96} color='accent' opacity={0.18} />  // 角饰
 */
export interface MotifProps {
    /** 纹样名，默认 branch */
    name?: MotifName
    /** 颜色令牌名或任意 CSS 颜色 */
    color?: MotifColor | string
    /** 高度（rpx） */
    height?: number
    /** 宽度（rpx 数字或 '100%' 之类字符串），默认 100% */
    width?: number | string
    /** 是否横向平铺；竖向/角饰传 false */
    tile?: boolean
    /** 整体透明度，纹样一律压到 0.15~0.6，别让它抢正文 */
    opacity?: number
    className?: string
    style?: React.CSSProperties
}

const uriCache = new Map<string, string>()

function buildUri(name: MotifName, color: string): string {
    const key = `${name}|${color}`
    const hit = uriCache.get(key)
    if (hit) return hit
    const [w, h] = MOTIF_VIEWBOX[name]
    // ⚠ 每条路径都必须包成 <path d='…'/>：直接 join 成一串 d 字符串会被当成纯文本，
    //   SVG 照常能加载（宽高都对），但一个像素都不画 —— 曾因此以为「纹样太淡看不见」。
    const paths = (MOTIF_PATHS[name] || MOTIF_PATHS.branch)
        .map((d) => `<path d='${d}'/>`)
        .join('')
    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' fill='none' ` +
        `stroke='${color}' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'>` +
        `${paths}</svg>`
    const uri = `data:image/svg+xml,${encodeURIComponent(svg)}`
    uriCache.set(key, uri)
    return uri
}

const Motif: React.FC<MotifProps> = ({
    name = 'branch',
    color = 'accent',
    height = 16,
    width = '100%',
    tile = true,
    opacity = 0.5,
    className,
    style
}) => {
    const resolved = (MOTIF_COLORS as Record<string, string>)[color as string] || color || MOTIF_COLORS.accent
    const w = typeof width === 'number' ? `${rpx2px(width)}px` : width

    return (
        <View
            className={className}
            style={{
                width: w,
                height: `${rpx2px(height)}px`,
                backgroundImage: `url("${buildUri(name, resolved)}")`,
                backgroundSize: tile ? 'auto 100%' : 'contain',
                backgroundRepeat: tile ? 'repeat-x' : 'no-repeat',
                backgroundPosition: tile ? 'left center' : 'center',
                opacity,
                pointerEvents: 'none',
                flexShrink: 0,
                ...style
            }}
        />
    )
}

export default Motif
export type { MotifName, MotifColor }
