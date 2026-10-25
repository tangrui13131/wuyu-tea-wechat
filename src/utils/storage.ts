// 本地存储工具
import Taro from '@tarojs/taro'

const STORAGE_PREFIX = 'chashan_wenlv_'

export const storage = {
    /**
     * 存储数据
     */
    set<T>(key: string, value: T): void {
        try {
            const fullKey = STORAGE_PREFIX + key
            const stringValue = JSON.stringify(value)
            Taro.setStorageSync(fullKey, stringValue)
        } catch (error) {
            console.error('[Storage] Set error:', key, error)
        }
    },

    /**
     * 获取数据
     */
    get<T>(key: string, defaultValue?: T): T | undefined {
        try {
            const fullKey = STORAGE_PREFIX + key
            const stringValue = Taro.getStorageSync(fullKey)
            if (stringValue === '' || stringValue === undefined) {
                return defaultValue
            }
            return JSON.parse(stringValue) as T
        } catch (error) {
            console.error('[Storage] Get error:', key, error)
            return defaultValue
        }
    },

    /**
     * 删除数据
     */
    remove(key: string): void {
        try {
            const fullKey = STORAGE_PREFIX + key
            Taro.removeStorageSync(fullKey)
        } catch (error) {
            console.error('[Storage] Remove error:', key, error)
        }
    },

    /**
     * 清空所有数据
     */
    clear(): void {
        try {
            const keys = Taro.getStorageInfoSync().keys
            keys.forEach(key => {
                if (key.startsWith(STORAGE_PREFIX)) {
                    Taro.removeStorageSync(key)
                }
            })
        } catch (error) {
            console.error('[Storage] Clear error:', error)
        }
    }
}

// 用户偏好存储
export const userPreferencesStorage = {
    get() {
        return storage.get('user_preferences')
    },
    set(value: any) {
        return storage.set('user_preferences', value)
    }
}

// 研学报告存储
export const studyReportStorage = {
    get() {
        return storage.get('study_reports')
    },
    set(value: any) {
        return storage.set('study_reports', value)
    }
}
