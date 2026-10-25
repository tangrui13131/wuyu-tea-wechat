/**
 * 后端接口配置
 * 开发：微信开发者工具里勾选「不校验合法域名」，用 http://127.0.0.1:3001
 * 真机预览：需要用局域网 IP（如 http://192.168.x.x:3001）
 * 上线：改成 https 域名
 */
export const API_CONFIG = {
    // 本地开发（模拟器）
    baseURL: 'http://127.0.0.1:3001',
    // 真机调试时改成电脑局域网 IP，例如：
    // baseURL: 'http://192.168.1.100:3001',
    // 3s：没有后端时首屏要等满超时才降级到 mock，6s 明显发卡。
    // 配合 utils/request.ts 的熔断（一次失败后 30s 内不再发请求），只有第一屏付一次代价。
    timeout: 3000,
    /** 接口不可用时是否自动降级到本地 mock 数据（保证演示不白屏） */
    fallbackToMock: true
}

/** 运行时可切换（真机调试用） */
export function setBaseURL(url: string) {
    API_CONFIG.baseURL = url
    try {
        require('@tarojs/taro').default.setStorageSync('chashan_wenlv_api_base', url)
    } catch (e) { /* ignore */ }
}

try {
    const saved = require('@tarojs/taro').default.getStorageSync('chashan_wenlv_api_base')
    if (saved) API_CONFIG.baseURL = saved
} catch (e) { /* ignore */ }
