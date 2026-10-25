/**
 * 用户身份工具
 * 小程序通过 wx.login 拿 code → 后端 /api/user/login 换 openid 并签发 token。
 * token 存本地，后续请求通过 Authorization 头带上（见 utils/request.ts）。
 */
import Taro from '@tarojs/taro'
import { storage } from './storage'
import { API_CONFIG } from '@/config/api'

const OPENID_KEY = 'openid'
const TOKEN_KEY = 'token'

/** 获取 openid（本地生成 or 后端换取） */
export function getOpenId(): string {
    let openid = storage.get<string>(OPENID_KEY)
    if (!openid) {
        openid = 'dev_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
        storage.set(OPENID_KEY, openid)
    }
    return openid
}

/**
 * 微信登录：wx.login → 后端换 openid + token
 * 失败则降级为本地身份（开发/离线可用）
 */
export async function login(): Promise<{ openid: string; userId?: number }> {
    try {
        const loginRes = await Taro.login()
        const res = await Taro.request({
            url: API_CONFIG.baseURL + '/api/user/login',
            method: 'POST',
            data: { code: loginRes.code, openid: getOpenId() },
            header: { 'content-type': 'application/json' },
            // 必须显式给超时：不写时小程序的默认值是 60s，后端没起时会挂着一分钟
            timeout: API_CONFIG.timeout
        })
        const body = res.data as any
        if (body && body.code === 0 && body.data?.openid) {
            storage.set(OPENID_KEY, body.data.openid)
            if (body.data.token) storage.set(TOKEN_KEY, body.data.token)
            return body.data
        }
    } catch (e) {
        console.warn('[login] 失败，使用本地身份:', e)
    }
    return { openid: getOpenId() }
}

/** 当前登录 token（Bearer 用），未登录为空 */
export function getToken(): string | null {
    return storage.get<string>(TOKEN_KEY) ?? null
}

/** 当前用户数字 ID（后端 users 表主键，登录后才有） */
export function getUserId(): number | null {
    return storage.get<number>('user_id') ?? null
}

export function setUserId(id: number) {
    storage.set('user_id', id)
}
