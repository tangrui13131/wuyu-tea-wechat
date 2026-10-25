import { IMG } from '@/assets/images'
/**
 * 研学任务数据结构
 */

export interface ResearchLevel {
    id: string
    levelId: number
    themeId: string
    name: string
    type: 'checkin' | 'observation' | 'qa' | 'experience'
    description: string
    npcGuidance: string
    completionCondition: string
    submissionType: 'location' | 'text' | 'answer' | 'image'
    minWords?: number  // 观察记录型最少字数
    keywords?: string[]  // 问答型关键词
    correctAnswer?: string  // 问答型正确答案
    knowledgeCard?: {
        title: string
        content: string
        source: string
    }
}

export interface ResearchTheme {
    id: string
    name: string
    npcId: string
    npcName: string
    description: string
    coverImage: string
    levelCount: number
    levels: ResearchLevel[]
    /** 卡片色带副题（如「寻味·槎山白茶」），只用于研学主题卡顶部；缺省时组件兜底 */
    bannerSubtitle?: string
    /** 主题色：tea 春辰绿 / farm 秋香 / red 茜草红，对应 ResearchCard 的 .theme-* 修饰类 */
    tone?: 'tea' | 'farm' | 'red'
}

// 研学主题数据
export const researchThemes: ResearchTheme[] = [
    {
        id: 'tea_culture',
        name: '茶文化研学',
        npcId: 'npc-fairy',
        npcName: '白叶仙姑',
        description: '探索白茶起源，品味千年茶文化',
        bannerSubtitle: '寻味·槎山白茶',
        tone: 'tea',
        coverImage: IMG.covers.themeTea,
        levelCount: 4,
        levels: [
            {
                id: 'tea_culture_l1',
                levelId: 1,
                themeId: 'tea_culture',
                name: '白叶寻踪',
                type: 'checkin',
                description: '前往白茶树景观区，找到那棵最古老的白茶树',
                npcGuidance: '你看到那棵老茶树了吗？它已经在这里站了数百年。走到它跟前，感受一下。',
                completionCondition: '定位在白茶树景观区范围内',
                submissionType: 'location',
                knowledgeCard: {
                    title: '白茶树王',
                    content: '山白茶树王已有数百年历史，是明代遗存。其叶色银白，芽头肥壮，是制作白毫银针的上佳原料。',
                    source: '《槎山传奇》第三章'
                }
            },
            {
                id: 'tea_culture_l2',
                levelId: 2,
                themeId: 'tea_culture',
                name: '传说记录',
                type: 'observation',
                description: '观察白茶树的叶色特征，记录你看到的现象',
                npcGuidance: '仔细看看它的叶子——和普通茶树有什么不同？把你的发现告诉我。',
                completionCondition: '提交≥20 字的观察记录',
                submissionType: 'text',
                minWords: 20,
                knowledgeCard: {
                    title: '白茶叶色特征',
                    content: '白茶叶背密披白毫，叶色银绿相间，这是其独特品种特征。白毫富含氨基酸，是白茶鲜爽口感的来源。',
                    source: '《中国茶经》'
                }
            },
            {
                id: 'tea_culture_l3',
                levelId: 3,
                themeId: 'tea_culture',
                name: '茶道问答',
                type: 'qa',
                description: '回答白叶仙姑关于万里茶道的问题',
                npcGuidance: '万里茶道从哪里出发，又走向何方？你来说说看。',
                completionCondition: '回答正确（关键词匹配）',
                submissionType: 'answer',
                keywords: ['武夷山', '恰克图', '俄罗斯', '茶叶贸易', '万里'],
                correctAnswer: '万里茶道从福建武夷山出发，经江西、湖南、湖北、河南、山西、河北、内蒙古，最终到达俄罗斯恰克图',
                knowledgeCard: {
                    title: '万里茶道',
                    content: '万里茶道是继丝绸之路之后又一条重要的国际商道，起于福建武夷山，终至俄罗斯圣彼得堡，全长 13000 多公里。',
                    source: '《万里茶道史》'
                }
            },
            {
                id: 'tea_culture_l4',
                levelId: 4,
                themeId: 'tea_culture',
                name: '民俗体验',
                type: 'experience',
                description: '在茶文化体验区完成一次茶礼体验，拍照记录',
                npcGuidance: '茶有茶礼，人以茶敬。去体验一次茶礼，拍下你敬茶的瞬间。',
                completionCondition: '上传 1 张照片',
                submissionType: 'image',
                knowledgeCard: {
                    title: '茶礼文化',
                    content: '中国茶礼讲究"和、静、怡、真"四字箴言。敬茶时双手捧杯，先敬长辈，体现尊老爱幼的传统美德。',
                    source: '《中国茶文化》'
                }
            }
        ]
    },
    {
        id: 'farming',
        name: '农耕体验研学',
        npcId: 'npc-tea-farmer',
        npcName: '双泉老茶农',
        description: '体验古法制茶，传承工匠精神',
        bannerSubtitle: '躬耕·四时田园',
        tone: 'farm',
        coverImage: IMG.covers.themeFarming,
        levelCount: 4,
        levels: [
            {
                id: 'farming_l1',
                levelId: 1,
                themeId: 'farming',
                name: '双泉探源',
                type: 'checkin',
                description: '前往双泉寺，找到那口古泉',
                npcGuidance: '来，先去看看双泉。没有好水，哪来好茶？走到泉边再说。',
                completionCondition: '定位在双泉寺范围内',
                submissionType: 'location',
                knowledgeCard: {
                    title: '双泉寺古泉',
                    content: '双泉寺因两股清泉而得名，泉水甘冽，自古就是制茶、泡茶的佳品。陆羽《茶经》曾记载此地泉水。',
                    source: '《茶经》'
                }
            },
            {
                id: 'farming_l2',
                levelId: 2,
                themeId: 'farming',
                name: '杀青观察',
                type: 'observation',
                description: '在制茶工坊观察杀青过程，记录温度和手法',
                npcGuidance: '杀青是制茶第一步，火候差一点，味道就变了。你看仔细了，记下来。',
                completionCondition: '提交≥20 字的观察记录',
                submissionType: 'text',
                minWords: 20,
                knowledgeCard: {
                    title: '白茶杀青工艺',
                    content: '白茶杀青温度控制在 180-220℃，采用"高温快炒"原则，破坏酶活性，保持绿叶清汤品质特征。',
                    source: '《制茶工艺学》'
                }
            },
            {
                id: 'farming_l3',
                levelId: 3,
                themeId: 'farming',
                name: '工艺问答',
                type: 'qa',
                description: '回答老茶农关于古法制茶工艺的问题',
                npcGuidance: '我考考你，白茶的杀青温度大概在多少度？揉捻又有什么讲究？',
                completionCondition: '回答正确（关键词匹配）',
                submissionType: 'answer',
                keywords: ['180', '220', '温度', '揉捻', '轻揉', '短时'],
                correctAnswer: '白茶杀青温度在 180-220 度，揉捻要轻揉短时，保持叶片完整',
                knowledgeCard: {
                    title: '白茶揉捻工艺',
                    content: '白茶揉捻讲究"轻、慢、短"，力度轻柔，时间短暂，以细胞破碎率 40-50% 为宜，保持茶条自然。',
                    source: '《制茶工艺学》'
                }
            },
            {
                id: 'farming_l4',
                levelId: 4,
                themeId: 'farming',
                name: '制茶体验',
                type: 'experience',
                description: '在制茶工坊完成一次揉捻体验，拍照记录',
                npcGuidance: '光看不练假把式。来，上手揉一把，我看看你有没有做茶的天赋。',
                completionCondition: '上传 1 张照片',
                submissionType: 'image',
                knowledgeCard: {
                    title: '制茶体验',
                    content: '亲手揉捻茶叶，感受叶片从僵硬到柔软的变化，体会制茶工匠的匠心精神。',
                    source: '实地体验'
                }
            }
        ]
    },
    {
        id: 'red_education',
        name: '红色教育研学',
        npcId: 'npc-soldier',
        npcName: '红军交通员',
        description: '追寻红色足迹，传承革命精神',
        bannerSubtitle: '铭记·峥嵘岁月',
        tone: 'red',
        coverImage: IMG.covers.themeRed,
        levelCount: 4,
        levels: [
            {
                id: 'red_education_l1',
                levelId: 1,
                themeId: 'red_education',
                name: '红色足迹',
                type: 'checkin',
                description: '前往红色纪念点，找到革命纪念碑',
                npcGuidance: '同志，先去纪念碑前站一站。那里刻着我们不能忘的名字。',
                completionCondition: '定位在红色纪念点范围内',
                submissionType: 'location',
                knowledgeCard: {
                    title: '槎山革命纪念碑',
                    content: '槎山是革命老区，解放战争时期这里是重要根据地。纪念碑铭刻着为革命牺牲的烈士英名。',
                    source: '《大悟山革命史》'
                }
            },
            {
                id: 'red_education_l2',
                levelId: 2,
                themeId: 'red_education',
                name: '情报解读',
                type: 'observation',
                description: '在茶筐展示区观察茶筐结构，记录茶筐如何藏匿情报',
                npcGuidance: '你看这个茶筐，看似普通，但当年情报就藏在夹层里。找找看，记下来。',
                completionCondition: '提交≥20 字的观察记录',
                submissionType: 'text',
                minWords: 20,
                knowledgeCard: {
                    title: '茶筐传情报',
                    content: '解放战争时期，地下党员将情报藏在特制茶筐的夹层中，以运送茶叶为掩护，成功传递了大量重要情报。',
                    source: '《中原突围史料》'
                }
            },
            {
                id: 'red_education_l3',
                levelId: 3,
                themeId: 'red_education',
                name: '历史问答',
                type: 'qa',
                description: '回答交通员关于千塘百坝运动的问题',
                npcGuidance: '千塘百坝，你知道是怎么回事吗？这可是我们那时候保命的根基。',
                completionCondition: '回答正确（关键词匹配）',
                submissionType: 'answer',
                keywords: ['灌溉', '农田', '水利', '生产', '支援前线'],
                correctAnswer: '千塘百坝运动是解放区开展的大规模水利建设运动，修建了大量塘坝用于灌溉农田，发展生产支援前线',
                knowledgeCard: {
                    title: '千塘百坝运动',
                    content: '1947 年，解放区开展千塘百坝运动，组织军民修建水利设施，灌溉农田百万亩，为解放战争胜利提供了物质保障。',
                    source: '《大悟山革命史》'
                }
            },
            {
                id: 'red_education_l4',
                levelId: 4,
                themeId: 'red_education',
                name: '红色传承',
                type: 'experience',
                description: '在红色纪念点完成一次献花/致敬仪式，拍照记录',
                npcGuidance: '去献一束花吧，替我看看那些老战友。拍下来，让更多人记得。',
                completionCondition: '上传 1 张照片',
                submissionType: 'image',
                knowledgeCard: {
                    title: '红色传承',
                    content: '铭记历史，缅怀先烈。每一次致敬都是对革命精神的传承，激励我们不忘初心，继续前进。',
                    source: '实地体验'
                }
            }
        ]
    }
]

/**
 * 获取研学主题列表
 */
export const getResearchThemes = (): ResearchTheme[] => {
    return researchThemes
}

/**
 * 根据 ID 获取研学主题
 */
export const getResearchThemeById = (id: string): ResearchTheme | null => {
    return researchThemes.find(theme => theme.id === id) || null
}

/**
 * 获取关卡数据
 */
export const getResearchLevel = (themeId: string, levelId: number): ResearchLevel | null => {
    const theme = getResearchThemeById(themeId)
    if (!theme) return null
    return theme.levels.find(level => level.levelId === levelId) || null
}
