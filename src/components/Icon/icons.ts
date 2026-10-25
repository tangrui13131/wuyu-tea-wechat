/**
 * 图标路径库 —— 单色线性图标，24×24 网格，stroke 1.8，圆角端点。
 *
 * 为什么不用 emoji：
 * 1. emoji 由系统字体渲染，iOS / Android / 微信版本之间字形、颜色、基线完全不同，
 *    同一页面在不同手机上「图标」长得不一样，严肃产品不能接受。
 * 2. emoji 无法跟随文字颜色（金色标题旁的 emoji 仍是彩色），无法统一描边粗细，
 *    是「AI 生成界面」最强的视觉指纹。
 * 3. 小程序 WXML 不支持内联 <svg>，所以这里只存路径片段，由 Icon 组件拼成
 *    `data:image/svg+xml` 后交给 background-image —— 与 src/pages/study/index.scss
 *    里 $icon-* 的手写 data URI 是同一套已验证可行的方案。
 *
 * 新增图标：只写内部元素（path / circle / rect），保持 24 网格、stroke 描边、
 * 不写 fill（组件统一 fill='none'）。
 */
export type IconName =
    | 'tea'
    | 'leaf'
    | 'sprout'
    | 'check'
    | 'square'
    | 'close'
    | 'pin'
    | 'clock'
    | 'search'
    | 'map'
    | 'gear'
    | 'lock'
    | 'volume'
    | 'camera'
    | 'medal'
    | 'share'
    | 'bulb'
    | 'note'
    | 'graduation'
    | 'book'
    | 'flag'
    | 'mountain'
    | 'hands'
    | 'basket'
    | 'jar'
    | 'gift'
    | 'pagoda'
    | 'fire'
    | 'users'
    | 'farmer'
    | 'chef'
    | 'star'
    | 'route'
    | 'thermometer'
    | 'droplet'
    | 'shield'
    | 'crosshair'
    | 'arrowRight'

