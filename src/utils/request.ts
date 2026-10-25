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

export async function request<T = any>(
    path: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
        data?: any
        silent?: boolean
    } = {}
): Promise<T> {
    const { method = 'GET', data, silent } = options
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
            return body.data
        }
        netState.online = false
        netState.lastError = (body && body.msg) || '接口返回异常'
        throw new Error(netState.lastError)
    } catch (e: any) {
        netState.online = false
        netState.lastError = e?.message || '网络请求失败'
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
