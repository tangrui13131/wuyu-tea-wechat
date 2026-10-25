/**
 * 前端服务层：统一走后端接口，接口不可用时降级到本地 mock
 * 页面只依赖本文件，不直接依赖 data/*，方便后续全量切真实接口
 */
import { request, requestWithFallback } from '@/utils/request'
import { routes as mockRoutes, getDefaultRoute } from '@/data/routes'
import { npcs as mockNpcs } from '@/data/npcs'
import { tasks as mockTasks } from '@/data/tasks'
import { qualityData as mockQuality, geographyData } from '@/data/quality'
import { researchThemes } from '@/data/research'
import { localProducts, localShopContact } from '@/data/products'
import type { Route } from '@/types/route'
import type { NPC } from '@/types/npc'
import type { Task } from '@/types/task'

/* ==================== 推荐服务 ==================== */

export const getRoutes = (): Promise<Route[]> =>
    requestWithFallback('/api/routes', {}, async () => mockRoutes)

export const getRoute = (code: string): Promise<Route> =>
    requestWithFallback(`/api/routes/${code}`, {}, async () =>
        (mockRoutes.find(r => r.id === code) || getDefaultRoute()) as Route)

export interface RecommendParams {
    travelType: string
    duration: string
    interests: string[]
}

// 离线兜底用的联动线路（后端不可达时也能展示，避免板块静默消失）
const mockComboRoutes = [
    { id: 1, name: '白兆山·槎山诗茶二日游', partnerScenic: '白兆山李白文化园', description: '白天访茶园采制白茶，傍晚登白兆山寻李白足迹，诗茶相映。', duration: '2天1晚', priceDesc: '¥680/人起', highlight: '诗茶双主题' },
    { id: 2, name: '钱冲银杏谷·槎山金秋摄影线', partnerScenic: '钱冲古银杏群落', description: '金秋钱冲千年银杏金黄，搭配槎山白茶品鉴与茶园晨雾摄影。', duration: '1天', priceDesc: '¥420/人起', highlight: '金秋摄影' },
    { id: 3, name: '府河湿地·槎山亲子自然课堂', partnerScenic: '府河国家湿地公园', description: '上午湿地观鸟自然课，下午茶园亲子采茶，动静结合。', duration: '1天', priceDesc: '¥360/家庭起', highlight: '亲子自然' }
]

export const recommend = (params: RecommendParams): Promise<any> =>
    requestWithFallback('/api/recommend', { method: 'POST', data: params }, async () => {
        // 本地降级：复用规则匹配逻辑。
        // 注意：导出名是 matchRoutes（复数，此前误写为 matchRoute 会直接报 not a function）；
        // 且它接收的 travelType 是数组，而 RecommendParams 的 travelType 是单值，需转换。
        const { matchRoutes } = require('@/utils/routeMatcher')
        const list = matchRoutes({
            travelType: params.travelType ? [params.travelType] : [],
            duration: params.duration || '',
            interests: params.interests || []
        } as any)
        const matched = list[0] || getDefaultRoute()
        const others = list.filter((r: any) => r.id !== matched.id)
        // 规则命中不足时用其余线路补齐，保证离线演示也能看到全部线路
        const alternatives = others.length
            ? others
            : mockRoutes.filter((r: Route) => r.id !== matched.id)
        return {
            recommended: matched,
            alternatives,
            comboRoutes: mockComboRoutes,
            stage: 1,
            stageName: '第一阶段规则推荐',
            cf: {
                active: false,
                similarUsers: 0,
                note: '离线演示：未连接后端，行为数据暂不可用，当前使用规则推荐'
            },
            rule: '本地规则推荐（离线演示）'
        }
    })

export const getComboRoutes = (): Promise<any[]> =>
    requestWithFallback('/api/combo-routes', {}, async () => [])

export const savePreferences = (data: RecommendParams) =>
    requestWithFallback('/api/user/preferences', { method: 'PUT', data }, async () => null)

