import Taro from '@tarojs/taro'

/**
 * rpx → px 换算（用于 JSX 内联样式）。
 *
 * 为什么需要：Taro 只会把**样式表**里的 rpx 换算成运行单位，写进 JSX `style` 的
 * `'32rpx'` 在 H5 端会被浏览器直接丢弃（元素尺寸归零）。小程序端 rpx 正常，
 * 但 H5 对照调试时会整片消失，排查成本极高。统一走本函数输出 px，
 * 两端表现一致（rpx 的定义就是 windowWidth / 750）。
 */
let ratio = 0

export function rpx2px(rpx: number): number {
    if (!ratio) {
        try {
            const taro: any = Taro
            const info =
                typeof taro.getWindowInfo === 'function'
                    ? taro.getWindowInfo()
                    : taro.getSystemInfoSync()
            ratio = (info && info.windowWidth ? info.windowWidth : 375) / 750
        } catch (e) {
            // 取不到窗口信息时按 iPhone 375 宽兜底，宁可略小也不能消失
            ratio = 0.5
        }
    }
    return Math.round(rpx * ratio * 100) / 100
}
