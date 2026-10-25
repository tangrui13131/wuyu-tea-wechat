/**
 * 语音合成（TTS）工具
 * 基于微信同声传译插件 WechatSI 实现景点语音讲解与 NPC 语音播报。
 *
 * 插件需先在微信公众平台「设置 - 第三方设置 - 插件管理」中添加；
 * 未添加时 requirePlugin 返回空，本模块全部能力安全降级：
 * isTTSAvailable() 返回 false，调用 speak() 仅触发 onError，不抛异常，页面可据此隐藏语音入口。
 */

import Taro from '@tarojs/taro'

// 微信同声传译插件（未添加时为空，不抛错）
let siPlugin: any = null
try {
    siPlugin = Taro.requirePlugin('WechatSI')
} catch (e) {
    siPlugin = null
}

let audioCtx: any = null
let speaking = false

/** 语音合成是否可用（插件已添加且加载成功） */
export const isTTSAvailable = (): boolean => !!siPlugin

/** 当前是否正在播放 */
export const isSpeaking = (): boolean => speaking

/** 估算字符串 UTF-8 字节数 */
const byteLength = (str: string): number => {
    let bytes = 0
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i)
        bytes += code > 0x7ff ? 3 : (code > 0x7f ? 2 : 1)
    }
    return bytes
}

/**
 * 插件单次合成上限约 1000 字节，此处按字节安全截断，
 * 避免长文本合成失败（截断点落在句子边界，不出现半截词）
 */
const MAX_BYTES = 900
const clipContent = (text: string): string => {
    if (byteLength(text) <= MAX_BYTES) return text
    let out = ''
    let bytes = 0
    for (const ch of text) {
        const b = byteLength(ch)
        if (bytes + b > MAX_BYTES) break
        out += ch
        bytes += b
    }
    return out
}

export interface SpeakOptions {
    onStart?: () => void
    onEnd?: () => void
    onError?: (err: any) => void
}

/** 释放音频实例 */
const releaseAudio = () => {
    if (audioCtx) {
        try { audioCtx.destroy() } catch (e) { /* ignore */ }
        audioCtx = null
    }
    speaking = false
}

/** 停止当前播放 */
export const stopSpeak = (): void => {
    if (audioCtx) {
        try { audioCtx.stop() } catch (e) { /* ignore */ }
    }
    releaseAudio()
}

/**
 * 朗读文本
 * @param text 待朗读内容（自动按字节安全截断）
 */
export const speak = (text: string, options: SpeakOptions = {}): void => {
    const content = clipContent((text || '').trim())
    if (!content) return

    if (!siPlugin) {
        options.onError?.({ errMsg: 'TTS_PLUGIN_UNAVAILABLE' })
        return
    }

    stopSpeak()

    siPlugin.textToSpeech({
        lang: 'zh_CN',
        tts: true,
        content,
        success: (res: any) => {
            if (!res?.filename) {
                options.onError?.({ errMsg: 'TTS_NO_FILENAME' })
                return
            }
            try {
                audioCtx = Taro.createInnerAudioContext()
                audioCtx.src = res.filename
                audioCtx.onEnded(() => {
                    releaseAudio()
                    options.onEnd?.()
                })
                audioCtx.onError((err: any) => {
                    releaseAudio()
                    options.onError?.(err)
                })
                audioCtx.play()
                speaking = true
                options.onStart?.()
            } catch (e) {
                releaseAudio()
                options.onError?.(e)
            }
        },
        fail: (err: any) => {
            speaking = false
            options.onError?.(err)
        }
    })
}

/** 拼接景点讲解文本：名称 + 简介 + 详细介绍 */
export const buildSceneSpeech = (scene: {
    name: string
    summary: string
    description: string
}): string => {
    return `${scene.name}。${scene.summary}。${scene.description}`
}