/* ==================== NPC 对话服务 ==================== */

export const getNpcs = (): Promise<NPC[]> =>
    requestWithFallback('/api/npcs', {}, async () => mockNpcs)

export const getNpc = (code: string): Promise<NPC> =>
    requestWithFallback(`/api/npcs/${code}`, {}, async () =>
        (mockNpcs.find(n => n.id === code) || mockNpcs[0]) as NPC)

export const getChatHistory = (code: string) =>
    requestWithFallback(`/api/npcs/${code}/history`, {}, async () => [])

export interface ChatReply {
    reply: string
    provider: string
    state: 'pre' | 'task' | 'post'
    task: { id: string; title: string } | null
    taskCompleted: boolean
}

/** 对话：走后端智能体；离线时本地模拟 */
export const chatWithNpc = (code: string, message: string): Promise<ChatReply> =>
    requestWithFallback(`/api/npcs/${code}/chat`, { method: 'POST', data: { message } }, async () => {
        const npc = mockNpcs.find(n => n.id === code)
        return {
            reply: `（离线演示）${npc?.greeting || '客官好，有啥想问的？'}\n\n智能体未连接，这只是我的预设开场白。连上后端后我能真正和你对话。`,
            provider: 'mock',
            state: 'pre' as const,
            task: null,
            taskCompleted: false
        }
    })

/** 通用研学助手（生成专属研学任务单）：走后端 LLM，不再直连讯飞 */
export const assistantChat = (messages: Array<{ role: string; content: string }>): Promise<ChatReply> =>
    requestWithFallback('/api/chat/assistant', { method: 'POST', data: { messages } }, async () => {
        const last = messages[messages.length - 1]?.content || ''
        return {
            reply: `（离线演示）根据你的需求「${last.slice(0, 40)}」，暂生成如下任务单：\n1. 茶山漫步（40分钟）：认识白茶树，观察叶形\n2. 制茶车间参观（30分钟）：了解杀青、揉捻工艺\n3. 研学教室品茗（30分钟）：学习茶礼仪\n\n连上后端并接入智能体后，可生成个性化定制任务单。`,
            provider: 'mock',
            state: 'pre' as const,
            task: null,
            taskCompleted: false
        }
    })

export const resetNpcChat = (code: string) =>
    requestWithFallback(`/api/npcs/${code}/reset`, { method: 'POST' }, async () => null)

/* ==================== 研学服务 ==================== */

export const getStudyModules = (): Promise<any[]> =>
    requestWithFallback('/api/study/modules', {}, async () =>
        researchThemes.map((t: any) => ({
            id: t.id, name: t.title, category: t.category || '研学',
            durationHours: t.duration ? parseFloat(t.duration) : 2,
            gradeRange: t.gradeRange || '1-12年级',
            curriculumStandard: t.standard || '',
            description: t.description || '', capacity: 40, price: 0
        })))

export const createStudyPlan = (data: {
    name?: string; school?: string; contact?: string; moduleIds: string[]; studentsCount?: number
}) => request('/api/study/plans', { method: 'POST', data })

export const getStudyPlans = (): Promise<any[]> =>
    requestWithFallback('/api/study/plans', {}, async () => [])

export const getTasks = (): Promise<Task[]> =>
    requestWithFallback('/api/study/tasks', {}, async () => mockTasks)

export const getTask = (code: string): Promise<Task> =>
    requestWithFallback(`/api/study/tasks/${code}`, {}, async () =>
        (mockTasks.find(t => t.id === code) || mockTasks[0]) as Task)

export const completeTask = (code: string, photos: string[] = []) =>
    requestWithFallback(`/api/study/tasks/${code}/complete`, { method: 'POST', data: { photos } }, async () => ({
        taskId: code, points: 10, totalPoints: 0, completedCount: 0, knowledgeCard: ''
    }))

