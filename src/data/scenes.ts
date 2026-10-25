// 槎山景点展示数据
// 坐标与触发半径统一复用 location.ts 的 SCENE_LOCATIONS（安陆槎山真实坐标），
// 本文件只补充展示层信息（文案、分类、亮点），避免坐标两处维护导致围栏与地图不一致。

import { SCENE_LOCATIONS } from '@/utils/location'

export type SceneCategory = '茶文化' | '红色文化' | '自然观光' | '手工体验'

export interface SceneDetail {
    id: string
    name: string
    category: SceneCategory
    icon: string // 分类图标
    summary: string // 一句话简介（列表/气泡用）
    description: string // 详细介绍
    highlights: string[] // 打卡亮点
    suggestedStay: string // 建议停留
    gradient: [string, string] // 卡片渐变色（与分类绑定）
    tips?: string // 游览提示
}

/** 分类视觉映射：图标 + 渐变色 */
export const CATEGORY_STYLE: Record<SceneCategory, { icon: string; gradient: [string, string] }> = {
    '茶文化': { icon: '🍵', gradient: ['#4A7C59', '#3D6B3C'] },
    '红色文化': { icon: '🚩', gradient: ['#C41E3A', '#8B1428'] },
    '自然观光': { icon: '🏞️', gradient: ['#7AB379', '#4A7C59'] },
    '手工体验': { icon: '🤲', gradient: ['#C49A6C', '#A87B4F'] }
}

export const SCENE_DETAILS: SceneDetail[] = [
    {
        id: 'scene-tea-garden',
        name: '茶园观光区',
        category: '自然观光',
        icon: '🏞️',
        summary: '700亩连片白茶园，北纬31°黄金产茶带',
        description:
            '槎山白茶园连片规模约700亩，地处北纬31°黄金产茶带，园内主体品种为白叶一号。' +
            '经检测，槎山白茶氨基酸含量约为普通绿茶的3倍，构成其鲜爽回甘的物质基础。' +
            '茶园依山势梯级种植，四季景致各异，是研学课程中观察茶树生长环境的实地课堂。',
        highlights: ['700亩连片茶园', '北纬31°黄金产茶带', '氨基酸含量为普通绿茶3倍'],
        suggestedStay: '30分钟',
        gradient: ['#7AB379', '#4A7C59'],
        tips: '建议清晨或傍晚游览，光线柔和且气温适宜'
    },
    {
        id: 'scene-white-tea-tree',
        name: '白茶树景观区',
        category: '茶文化',
        icon: '🍵',
        summary: '白叶仙姑传说发源地，玉白叶脉的珍稀茶树',
        description:
            '白茶树景观区集中展示白叶一号茶树：早春低温时叶片呈玉白色、叶脉翠绿，气温回升后转为绿白相间。' +
            '当地《槎山传奇》记载，白叶仙姑怜惜山民疾苦，洒下白茶种子造福一方，这片茶园因此得名。' +
            '在此可近距离观察白化期叶片特征，理解温度对茶树代谢的影响。',
        highlights: ['白叶仙姑传说', '白化期叶片观察', '温度与茶氨酸关系'],
        suggestedStay: '20分钟',
        gradient: ['#4A7C59', '#3D6B3C'],
        tips: '白化现象集中在早春，其他季节叶片为常规绿色'
    },
    {
        id: 'scene-shuangquan-temple',
        name: '双泉寺',
        category: '茶文化',
        icon: '🍵',
        summary: '五百年古刹，寺畔双泉常年不竭',
        description:
            '双泉寺已有500余年历史，因寺前两眼泉水常年不竭而得名，水质清冽甘甜，历代山民以此泉烹茶。' +
            '古刹与茶园相依，形成"寺在茶中、茶因寺名"的人文格局，是槎山茶文化的重要源头。' +
            '寺内现存碑刻记录了历代茶事活动，可作为研学的历史文献素材。',
        highlights: ['500余年历史', '双泉常年不竭', '茶禅一味人文渊源'],
        suggestedStay: '40分钟',
        gradient: ['#4A7C59', '#3D6B3C'],
        tips: '寺内请保持安静，尊重宗教场所礼仪'
    },
    {
        id: 'scene-tea-workshop',
        name: '制茶工坊',
        category: '手工体验',
        icon: '🤲',
        summary: '在用的制茶厂，可看杀青揉捻干燥全流程',
        description:
            '制茶工坊是槎山仍在正常使用的制茶厂，具备完整的白茶加工产线。' +
            '游客可在此观看摊青、杀青、揉捻、干燥四道核心工序，了解鲜叶如何变为成品茶。' +
            '研学课程中，学生可在师傅指导下体验手工揉捻，完成"小小制茶师"实践环节。',
        highlights: ['在用的真实制茶厂', '四道核心工序实景', '手工制茶体验'],
        suggestedStay: '90分钟',
        gradient: ['#C49A6C', '#A87B4F'],
        tips: '加工期机器运转，请跟随指引路线参观'
    },
    {
        id: 'scene-red-memorial',
        name: '红色纪念点',
        category: '红色文化',
        icon: '🚩',
        summary: '红军交通员足迹，槎山红色革命记忆',
        description:
            '土地革命时期，槎山一带是鄂豫皖根据地通往外线的重要通道，红军交通员常年穿行于茶山之间传递情报。' +
            '纪念点记录了这段历史，是面向青少年开展爱国主义教育的实景课堂。' +
            '红色主题研学在此开展沉浸式历史体验，学生可沿交通线徒步，理解当年情报传递的艰险。',
        highlights: ['红军交通员史实', '鄂豫皖根据地通道', '青少年爱国主义教育'],
        suggestedStay: '60分钟',
        gradient: ['#C41E3A', '#8B1428'],
        tips: '研学团队请提前预约讲解'
    },
    {
        id: 'scene-tea-basket',
        name: '茶筐展示区',
        category: '红色文化',
        icon: '🚩',
        summary: '茶筐传书：藏在茶筐里的情报',
        description:
            '茶筐传书是槎山流传的革命故事：交通员将情报藏于茶筐夹层，以采茶人身份往来于关卡之间，' +
            '凭借一担茶筐多次完成传递任务。展示区复原了当年的茶筐形制与夹层结构，' +
            '并配以史料说明，让参观者理解隐蔽战线斗争的智慧与风险。',
        highlights: ['茶筐传书故事', '茶筐夹层复原', '隐蔽战线斗争史实'],
        suggestedStay: '40分钟',
        gradient: ['#C41E3A', '#8B1428'],
        tips: '可与红色纪念点串联参观，故事线更完整'
    }
]