export const ICON_PATHS: Record<IconName, string> = {
    // 茶：茶杯 + 热气
    tea: "<path d='M4.5 10h11v4.2a5.5 5.5 0 0 1-11 0z'/><path d='M15.5 11h2.2a2.4 2.4 0 0 1 0 4.8h-2.2'/><path d='M7.6 3.6c0 1 .9 1.3.9 2.4'/><path d='M11.2 3.6c0 1 .9 1.3.9 2.4'/>",
    // 叶
    leaf: "<path d='M19.5 4.5C10.5 4.2 4.5 8.6 4.5 15.2c0 1.9.7 3.3 1.8 4.3 1.9-6.6 6.3-10.4 13.2-11'/><path d='M4.9 19.9c1.8-4.4 5-7.5 9.4-9.5'/>",
    // 嫩芽
    sprout: "<path d='M12 21v-7.4'/><path d='M12 13.6c0-3.1 2.1-5.2 5.3-5.2 0 3.1-2.1 5.2-5.3 5.2z'/><path d='M12 16.4c0-3.1-2.1-5.2-5.3-5.2 0 3.1 2.1 5.2 5.3 5.2z'/>",
    check: "<path d='M4.8 12.6l4.6 4.6 9.8-10'/>",
    square: "<rect x='4' y='4' width='16' height='16' rx='3.2'/>",
    close: "<path d='M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8'/>",
    pin: "<path d='M12 21.2s6.8-6.2 6.8-10.8a6.8 6.8 0 1 0-13.6 0C5.2 15 12 21.2 12 21.2z'/><circle cx='12' cy='10.1' r='2.5'/>",
    clock: "<circle cx='12' cy='12' r='8.2'/><path d='M12 7.4V12l3.1 2'/>",
    search: "<circle cx='11' cy='11' r='6.4'/><path d='M15.8 15.8l4.4 4.4'/>",
    map: "<path d='M3.4 6.6l5-2.1 7.2 2.5 5-2.1v13l-5 2.1-7.2-2.5-5 2.1z'/><path d='M8.4 4.5v13M15.6 6.9v13'/>",
    gear: "<circle cx='12' cy='12' r='3.1'/><path d='M12 3.4v2.3M12 18.3v2.3M4.9 12h2.3M16.8 12h2.3M7 7l1.6 1.6M15.4 15.4L17 17M17 7l-1.6 1.6M8.6 15.4L7 17'/>",
    lock: "<rect x='4.6' y='10.4' width='14.8' height='9.6' rx='2.4'/><path d='M8.2 10.4V8.1a3.8 3.8 0 0 1 7.6 0v2.3'/><path d='M12 14.4v2.2'/>",
    volume: "<path d='M4 9.6h3.4L12 6.2v11.6L7.4 14.4H4z'/><path d='M15.4 9.2a4 4 0 0 1 0 5.6'/><path d='M17.8 6.8a7.4 7.4 0 0 1 0 10.4'/>",
    camera: "<rect x='3' y='7.6' width='18' height='12' rx='2.6'/><circle cx='12' cy='13.6' r='3.3'/><path d='M8.6 7.6l1.4-2.1h4l1.4 2.1'/>",
    medal: "<circle cx='12' cy='14.6' r='5.1'/><path d='M8.6 9.9L6.2 3.6h11.6l-2.4 6.3'/><path d='M12 12.6v4'/>",
    share: "<path d='M12 15.6V4'/><path d='M8 8L12 4l4 4'/><path d='M5 12.6v6.8h14v-6.8'/>",
    bulb: "<path d='M9.2 17.2h5.6'/><path d='M10.2 20.2h3.6'/><path d='M12 3.4a6 6 0 0 1 3.5 10.9v2.9h-7v-2.9A6 6 0 0 1 12 3.4z'/>",
    note: "<path d='M6.2 3.6h7.6l4.2 4.2v12.6H6.2z'/><path d='M13.8 3.6v4.2h4.2'/><path d='M9 12.6h6M9 16.2h4.2'/>",
    graduation: "<path d='M12 3.8L2.6 8.4 12 13l9.4-4.6L12 3.8z'/><path d='M6.6 10.9v4.2c0 1.4 2.4 2.8 5.4 2.8s5.4-1.4 5.4-2.8v-4.2'/><path d='M21.4 8.4v4.6'/>",
    book: "<path d='M4.2 5.6c2.9-1.2 5.9-1.2 7.8 0 1.9-1.2 4.9-1.2 7.8 0v12.9c-2.9-1.2-5.9-1.2-7.8 0-1.9-1.2-4.9-1.2-7.8 0z'/><path d='M12 5.6v12.9'/>",
    flag: "<path d='M6.2 21V3.6'/><path d='M6.2 4.8c4-1.6 7 1.6 11 0v8.2c-4 1.6-7-1.6-11 0z'/>",
    mountain: "<path d='M3 19.2l6-9.2 3.9 5.6 2.5-3.5 4.6 7.1z'/><circle cx='17.4' cy='6.4' r='1.9'/>",
    hands: "<path d='M8.4 12.2V6.6a1.7 1.7 0 0 1 3.4 0v4.4'/><path d='M11.8 11V5.1a1.7 1.7 0 0 1 3.4 0v5.9'/><path d='M15.2 11V6.6a1.7 1.7 0 0 1 3.4 0V14a6.2 6.2 0 0 1-6.2 6.2h-1A6.2 6.2 0 0 1 5.2 14v-2.6'/>",
    basket: "<path d='M4.2 9.2h15.6l-1.8 9.4a2.1 2.1 0 0 1-2.1 1.7H8.1a2.1 2.1 0 0 1-2.1-1.7z'/><path d='M8.6 9.2L12 3.6l3.4 5.6'/><path d='M9.4 13v3.4M14.6 13v3.4'/>",
    jar: "<path d='M7.2 8.2h9.6v9.6a2.6 2.6 0 0 1-2.6 2.6h-4.4a2.6 2.6 0 0 1-2.6-2.6z'/><path d='M6 8.2h12'/><path d='M9.6 11.8c1.4 1.2 3.4 1.2 4.8 0'/>",
    gift: "<rect x='3.6' y='9.2' width='16.8' height='10.8' rx='2.2'/><path d='M3.6 13.4h16.8M12 9.2v10.8'/><path d='M12 9.2C10 9.2 8 8.4 8 6.7A2.2 2.2 0 0 1 12 6a2.2 2.2 0 0 1 4 .7c0 1.7-2 2.5-4 2.5z'/>",
    pagoda: "<path d='M12 3.2l7.2 4.2H4.8z'/><path d='M6.8 7.4v2.4M17.2 7.4v2.4'/><path d='M8.4 9.8h7.2v2.6H8.4z'/><path d='M7.2 16.2h9.6v4.2H7.2z'/><path d='M12 12.4v3.8'/><path d='M5.4 20.4h13.2'/>",
    fire: "<path d='M12 21c3.4 0 6.1-2.4 6.1-5.6C18.1 11 12 3.6 12 3.6S5.9 11 5.9 15.4C5.9 18.6 8.6 21 12 21z'/><path d='M12 17.6c1.3 0 2.4-1 2.4-2.3 0-1.7-2.4-4.4-2.4-4.4s-2.4 2.7-2.4 4.4c0 1.3 1.1 2.3 2.4 2.3z'/>",
    users: "<circle cx='9.2' cy='8.4' r='3.3'/><path d='M3.4 19.8c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2'/><path d='M15.8 6a3.3 3.3 0 0 1 0 6.4'/><path d='M16.8 14.9c2.4.4 4 2.3 4 4.9'/>",
    farmer: "<circle cx='12' cy='10.6' r='3'/><path d='M6.4 20.8c0-3.2 2.5-5.4 5.6-5.4s5.6 2.2 5.6 5.4'/><path d='M6.2 7.4c0-1.7 2.6-2.9 5.8-2.9s5.8 1.2 5.8 2.9'/><path d='M7.6 7.4h8.8'/>",
    chef: "<circle cx='12' cy='11.6' r='2.9'/><path d='M6.6 20.8c0-3.2 2.4-5.3 5.4-5.3s5.4 2.1 5.4 5.3'/><path d='M8.4 8.6a3 3 0 0 1 5.3-2.2 2.7 2.7 0 0 1 2.1 4.4H9.6a2.5 2.5 0 0 1-1.2-2.2z'/>",
    star: "<path d='M12 3.8l2.7 5.4 6 .9-4.3 4.2 1 5.9L12 17.4l-5.4 2.8 1-5.9-4.3-4.2 6-.9z'/>",
    route: "<circle cx='6.4' cy='6.4' r='2.6'/><circle cx='17.6' cy='17.6' r='2.6'/><path d='M9 6.4h5.4a3.2 3.2 0 0 1 0 6.4H9.6a3.2 3.2 0 0 0 0 6.4H15'/>",
    // 温度计（地理参数 · 年平均气温）
    thermometer: "<path d='M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z'/>",
    // 水滴（地理参数 · 年降水量）
    droplet: "<path d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'/>",
    // 盾牌（地理参数 · 土壤类型）
    shield: "<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/>",
    // 罗盘十字（经纬通栏分隔）
    crosshair: "<circle cx='12' cy='12' r='8'/><path d='M12 2v20M2 12h20'/>",
    // 右箭头（按钮内「继续 / 开始」引导）
    arrowRight: "<path d='M5 12h14M13 6l6 6-6 6'/>"
}