/* ==================== 研学课程 & 预约服务 ==================== */
import { localCourses, localBookings } from '@/data/studyCourses'

export const getCourses = (): Promise<any[]> =>
    requestWithFallback('/api/study/courses', {}, async () => localCourses)

export const getCourse = (code: string): Promise<any> =>
    requestWithFallback(`/api/study/courses/${code}`, {}, async () => {
        const c = localCourses.find(x => x.code === code)
        if (!c) throw new Error('课程不存在')
        return c
    })

export const createBooking = (data: {
    courseCode: string; sessionCode: string; contactName: string; phone: string;
    participantCount?: number; remark?: string
}) => request('/api/study/bookings', { method: 'POST', data })

export const getMyBookings = (): Promise<any[]> =>
    requestWithFallback('/api/study/bookings', {}, async () => localBookings)

export const cancelBooking = (code: string) =>
    request(`/api/study/bookings/${code}/cancel`, { method: 'POST' })

/* ==================== 品质数据服务 ==================== */

export const getQuality = (): Promise<any> =>
    requestWithFallback('/api/quality', {}, async () => ({
        grouped: {
            '氨基酸检测': mockQuality.map((q, i) => ({
                id: i + 1, metric: q.title, value: q.chashanTea.value,
                unit: q.chashanTea.unit, description: q.description
            })),
            // geographyData 已重构（belt/coords/params/summary 分区），旧 Object.entries 形式
            // 会取到嵌套对象，改为显式展开 coords + params，保持 {metric, standard} 形状
            '地理环境': [
                ...geographyData.coords.map((c, i) => ({
                    id: 100 + i, metric: c.label, value: 0, unit: '', standard: `${c.dir}${c.value}`
                })),
                ...geographyData.params.map((p, i) => ({
                    id: 110 + i, metric: p.label, value: 0, unit: p.unit, standard: p.value
                }))
            ]
        },
        list: []
    }))

export const getQualityCompare = (): Promise<any[]> =>
    requestWithFallback('/api/quality/compare', {}, async () =>
        mockQuality.map(q => ({
            metric: q.title,
            chashan: q.chashanTea,
            normal: q.normalTea,
            description: q.description,
            benefit: q.benefit
        })))

/* ==================== 商品 / 转化 ==================== */

export const getProducts = (scene?: string): Promise<any[]> =>
    requestWithFallback(`/api/shop/products${scene ? `?scene=${scene}` : ''}`, {}, async () => localProducts)

export const getShopContact = (): Promise<any> =>
    requestWithFallback('/api/shop/contact', {}, async () => localShopContact)

/* ==================== 报告 / 证书 ==================== */

export const generateReport = (data: { planId?: number; studentName?: string; school?: string }) =>
    request('/api/reports/generate', { method: 'POST', data })

export const generateCertificate = (data: { studentName?: string; school?: string; planId?: number }) =>
    request('/api/certificates/generate', { method: 'POST', data })

export const getMyReports = (): Promise<any[]> =>
    requestWithFallback('/api/reports', {}, async () => [])

export const getMyCertificates = (): Promise<any[]> =>
    requestWithFallback('/api/certificates', {}, async () => [])

/* ==================== 埋点 / 看板 ==================== */

let trackBuffer: any[] = []

/** 埋点上报（批量缓冲，避免频繁请求） */
export function track(event: string, page?: string, payload: any = {}) {
    trackBuffer.push({ event, page, payload })
    if (trackBuffer.length >= 5) flushTrack()
}

export async function flushTrack() {
    if (!trackBuffer.length) return
    const events = trackBuffer
    trackBuffer = []
    try {
        await request('/api/track/batch', { method: 'POST', data: { events } })
    } catch (e) {
        // 埋点失败不影响主流程
    }
}

export const getDashboard = (): Promise<any> =>
    requestWithFallback('/api/dashboard', {}, async () => null)