/** 完整景点信息 = 真实坐标（location.ts）+ 展示信息（本文件） */
export interface SceneFull {
    id: string
    name: string
    latitude: number
    longitude: number
    triggerRadius: number
    npcId: string
    category: SceneCategory
    icon: string
    summary: string
    description: string
    highlights: string[]
    suggestedStay: string
    gradient: [string, string]
    tips?: string
}

/** 合并坐标与展示信息；未配置详情的景点自动跳过（保证地图与围栏同源） */
export const getSceneFullList = (): SceneFull[] => {
    const detailMap = new Map(SCENE_DETAILS.map(d => [d.id, d]))
    return SCENE_LOCATIONS
        .filter(s => detailMap.has(s.id))
        .map(s => {
            const d = detailMap.get(s.id)!
            return {
                id: s.id,
                name: s.name,
                latitude: s.latitude,
                longitude: s.longitude,
                triggerRadius: s.triggerRadius,
                npcId: s.npcId,
                category: d.category,
                icon: d.icon,
                summary: d.summary,
                description: d.description,
                highlights: d.highlights,
                suggestedStay: d.suggestedStay,
                gradient: d.gradient,
                tips: d.tips
            }
        })
}

/** 园区中心点：取全部景点的几何中心，作为地图初始视野 */
export const getParkCenter = (): { latitude: number; longitude: number } => {
    const list = getSceneFullList()
    if (!list.length) return { latitude: 31.2892, longitude: 113.7528 }
    return {
        latitude: list.reduce((s, x) => s + x.latitude, 0) / list.length,
        longitude: list.reduce((s, x) => s + x.longitude, 0) / list.length
    }
}
