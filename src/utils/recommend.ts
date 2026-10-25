/**
 * 场景化商品推荐
 *
 * 把「研学主题 / 报告成功」映射到真实商品 ID（1~6，见 data/products.ts），
 * 打通「研学 → 卖茶」闭环。仅做数据映射，不发网络请求，商品取自本地兜底数据。
 */

import { localProducts, type LocalProduct } from '@/data/products'

/**
 * 研学主题 → 推荐商品 ID（真实 ID，非字符串 slug）
 * 映射依据：主题对应 NPC 人设与商品调性匹配
 *   tea_culture(白叶仙姑)   → 白茶礼盒 / 口粮茶 / 仙姑伴手礼
 *   farming(双泉伯)         → 口粮茶 / 土蜂蜜 / 明前礼盒
 *   red_education(红军交通员) → 红军茶筐 / 仙姑伴手礼 / 研学纪念茶
 */
export const TASK_PRODUCT_MAP: Record<string, number[]> = {
    tea_culture: [1, 2, 3],
    farming: [2, 6, 1],
    red_education: [5, 3, 4],
}

/** 报告成功页「好茶带回家」3 款主力商品（茶礼/白茶/蜂蜜，适合带回家） */
export const REPORT_HOME_PRODUCT_IDS: number[] = [1, 2, 6]

/** 取某主题推荐商品（最多 3 款，按映射顺序） */
export const getRecommendedProducts = (themeId: string): LocalProduct[] => {
    const ids = TASK_PRODUCT_MAP[themeId] || TASK_PRODUCT_MAP['tea_culture']
    return ids
        .map((id) => localProducts.find((p) => p.id === id))
        .filter((p): p is LocalProduct => Boolean(p))
}

/** 取报告页「好茶带回家」主力商品 */
export const getReportHomeProducts = (): LocalProduct[] => {
    return REPORT_HOME_PRODUCT_IDS
        .map((id) => localProducts.find((p) => p.id === id))
        .filter((p): p is LocalProduct => Boolean(p))
}
