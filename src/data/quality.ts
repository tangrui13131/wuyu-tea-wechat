// 品质数据 Mock 数据
export interface QualityData {
    title: string
    chashanTea: {
        value: number
        unit: string
    }
    normalTea: {
        value: number
        unit: string
    }
    description: string
    /** 风味解读微标签（卡片标题右侧的绿胶囊，如「鲜爽度 ↑ 约 3 倍」） */
    benefit: string
}

// 顺序按叙事排：头牌指标（氨基酸）→ 最大优势（富硒 5.6 倍）→ 两项「越低越好」（茶多酚/咖啡碱）
export const qualityData: QualityData[] = [
    {
        title: '氨基酸含量',
        chashanTea: { value: 6.8, unit: '%' },
        normalTea: { value: 2.3, unit: '%' },
        description: '槎山白茶氨基酸含量是普通绿茶的 3 倍，造就了鲜爽回甘的口感',
        benefit: '鲜爽度 ↑ 约 3 倍'
    },
    {
        title: '硒元素含量',
        chashanTea: { value: 0.28, unit: 'mg/kg' },
        normalTea: { value: 0.05, unit: 'mg/kg' },
        description: '富硒土壤孕育的天然富硒茶，具有抗氧化功效',
        benefit: '天然富硒 ↑ 5.6 倍'
    },
    {
        title: '茶多酚含量',
        chashanTea: { value: 18.5, unit: '%' },
        normalTea: { value: 22.1, unit: '%' },
        description: '适中的茶多酚含量，使白茶更加温和不刺激',
        benefit: '苦涩感 ↓ 汤感更柔和'
    },
    {
        title: '咖啡碱含量',
        chashanTea: { value: 2.1, unit: '%' },
        normalTea: { value: 3.5, unit: '%' },
        description: '较低的咖啡碱含量，晚上饮用也不易影响睡眠',
        benefit: '低咖啡碱 ↓ 温润少刺激'
    }
]

export const geographyData = {
    // 产茶带小标题（设计稿 belt-header）
    belt: {
        title: '北纬 31 度黄金产茶带',
        badge: '核心产区'
    },
    // 经纬罗盘通栏：label=眉标、dir=方位词前缀、value=度数
    coords: [
        { label: '地理纬度 · LAT', dir: '北纬', value: '31.2°' },
        { label: '地理经度 · LON', dir: '东经', value: '113.8°' }
    ],
    // 四宫格风物参数：label 与 value 分离——旧版把 label 嵌进 value
    // （temperature: '年平均气温 15.8℃'），页面渲染成「年均气温 年平均气温 15.8℃」重复。
    // unit 为空串 = 文字型指标（土壤），样式层据此换 param-text-val；icon 为 Icon 组件名。
    params: [
        { label: '海拔高度', value: '300-500', unit: '米', icon: 'mountain' },
        { label: '年平均气温', value: '15.8', unit: '°C', icon: 'thermometer' },
        { label: '年降水量', value: '1100', unit: 'mm', icon: 'droplet' },
        { label: '土壤类型', value: '富硒黄棕壤', unit: '', icon: 'shield' }
    ],
    // 底部风物按语：分段，hl=true 的段渲染为金点下划线强调（设计稿 summary-highlight）
    summary: [
        { text: '槎山位于' },
        { text: '北纬 31° 黄金产茶带', hl: true },
        { text: '，海拔适中，气候温和，雨量充沛，土壤富含天然' },
        { text: '硒元素', hl: true },
        { text: '，是孕育高品质白茶的理想生态秘境。' }
    ] as Array<{ text: string; hl?: boolean }>
}
