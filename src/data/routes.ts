/**
 * 游览路线数据
 *
 * 严格对齐《商业计划书》3.2.1「场景化游览推荐」的三条差异化线路：
 *   ① 半日轻游线：茶园观光 + 白叶仙姑 NPC 初见 + 品茗体验
 *   ② 一日研学线：采茶 → 制茶工坊 → 双泉老茶农对话 → 红军交通员任务 → 生成研学报告
 *   ③ 文化深度线：双泉寺 → 李白品茶传说 → 白茶史 → 红色革命遗址
 *
 * 数据真实性约束（大纲 4.3「不得使用占位内容」）：
 *   - 所有节点坐标均取自 utils/location.ts 的 SCENE_LOCATIONS 真实景点，与地图/围栏同源；
 *   - 所有 relatedNPC 均为已接入智能体的真实 NPC；
 *   - 不虚构「儿童乐园/网红打卡点」等园区实际不存在的设施。
 *   原踩坑：旧版本曾使用 31.2/113.8 递增的编造坐标，已全部修正。
 */
import type { Route } from '@/types/route'
import { IMG } from '@/assets/images'

// 真实景点坐标（与 utils/location.ts 保持一致，避免两处维护漂移）
const P = {
    teaGarden: { latitude: 31.2892, longitude: 113.7528 },      // 茶园观光区
    whiteTeaTree: { latitude: 31.2898, longitude: 113.7520 },   // 白茶树景观区
    workshop: { latitude: 31.2880, longitude: 113.7540 },       // 制茶工坊
    temple: { latitude: 31.2875, longitude: 113.7545 },         // 双泉寺
    basket: { latitude: 31.2888, longitude: 113.7535 },         // 茶筐展示区
    redMemorial: { latitude: 31.2905, longitude: 113.7510 }     // 红色纪念点
}