/**
 * emoji → 图标名的兜底映射。
 *
 * 历史数据（data/*.ts 里的 emoji 字段）仍可能传来 emoji 字符串（含 ZWJ 组合与变体选择符），
 * Icon 组件会先查 EMOJI_TO_ICON 再查 ICON_PATHS，因此数据改造可以分批进行，
 * 漏改的地方不会渲染成「豆腐块」或空白。
 */
export const EMOJI_TO_ICON: Record<string, IconName> = {
    '🍵': 'tea',
    '🍃': 'leaf',
    '🌿': 'leaf',
    '🌱': 'sprout',
    '✓': 'check',
    '✅': 'check',
    '☑': 'check',
    '☐': 'square',
    '✕': 'close',
    '📍': 'pin',
    '🕒': 'clock',
    '🕐': 'clock',
    '🕓': 'clock',
    '🔍': 'search',
    '🗺': 'map',
    '🗺️': 'map',
    '⚙': 'gear',
    '⚙️': 'gear',
    '🔒': 'lock',
    '🔊': 'volume',
    '📷': 'camera',
    '🥇': 'medal',
    '🥈': 'medal',
    '🥉': 'medal',
    '🏅': 'medal',
    '📤': 'share',
    '💡': 'bulb',
    '📝': 'note',
    '📖': 'book',
    '🎓': 'graduation',
    '🚩': 'flag',
    '🏞': 'mountain',
    '🏞️': 'mountain',
    '🤲': 'hands',
    '🧺': 'basket',
    '🍯': 'jar',
    '🎁': 'gift',
    '🏯': 'pagoda',
    '🔥': 'fire',
    '👥': 'users',
    '👨‍🌾': 'farmer',
    '👨‍🍳': 'chef',
    '🍳': 'chef',
    '⭐': 'star',
    '🗺️🗺': 'map',
    '🧭': 'route'
}

/**
 * 图标色板 —— 与 src/styles/variables.scss 保持同值。
 * 原因是小程序 `data:image/svg+xml` 里的颜色必须写死在字符串里，无法用 CSS 变量；
 * 这里集中一处，改色时两边一起改（variables.scss 的注释里已标注本文件）。
 */
export const ICON_COLORS = {
    primary: '#4A7C59',
    primaryDark: '#2F5D3A',
    white: '#FFFFFF',
    onDark: '#F2F7F4',
    ink: '#1F2A24',
    secondary: '#4A564E',
    tertiary: '#66716A',
    accent: '#B98E4E',
    accentText: '#8A6631',
    warning: '#E37318',
    error: '#E54545',
    success: '#2BA471',
    // = variables.scss $quality-geo-green（品质页地理参数区：罗盘/等高线暗纹）
    geo: '#3F6148'
} as const

export type IconColor = keyof typeof ICON_COLORS
