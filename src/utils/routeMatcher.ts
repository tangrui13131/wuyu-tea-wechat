// 路线匹配引擎
import type { Route, UserPreferences } from '@/types/route'
import { routes, getDefaultRoute } from '@/data/routes'

/**
 * 根据用户偏好匹配路线
 * @param preferences 用户偏好标签
 * @returns 匹配的路线列表
 */
export function matchRoutes(preferences: UserPreferences): Route[] {
    const { travelType, duration, interests } = preferences

    // 规则匹配引擎：计算每条路线的匹配度
    const matchedRoutes = routes.map(route => {
        const score = calculateMatchScore(route.matchRules, preferences)
        return { route, score }
    })

    // 过滤出有匹配度的路线，按匹配度排序
    const validRoutes = matchedRoutes
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.route)

    // 如果没有匹配的路线，返回默认路线
    return validRoutes.length > 0 ? validRoutes : [getDefaultRoute()]
}

/**
 * 计算匹配度分数
 */
function calculateMatchScore(
    rules: { travelType: string[]; duration: string[]; interests: string[] },
    preferences: UserPreferences
): number {
    let score = 0

    // 出行类型匹配（权重 40%）
    if (rules.travelType.some(type => preferences.travelType.includes(type))) {
        score += 40
    }

    // 停留时长匹配（权重 30%）
    if (rules.duration.includes(preferences.duration)) {
        score += 30
    }

    // 兴趣偏好匹配（权重 30%，可多选）
    const interestMatches = preferences.interests.filter(interest =>
        rules.interests.includes(interest)
    )
    score += (interestMatches.length / Math.max(rules.interests.length, 1)) * 30

    return score
}

/**
 * 获取所有可用的标签选项
 */
export function getTagOptions() {
    return {
        travelType: ['家庭', '研学', '团建', '个人'],
        duration: ['半天', '一天'],
        // 「民俗文化」对应 BP 3.2.1 明确提出的第三类游客画像：三月三民俗客流
        interests: ['茶文化', '红色教育', '农耕体验', '休闲观光', '民俗文化']
    }
}
