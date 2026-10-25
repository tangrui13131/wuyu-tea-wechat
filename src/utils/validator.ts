// 内容安全过滤工具

// 敏感词库（示例，实际需要更完整的词库）
const sensitiveWords = [
    // 政治敏感
    '敏感政治词汇 1',
    '敏感政治词汇 2',
    // 暴力色情
    '暴力词汇 1',
    '色情词汇 1',
    // 虚假信息
    '谣言词汇 1',
    // 人身攻击
    '侮辱性词汇 1'
]

/**
 * 检查文本是否包含敏感内容
 * @param text 待检查的文本
 * @returns 是否安全
 */
export function isContentSafe(text: string): boolean {
    const lowerText = text.toLowerCase()

    for (const word of sensitiveWords) {
        if (lowerText.includes(word.toLowerCase())) {
            return false
        }
    }

    return true
}

/**
 * 过滤敏感词
 * @param text 待过滤的文本
 * @returns 过滤后的文本
 */
export function filterSensitiveWords(text: string): string {
    let filteredText = text

    for (const word of sensitiveWords) {
        const regex = new RegExp(word, 'gi')
        filteredText = filteredText.replace(regex, '*'.repeat(word.length))
    }

    return filteredText
}

/**
 * 安全检查并返回结果
 * @param text 待检查的文本
 * @returns { safe: boolean, filteredText: string, message?: string }
 */
export function checkContent(text: string): {
    safe: boolean
    filteredText: string
    message?: string
} {
    if (!isContentSafe(text)) {
        return {
            safe: false,
            filteredText: filterSensitiveWords(text),
            message: '您的输入包含不当内容，已自动过滤。请文明发言。'
        }
    }

    return {
        safe: true,
        filteredText: text
    }
}

/**
 * NPC 对话内容安全检查
 * @param input 用户输入
 * @param output AI 输出
 * @returns 是否安全
 */
export function validateNPCChat(input: string, output: string): boolean {
    const inputCheck = checkContent(input)
    const outputCheck = checkContent(output)

    return inputCheck.safe && outputCheck.safe
}
