// 运营看板演示数据
// 说明：后端 /api/dashboard 目前仅提供埋点类指标（客流、画像、兴趣、热门页面），
// 尚不包含「商品销量」与「研学预约」接口，这两项在真实接口上线前使用演示数据，
// 页面顶部会标注数据来源，避免把演示值误认为真实经营数据。

import type { ChartItem } from '@/components/DashboardChart'

export interface OverviewData {
    todayVisitors: number
    newUsers: number
    shopClicks: number
    taskCompletionRate: number
}

export interface BookingItem {
    id: string
    org: string
    type: string
    date: string
    people: number
    status: 'confirmed' | 'pending' | 'done'
}

export interface DashboardMock {
    overview: OverviewData
    trend: ChartItem[]
    hotSpots: ChartItem[]
    sales: ChartItem[]
    bookings: BookingItem[]
    profiles: ChartItem[]
    interests: ChartItem[]
}

/** 近 7 日客流：周末高于工作日，符合亲子/研学客群规律 */
export const DASHBOARD_MOCK: DashboardMock = {
    overview: {
        todayVisitors: 268,
        newUsers: 96,
        shopClicks: 154,
        taskCompletionRate: 78
    },
    trend: [
        { label: '周一', value: 152 },
        { label: '周二', value: 168 },
        { label: '周三', value: 145 },
        { label: '周四', value: 186 },
        { label: '周五', value: 224 },
        { label: '周六', value: 312 },
        { label: '周日', value: 286 }
    ],
    hotSpots: [
        { label: '茶园观光区', value: 412 },
        { label: '制茶工坊', value: 356 },
        { label: '双泉寺', value: 288 },
        { label: '红色纪念点', value: 234 },
        { label: '茶筐展示区', value: 186 },
        { label: '白茶树景观区', value: 152 }
    ],
    sales: [
        { label: '明前特级白茶', value: 38 },
        { label: '雨前一级白茶', value: 26 },
        { label: '白茶礼盒装', value: 18 },
        { label: '手工白茶饼', value: 12 },
        { label: '槎山茶点', value: 9 }
    ],
    bookings: [
        { id: 'bk-1', org: '武汉市江岸区某小学', type: '一日研学营', date: '09-12', people: 120, status: 'confirmed' },
        { id: 'bk-2', org: '孝感市某中学初二组', type: '红色文化主题', date: '09-15', people: 86, status: 'pending' },
        { id: 'bk-3', org: '武汉某研学机构', type: '白茶科学主题', date: '09-19', people: 60, status: 'confirmed' },
        { id: 'bk-4', org: '周末亲子散客团', type: '半日体验营', date: '09-07', people: 24, status: 'done' }
    ],
    profiles: [
        { label: '家庭亲子', value: 38 },
        { label: '研学团体', value: 27 },
        { label: '企事业单位', value: 18 },
        { label: '散客', value: 17 }
    ],
    interests: [
        { label: '茶文化', value: 34 },
        { label: '红色教育', value: 26 },
        { label: '手工体验', value: 22 },
        { label: '休闲观光', value: 18 }
    ]
}

/** 后端上报的页面路径 → 中文展示名 */
export const PAGE_LABEL_MAP: Record<string, string> = {
    'pages/home/index': '首页',
    'pages/npc/index': 'NPC互动',
    'pages/npc-chat/index': 'NPC对话',
    'pages/study/index': '研学任务',
    'pages/study-detail/index': '研学详情',
    'pages/study-task/index': '研学任务详情',
    'pages/task-detail/index': '任务详情',
    'pages/quality/index': '品质展示',
    'pages/route-detail/index': '园区导览',
    'pages/report/index': '研学报告',
    'pages/shop/index': '茶品商城',
    'pages/mine/index': '个人中心'
}

export const BOOKING_STATUS_TEXT: Record<BookingItem['status'], string> = {
    confirmed: '已确认',
    pending: '待确认',
    done: '已完成'
}
