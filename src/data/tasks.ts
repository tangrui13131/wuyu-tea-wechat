// 任务 Mock 数据
import type { Task } from '@/types/task'

export const tasks: Task[] = [
    {
        id: 'task-tea-1',
        title: '观察杀青温度变化',
        description: '在制茶工坊观察杀青过程中的温度变化，记录关键数据',
        theme: 'tea',
        difficulty: 'medium',
        type: 'observation',
        npcId: 'npc-tea-farmer',
        steps: [
            {
                id: 'step-1',
                title: '到达制茶工坊',
                description: '前往制茶工坊参观区',
                npcGuidance: '娃子，到俺们制茶工坊来，让你看看杀青的讲究！',
                completionCondition: '到达制茶工坊位置',
                submitType: 'both'
            },
            {
                id: 'step-2',
                title: '观察杀青温度',
                description: '观察并记录杀青锅的温度变化',
                npcGuidance: '注意看这温度表，杀青温度可得控制在 280-320 度之间，高了低了都不行！',
                completionCondition: '记录温度变化数据',
                submitType: 'text'
            },
            {
                id: 'step-3',
                title: '记录发现',
                description: '写下你的观察发现',
                npcGuidance: '把你看到的、想到的都记下来，这可是学问！',
                completionCondition: '提交观察记录',
                submitType: 'text'
            }
        ],
        reward: '茶文化小学士勋章',
        knowledgeCard: {
            title: '杀青工艺小知识',
            content: '杀青是制茶的第一道工序，通过高温破坏鲜叶中的酶活性，防止茶叶氧化。槎山白茶采用传统锅炒杀青，温度控制在 280-320℃，时间约 5-8 分钟。',
            source: '《制茶工艺学》'
        }
    },
    {
        id: 'task-tea-2',
        title: '品鉴白茶香气',
        description: '在品茶区品尝槎山白茶，描述香气特征',
        theme: 'tea',
        difficulty: 'easy',
        type: 'experience',
        npcId: 'npc-fairy',
        steps: [
            {
                id: 'step-1',
                title: '品茶准备',
                description: '在品茶区就座，准备茶具',
                npcGuidance: '且静心，品茶乃雅事，需得心无杂念。',
                completionCondition: '拍照上传品茶场景',
                submitType: 'image'
            },
            {
                id: 'step-2',
                title: '闻香识茶',
                description: '闻茶香，描述香气类型',
                npcGuidance: '轻嗅茶香，可是有花香、果香、或是蜜香？',
                completionCondition: '描述香气特征',
                submitType: 'text'
            },
            {
                id: 'step-3',
                title: '品味茶汤',
                description: '品尝茶汤，记录口感体验',
                npcGuidance: '小口品饮，感受茶汤在舌尖的韵味。',
                completionCondition: '提交品茶心得',
                submitType: 'text'
            }
        ],
        reward: '品茶达人证书',
        knowledgeCard: {
            title: '白茶香气来源',
            content: '槎山白茶的独特香气来源于其特殊的生长环境和制作工艺。富硒土壤、适宜的海拔和气候条件，加上传统的制茶工艺，造就了白茶"三倍于普通绿茶"的氨基酸含量和独特花香。',
            source: '槎山白茶研究所'
        }
    },
    {
        id: 'task-farming-1',
        title: '体验采茶技艺',
        description: '在茶园学习并体验采茶技巧',
        theme: 'farming',
        difficulty: 'easy',
        type: 'experience',
        npcId: 'npc-tea-farmer',
        steps: [
            {
                id: 'step-1',
                title: '学习采茶手法',
                description: '观察茶农示范采茶动作',
                npcGuidance: '看好了，采茶要用指尖，不能用指甲，一芽一叶或一芽二叶最好！',
                completionCondition: '拍照记录学习过程',
                submitType: 'image'
            },
            {
                id: 'step-2',
                title: '亲手采茶',
                description: '亲自体验采茶',
                npcGuidance: '来，你自己试试，记住要轻采轻放！',
                completionCondition: '上传采茶成果照片',
                submitType: 'image'
            }
        ],
        reward: '采茶小能手徽章',
        knowledgeCard: {
            title: '采茶技巧',
            content: '采茶时应选择晴天上午，露水干后进行。采摘标准为一芽一叶或一芽二叶，用拇指和食指夹住茶梗，轻轻向上提折，避免损伤茶树。',
            source: '《茶叶栽培学》'
        }
    },
    {
        id: 'task-red-1',
        title: '寻找革命遗迹',
        description: '在红色纪念点打卡，学习革命历史',
        theme: 'red',
        difficulty: 'medium',
        type: 'checkin',
        npcId: 'npc-soldier',
        steps: [
            {
                id: 'step-1',
                title: '到达红色纪念点',
                description: '前往红色纪念点打卡',
                npcGuidance: '同志，这里就是我们当年传递情报的地方，来，拍个照留念！',
                completionCondition: '在纪念点位置打卡',
                submitType: 'image'
            },
            {
                id: 'step-2',
                title: '学习革命故事',
                description: '了解茶筐传情报的历史',
                npcGuidance: '当年我们就用这茶筐，把情报藏在茶叶里，躲过敌人的搜查！',
                completionCondition: '回答相关问题',
                submitType: 'text'
            },
            {
                id: 'step-3',
                title: '分享感悟',
                description: '写下你的学习感悟',
                npcGuidance: '革命先辈不容易啊，你有什么感想？',
                completionCondition: '提交感悟心得',
                submitType: 'text'
            }
        ],
        reward: '红色传承纪念章',
        knowledgeCard: {
            title: '茶筐传情报',
            content: '解放战争时期，安陆地区的地下党员利用茶筐运送茶叶作掩护，将情报藏在茶叶中，成功多次传递重要军事情报，为革命胜利作出了贡献。',
            source: '《大悟山革命史》'
        }
    }
]

export function getTaskById(id: string): Task | undefined {
    return tasks.find(task => task.id === id)
}

export function getTasksByTheme(theme: 'tea' | 'farming' | 'red'): Task[] {
    return tasks.filter(task => task.theme === theme)
}
