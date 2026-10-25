import Taro from '@tarojs/taro'

/**
 * 触觉反馈（震动）。
 *
 * 为什么要有：移动端 HIG / 材料设计都建议在「确认类动作」上给一次轻震动——打卡成功、
 * 关卡提交、生成路线这类「操作生效了」的时刻，用户手里有感觉，比只看 toast 更确认。
 *
 * 三条约束：
 * 1. 只在真机有效：开发者工具、部分安卓机、iOS 静音模式都可能无感，这是正常的，
 *    所以反馈永远是「锦上添花」，不能承载任何业务判断。
 * 2. 任何异常必须静默吞掉（基础库太低没有 vibrateShort、系统权限被拒、H5 端无此 API），
 *    业务流程不能因为震动失败而中断。
 * 3. Taro 的 vibrateShort 返回 Promise，不 catch 会产生 unhandled rejection，一并处理。
 */
export const haptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    try {
        const ret: any = Taro.vibrateShort({ type })
        if (ret && typeof ret.catch === 'function') ret.catch(() => undefined)
    } catch (e) {
        // 忽略：震动不可用不影响业务
    }
}

export default haptic
