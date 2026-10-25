/**
 * 茶叶溯源静态数据（MVP）
 *
 * 用途：扫码 / 商城详情 / 品质页入口进入溯源页时展示。
 * 当前为静态数据，不依赖后端接口；图片字段统一留空，前端渲染
 * 「渐变 + emoji」占位（项目规范：不使用随机占位图）。
 * 后续接后端时，把 TRACE_LIST 换成接口数据即可，页面无需改动。
 */

export interface TraceTeaGarden {
    name: string
    area: string
    altitude: string
    soilType: string
    description: string
}

export interface TracePicking {
    date: string
    standard: string
    worker: string
    weather: string
}

export interface TraceProcessingStep {
    name: string
    value: string
}

export interface TraceProcessing {
    date: string
    steps: string[]
    keyParams: TraceProcessingStep[]
    master: string
}

export interface TraceTesting {
    qualityReport: string
    pesticideReport: string
    thirdParty?: string
}

export interface TraceData {
    /** 溯源记录 ID，与扫码 schema chashan://trace/{traceId} 对应 */
    traceId: string
    /** 关联的在售商品 ID（对应 src/data/products.ts 的 id），无关联可为空 */
    productId?: number
    productName: string
    productLevel: string
    netWeight: string
    productionDate: string
    shelfLife: string
    storageCondition: string
    manufacturer: string
    origin: string
    /** 占位视觉（无真实图时用渐变 + emoji） */
    emoji: string
    gradient: [string, string]
    teaGarden: TraceTeaGarden
    picking: TracePicking
    processing: TraceProcessing
    testing: TraceTesting
    brandStory: string
}

