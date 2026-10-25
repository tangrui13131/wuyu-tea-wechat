/**
 * 统一请求封装
 * - 自动携带 openid（静默登录）
 * - 接口失败自动降级到本地 mock，保证演示流程不中断
 */
import Taro from '@tarojs/taro'
import { API_CONFIG } from '@/config/api'
import { getOpenId, getToken } from './user'

export interface ApiResult<T = any> {
    code: number
    msg?: string
    data: T
}

/** 后端不可达标记，页面可据此显示「离线演示」提示 */
export const netState = { online: true, lastError: '' }

/**
 * 熔断：一次请求失败后，接下来 30s 内不再发网络请求，直接走本地数据。
 *
 * 为什么需要它：没有后端时，每个页面都会先等满 timeout 才降级——首页 6 秒白屏、
 * 切页继续等，演示体验很差。有了熔断，第一屏最多等一次，之后都是瞬时的本地数据。
 * 30s 后自动重试，后端中途启动也能接上。
 */
const OFFLINE_COOLDOWN_MS = 30000
let offlineUntil = 0

/** 后端活着、但业务返回 code≠0 —— 这种错误不该触发离线熔断 */
class BusinessError extends Error {}

export async function request<T = any>(
    path: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
        data?: any
        silent?: boolean
    } = {}
): Promise<T> {
    const { method = 'GET', data, silent } = options

    // 熔断期内直接失败，让调用方立刻走 fallback，不再等超时
    if (Date.now() < offlineUntil) {
        netState.online = false
        netState.lastError = '离线模式（熔断中）'
        throw new Error(netState.lastError)
    }

    try {
        const res = await Taro.request({
            url: API_CONFIG.baseURL + path,
            method,
            data,
            timeout: API_CONFIG.timeout,
            header: {
                'content-type': 'application/json',
                'x-openid': getOpenId(),
                ...(getToken() ? { Authorization: 'Bearer ' + getToken() } : {})
            }
        })
        const body = res.data as ApiResult<T>
        if (body && body.code === 0) {
            netState.online = true
            offlineUntil = 0
            return body.data
        }
        netState.online = false
        netState.lastError = (body && body.msg) || '接口返回异常'
        throw new BusinessError(netState.lastError)
    } catch (e: any) {
        netState.online = false
        netState.lastError = e?.message || '网络请求失败'
        // 只有「连不上」才熔断；接口返回业务错误说明后端活着，不该熔断
        if (!(e instanceof BusinessError)) offlineUntil = Date.now() + OFFLINE_COOLDOWN_MS
        if (!silent) console.warn('[API]', path, netState.lastError)
        throw e
    }
}

/**
 * 带降级的请求：后端挂了就用本地数据
 * @param path 接口路径
 * @param options 请求参数
 * @param fallback mock 数据获取函数
 */
export async function requestWithFallback<T = any>(
    path: string,
    options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; data?: any } = {},
    fallback: () => T | Promise<T>
): Promise<T> {
    if (!API_CONFIG.fallbackToMock) return request<T>(path, options)
    try {
        return await request<T>(path, options)
    } catch (e) {
        console.warn('[API] 降级到本地数据:', path)
        return await fallback()
    }
}

export const api = {
    get: <T = any>(path: string) => request<T>(path),
    post: <T = any>(path: string, data?: any) => request<T>(path, { method: 'POST', data }),
    put: <T = any>(path: string, data?: any) => request<T>(path, { method: 'PUT', data })
}