export const routes: Route[] = [
    {
        id: 'route-light',
        name: '半日轻游线',
        description: '茶园观光 + 白叶仙姑初见 + 品茗体验，适合亲子周末游与短停留游客',
        coverImage: IMG.covers.routeHalfday,
        coverGradient: ['#9CC5A1', '#4A7C59'],
        coverEmoji: '🍃',
        estimatedDuration: '半天',
        difficulty: 'easy',
        tags: ['亲子周末游', '半天', '休闲观光', '轻松'],
        matchRules: {
            travelType: ['家庭', '个人'],
            duration: ['半天'],
            interests: ['休闲观光', '茶文化']
        },
        nodes: [
            {
                id: 'light-1',
                name: '茶园观光区',
                description: '漫步北纬31°白茶梯田，听白叶仙姑讲槎山白茶的由来',
                estimatedStay: '40 分钟',
                location: P.teaGarden,
                relatedNPC: 'npc-fairy',
                image: IMG.scenes.teaGarden,
            },
            {
                id: 'light-2',
                name: '白茶树景观区',
                description: '认识「白叶一号」品种特征，近距离观察白茶树形态',
                estimatedStay: '30 分钟',
                location: P.whiteTeaTree,
                relatedNPC: 'npc-fairy',
                image: IMG.scenes.whiteTeaTree,
            },
            {
                id: 'light-3',
                name: '制茶工坊·品茗体验',
                description: '在制茶工坊品一杯明前白茶，听老茶农讲冲泡的门道',
                estimatedStay: '40 分钟',
                location: P.workshop,
                relatedNPC: 'npc-tea-farmer',
                image: IMG.scenes.teaWorkshop,
            }
        ]
    },
    {
        id: 'route-study-deep',
        name: '一日研学线',
        description: '采茶 → 制茶工坊 → 双泉老茶农对话 → 红军交通员任务 → 生成研学报告',
        coverImage: IMG.covers.routeOneday,
        coverGradient: ['#C8D96F', '#4A7C59'],
        coverEmoji: '🎓',
        estimatedDuration: '一天',
        difficulty: 'medium',
        tags: ['中小学生研学', '一天', '茶文化', '红色教育', '研学报告'],
        matchRules: {
            travelType: ['研学'],
            duration: ['一天'],
            interests: ['茶文化', '红色教育', '农耕体验']
        },
        nodes: [
            {
                id: 'study-1',
                name: '茶园观光区·采茶',
                description: '背上茶篓下茶园，按一芽一叶标准亲手采摘鲜叶',
                estimatedStay: '60 分钟',
                location: P.teaGarden,
                relatedNPC: 'npc-fairy',
                image: IMG.scenes.teaGarden,
            },
            {
                id: 'study-2',
                name: '制茶工坊',
                description: '与双泉老茶农对话，了解摊青、杀青、揉捻、干燥的完整工序',
                estimatedStay: '90 分钟',
                location: P.workshop,
                relatedNPC: 'npc-tea-farmer',
                image: IMG.scenes.teaWorkshop,
            },
            {
                id: 'study-3',
                name: '茶筐展示区·红军任务',
                description: '接受红军交通员派发的情报任务，还原茶筐传信的历史场景',
                estimatedStay: '60 分钟',
                location: P.basket,
                relatedNPC: 'npc-soldier',
                image: IMG.scenes.teaBasket,
            },
            {
                id: 'study-4',
                name: '红色纪念点',
                description: '瞻仰红色革命遗址，完成研学任务后可一键生成专属研学报告',
                estimatedStay: '60 分钟',
                location: P.redMemorial,
                relatedNPC: 'npc-soldier',
                image: IMG.scenes.redMemorial,
            }
        ]
    },
    {
        id: 'route-culture',
        name: '文化深度线',
        description: '双泉寺 → 李白品茶传说 → 白茶史 → 红色革命遗址，适合文化爱好者与三月三民俗客流',
        coverImage: IMG.covers.routeCulture,
        coverGradient: ['#C49A6C', '#8B5E34'],
        coverEmoji: '🏯',
        estimatedDuration: '一天',
        difficulty: 'medium',
        tags: ['文化深度', '三月三民俗', '一天', '茶文化', '红色教育'],
        matchRules: {
            travelType: ['个人', '团建'],
            duration: ['一天'],
            // 含「民俗文化」：承接 BP 提到的三月三民俗客流画像
            interests: ['茶文化', '红色教育', '民俗文化']
        },
        nodes: [
            {
                id: 'culture-1',
                name: '双泉寺',
                description: '寻访千年古刹与双泉，听双泉老茶农讲李白品茶赋诗的传说',
                estimatedStay: '50 分钟',
                location: P.temple,
                relatedNPC: 'npc-tea-farmer',
                image: IMG.scenes.shuangquanTemple,
            },
            {
                id: 'culture-2',
                name: '白茶树景观区·白茶史',
                description: '从白叶一号品种到万里茶道，梳理槎山白茶的文化脉络',
                estimatedStay: '40 分钟',
                location: P.whiteTeaTree,
                relatedNPC: 'npc-fairy',
                image: IMG.scenes.whiteTeaTree,
            },
            {
                id: 'culture-3',
                name: '茶筐展示区',
                description: '了解安北起义时期茶筐传递情报的红色往事',
                estimatedStay: '50 分钟',
                location: P.basket,
                relatedNPC: 'npc-soldier',
                image: IMG.scenes.teaBasket,
            },
            {
                id: 'culture-4',
                name: '红色纪念点',
                description: '走进红色革命遗址，为这趟文化寻根之旅收尾',
                estimatedStay: '60 分钟',
                location: P.redMemorial,
                relatedNPC: 'npc-soldier',
                image: IMG.scenes.redMemorial,
            }
        ]
    }
]

/** 默认路线（未采集偏好 / 推荐失败时的兜底） */
export const getDefaultRoute = (): Route => routes[0]

export default routes
