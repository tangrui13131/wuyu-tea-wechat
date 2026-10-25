/**
 * 国风线描纹样（纯 SVG 路径，与 Icon 同一套机制）。
 *
 * 为什么放代码里而不是放图片：
 * 1. 纹样要跟主题色走（金/墨/绿三档），图片做不到换色，只能每个颜色存一张；
 * 2. 一张 240 宽的 PNG 线描要 20~40KB，而这几条路径加起来不到 1KB；
 * 3. 线宽需要跟字号/密度对齐，SVG 描边可以直接给 1.2 这种小数。
 *
 * 画法约定（新增纹样请遵守）：
 * - viewBox 高度固定 24~32，宽度 240（横向纹样），保证 `repeat-x` 平铺时节奏一致；
 * - 只用 stroke，不填色；stroke-width 1.1~1.3，端点圆头；
 * - 笔画之间留白要够，缩到 16rpx 高时仍能看出是「枝/波/藤」，不是一团线。
 */
export type MotifName = 'branch' | 'wave' | 'vine'

export const MOTIF_VIEWBOX: Record<MotifName, [number, number]> = {
    branch: [240, 32],
    wave: [240, 24],
    vine: [96, 96]
}

export const MOTIF_PATHS: Record<MotifName, string[]> = {
    // 茶枝：一条微微起伏的枝干 + 三片叶 + 一个芽头
    branch: [
        'M2 20 C 34 12, 62 24, 92 17 C 122 10, 160 22, 238 18',
        'M50 18 Q 58 4 72 9 Q 66 22 50 18 Z',
        'M56 17 Q 62 12 69 10',
        'M104 17 Q 112 30 126 26 Q 120 12 104 17 Z',
        'M108 17 Q 114 22 120 24',
        'M170 15 Q 178 1 192 6 Q 186 19 170 15 Z',
        'M176 14 Q 182 9 188 8',
        'M86 17 C 92 13, 98 13, 102 16'
    ],
    // 水波：两道相位错开的波纹，用作页脚/分隔
    wave: [
        'M0 9 Q 15 2 30 9 T 60 9 T 90 9 T 120 9 T 150 9 T 180 9 T 210 9 T 240 9',
        'M0 18 Q 15 11 30 18 T 60 18 T 90 18 T 120 18 T 150 18 T 180 18 T 210 18 T 240 18'
    ],
    // 缠枝：四分之一弧 + 两片叶 + 两点花苞，用在卡片角落
    vine: [
        'M3 93 C 3 52, 34 8, 93 3',
        'M22 62 Q 18 44 34 38 Q 40 54 22 62 Z',
        'M26 58 Q 28 48 34 44',
        'M56 26 Q 52 12 68 8 Q 74 22 56 26 Z',
        'M60 22 Q 62 14 68 11',
        'M44 76 a 3.2 3.2 0 1 0 0.1 0',
        'M66 56 a 2.4 2.4 0 1 0 0.1 0'
    ]
}

/** 纹样颜色令牌（值必须与 src/styles/variables.scss 一致，改色请两边一起改） */
export const MOTIF_COLORS = {
    accent: '#B98E4E',
    accentText: '#8A6631',
    primary: '#4A7C59',
    primaryDark: '#2F5D3A',
    ink: '#1F2A24',
    tertiary: '#66716A',
    seal: '#A83C2E',
    white: '#FFFFFF'
} as const

export type MotifColor = keyof typeof MOTIF_COLORS