export const TRACE_LIST: TraceData[] = [
    {
        traceId: 'mingqian',
        productId: 1,
        productName: '槎山白茶·明前特级礼盒',
        productLevel: '特级',
        netWeight: '48g（4g×12罐）',
        productionDate: '2026-04-02',
        shelfLife: '18 个月',
        storageCondition: '密封、避光、阴凉干燥处',
        manufacturer: '安陆槎山白茶专业合作社',
        origin: '湖北·孝感·安陆槎山茶园',
        emoji: '🍃',
        gradient: ['#7AB379', '#3D6B3C'],
        teaGarden: {
            name: '槎山核心茶园',
            area: '白茶树景观区 · 东片坡地',
            altitude: '海拔 480 米',
            soilType: '黄棕壤（富硒）',
            description: '槎山地处北纬 31 度黄金产茶带，常年云雾缭绕、昼夜温差大，茶园土壤富含硒元素，造就了白茶鲜爽回甘的独特品质。'
        },
        picking: {
            date: '2026-03-28',
            standard: '一芽一叶初展',
            worker: '茶园春茶班（李阿姨等 6 人）',
            weather: '晴，气温 14~21℃，宜采'
        },
        processing: {
            date: '2026-03-29',
            steps: ['摊青', '萎凋', '杀青', '理条', '烘干', '提香'],
            keyParams: [
                { name: '萎凋时长', value: '8 小时（控温 22℃）' },
                { name: '杀青温度', value: '260℃ 短时快杀' },
                { name: '含水率', value: '≤ 6.5%' }
            ],
            master: '张师傅，制茶 30 年'
        },
        testing: {
            qualityReport: '感官审评 92 分（外形匀整、毫香显、汤色杏黄明亮、滋味鲜醇）；氨基酸含量 6.8%，为普通绿茶三倍。',
            pesticideReport: '农残 48 项全部未检出，符合 GB 2763 标准。',
            thirdParty: '（占位）湖北省茶叶质量检测中心报告待上传'
        },
        brandStory: '槎山白茶源于千年白茶树群落，相传白叶仙姑曾在此守护茶山。明前头采、古法六道工序，一盒茶里装的是整座山的春天。'
    },
    {
        traceId: 'kouliang',
        productId: 2,
        productName: '槎山白茶·富硒口粮茶',
        productLevel: '一级',
        netWeight: '250g（袋装）',
        productionDate: '2026-04-20',
        shelfLife: '18 个月',
        storageCondition: '密封、避光、阴凉干燥处',
        manufacturer: '安陆槎山白茶专业合作社',
        origin: '湖北·孝感·安陆槎山茶园',
        emoji: '🍵',
        gradient: ['#9CC5A1', '#4A7C59'],
        teaGarden: {
            name: '槎山生态茶园',
            area: '茶园观光区 · 北片梯田',
            altitude: '海拔 450 米',
            soilType: '黄棕壤（富硒）',
            description: '同一座槎山、同一片富硒土壤，口粮茶选用一芽二叶原料，性价比高，适合日常饮用与待客。'
        },
        picking: {
            date: '2026-04-15',
            standard: '一芽二叶',
            worker: '茶园春茶班（王师傅等 8 人）',
            weather: '多云转晴，气温 16~24℃'
        },
        processing: {
            date: '2026-04-16',
            steps: ['摊青', '萎凋', '杀青', '揉捻', '烘干'],
            keyParams: [
                { name: '萎凋时长', value: '6 小时' },
                { name: '揉捻程度', value: '轻揉成条' },
                { name: '含水率', value: '≤ 7%' }
            ],
            master: '王师傅，制茶 18 年'
        },
        testing: {
            qualityReport: '感官审评 86 分（香气清纯、滋味醇和、回甘明显）；硒含量 0.13 mg/kg，高于普通茶园。',
            pesticideReport: '农残 48 项全部未检出，符合 GB 2763 标准。'
        },
        brandStory: '一片叶子的日常陪伴。槎山富硒白茶不炒不揉、自然萎凋，把山里的好水土装进每一袋。'
    },
    {
        traceId: 'canxian',
        productName: '槎山白茶·春日尝鲜装',
        productLevel: '引流款',
        netWeight: '24g（4g×6罐）',
        productionDate: '2026-04-25',
        shelfLife: '18 个月',
        storageCondition: '密封、避光、阴凉干燥处',
        manufacturer: '安陆槎山白茶专业合作社',
        origin: '湖北·孝感·安陆槎山茶园',
        emoji: '🌱',
        gradient: ['#C8D96F', '#7AB379'],
        teaGarden: {
            name: '槎山核心茶园',
            area: '白茶树景观区 · 东片坡地',
            altitude: '海拔 480 米',
            soilType: '黄棕壤（富硒）',
            description: '与明前特级同源茶园，尝鲜装用稍晚一周的春料，保留白茶清甜，适合第一次认识槎山茶的朋友。'
        },
        picking: {
            date: '2026-04-10',
            standard: '一芽一叶',
            worker: '茶园春茶班',
            weather: '晴，气温 15~23℃'
        },
        processing: {
            date: '2026-04-11',
            steps: ['摊青', '萎凋', '杀青', '理条', '烘干'],
            keyParams: [
                { name: '萎凋时长', value: '7 小时' },
                { name: '杀青温度', value: '255℃' },
                { name: '含水率', value: '≤ 6.8%' }
            ],
            master: '张师傅，制茶 30 年'
        },
        testing: {
            qualityReport: '感官审评 88 分（清香显、汤色浅黄、鲜爽适口）；氨基酸含量 6.2%。',
            pesticideReport: '农残 48 项全部未检出，符合 GB 2763 标准。'
        },
        brandStory: '第一次喝槎山白茶，从这一小罐开始。春日的鲜，值得先尝为快。'
    }
]

export function getTraceByKey(traceId: string): TraceData | undefined {
    return TRACE_LIST.find(t => t.traceId === traceId)
}

/** 由在售商品 ID 反查溯源记录（商城详情页入口用） */
export function getTraceByProductId(productId: number): TraceData | undefined {
    return TRACE_LIST.find(t => t.productId === productId)
}
