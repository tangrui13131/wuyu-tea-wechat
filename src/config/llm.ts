/**
 * 大模型 API 配置
 * 可以在这里配置使用哪个大模型服务
 */

export interface LLMConfig {
    provider: 'mock' | 'tongyi' | 'wenxin' | 'custom'
    apiKey: string
    apiSecret?: string
    endpoint?: string
    model?: string
}

// 当前配置
export const llmConfig: LLMConfig = {
    provider: 'mock', // 默认使用模拟回复
    apiKey: '', // 填入你的 API Key
    apiSecret: '',
    endpoint: '',
    model: ''
}

/**
 * 调用大模型 API 获取 NPC 回复
 * @param npcId NPC 标识
 * @param npcName NPC 名称
 * @param systemPrompt 角色设定
 * @param userMessage 用户消息
 * @param history 对话历史
 */
export async function callLLM(
    npcId: string,
    npcName: string,
    systemPrompt: string,
    userMessage: string,
    history: Array<{ role: string; content: string }>
): Promise<string> {
    // 如果配置为 mock，返回模拟回复
    if (llmConfig.provider === 'mock') {
        return getMockReply(npcId, userMessage)
    }

    // 根据提供商调用不同的 API
    switch (llmConfig.provider) {
        case 'tongyi':
            return callTongyiQianwen(systemPrompt, userMessage, history)
        case 'wenxin':
            return callWenxinYiyan(systemPrompt, userMessage, history)
        case 'custom':
            return callCustomLLM(systemPrompt, userMessage, history)
        default:
            return getMockReply(npcId, userMessage)
    }
}

/**
 * 模拟回复（用于测试）
 */
function getMockReply(npcId: string, userMessage: string): string {
    const replies: Record<string, string[]> = {
        'npc-fairy': [
            '很久以前，天顺年间，有一位女子在槎山修行，她发现了这种神奇的白茶...',
            '万里茶道是古代重要的茶叶贸易通道，从福建武夷山一直延伸到俄罗斯...',
            '这里的民俗很特别，每年采茶季节，茶农们会举行祭祀茶神的仪式...'
        ],
        'npc-tea-farmer': [
            '制茶啊，要经过采摘、萎凋、杀青、揉捻、干燥五道工序，每一步都不能马虎...',
            '双泉的水清澈甘甜，用来泡茶特别香醇，当年李白就是用这水煮茶...',
            '据说李白确实来过这里，还留下了赞美双泉的诗句呢...'
        ],
        'npc-soldier': [
            '当年我们用特制的茶筐运送情报，敌人怎么也想不到茶叶里藏着秘密...',
            '千塘百坝运动是抗日战争时期的重要水利工程，为根据地建设作出了贡献...',
            '中原突围战役中，槎山是重要的根据地，很多同志在这里战斗过...'
        ]
    }

    const npcReplies = replies[npcId] || ['让我想想怎么跟你说...']
    const randomIndex = Math.floor(Math.random() * npcReplies.length)
    return npcReplies[randomIndex]
}

/**
 * 调用通义千问 API
 */
async function callTongyiQianwen(
    systemPrompt: string,
    userMessage: string,
    history: Array<{ role: string; content: string }>
): Promise<string> {
    try {
        const response = await fetch(llmConfig.endpoint || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${llmConfig.apiKey}`
            },
            body: JSON.stringify({
                model: llmConfig.model || 'qwen-turbo',
                input: {
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...history,
                        { role: 'user', content: userMessage }
                    ]
                },
                parameters: {
                    result_format: 'text',
                    temperature: 0.7,
                    max_tokens: 200
                }
            })
        })

        const data = await response.json()
        if (data.output && data.output.text) {
            return data.output.text
        }
        return '抱歉，我暂时无法回答这个问题。'
    } catch (error) {
        console.error('[LLM] 通义千问调用失败:', error)
        return '抱歉，网络出了点问题，请稍后再试。'
    }
}

/**
 * 调用文心一言 API
 */
async function callWenxinYiyan(
    systemPrompt: string,
    userMessage: string,
    history: Array<{ role: string; content: string }>
): Promise<string> {
    try {
        const response = await fetch(llmConfig.endpoint || `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${llmConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...history,
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_output_tokens: 200
            })
        })

        const data = await response.json()
        if (data.result) {
            return data.result
        }
        return '抱歉，我暂时无法回答这个问题。'
    } catch (error) {
        console.error('[LLM] 文心一言调用失败:', error)
        return '抱歉，网络出了点问题，请稍后再试。'
    }
}

/**
 * 调用自定义 LLM API
 */
async function callCustomLLM(
    systemPrompt: string,
    userMessage: string,
    history: Array<{ role: string; content: string }>
): Promise<string> {
    try {
        const response = await fetch(llmConfig.endpoint || '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${llmConfig.apiKey}`
            },
            body: JSON.stringify({
                model: llmConfig.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...history,
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        })

        const data = await response.json()
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content
        }
        return '抱歉，我暂时无法回答这个问题。'
    } catch (error) {
        console.error('[LLM] 自定义 API 调用失败:', error)
        return '抱歉，网络出了点问题，请稍后再试。'
    }
}
