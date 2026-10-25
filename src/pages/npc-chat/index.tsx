import React, { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, Input, Button } from '@tarojs/components'
import Icon from '@/components/Icon'
import Taro, { useRouter } from '@tarojs/taro'
import styles from './index.module.scss'
import { getNPCById } from '@/data/npcs'
import NPCAvatar from '@/components/NPCAvatar'
import {
    getChatSession,
    addMessage,
    markMessagesAsRead,
    clearChatHistory,
    addFavoriteMessage
} from '@/utils/chat'
import type { ChatMessage } from '@/utils/chat'
import { isTTSAvailable, speak, stopSpeak } from '@/utils/tts'
import { callLLM } from '@/config/llm'
import { npcs } from '@/data/npcs'
import { chatWithNpc } from '@/services'
import { getResearchThemeByNpcId, getNextResearchLevel, getThemeProgress } from '@/utils/research'

const NPCChatPage: React.FC = () => {
    const router = useRouter()
    const npcId = router.params.id as string

    console.log('[NPCChat] 页面加载，npcId:', npcId)

    const npc = getNPCById(npcId)

    console.log('[NPCChat] 获取到的 NPC:', npc)

    const scrollViewRef = useRef<any>(null)

    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [dialogState, setDialogState] = useState<'pre' | 'task' | 'post'>('pre')
    const [currentTask, setCurrentTask] = useState<{ id: string; title: string } | null>(null)
    const [quickReplies, setQuickReplies] = useState<string[]>([])
    const [showMoreMenu, setShowMoreMenu] = useState(false)
    /** 语音播报：插件不可用时隐藏开关，不报错 */
    const [ttsAvailable] = useState<boolean>(() => isTTSAvailable())
    const [voiceOn, setVoiceOn] = useState<boolean>(
        () => Taro.getStorageSync('chashan_voice_on') !== false
    )
    const [speakingId, setSpeakingId] = useState<string | null>(null)
    const lastSpokenRef = useRef<string | null>(null)

    useEffect(() => {
        if (!npc) {
            Taro.showToast({
                title: 'NPC 不存在',
                icon: 'none'
            })
            Taro.navigateBack()
            return
        }

        // 设置导航栏标题
        Taro.setNavigationBarTitle({
            title: npc.name
        })

        // 加载对话历史
        loadChatHistory()

        // 研学进度驱动阶段条：若该 NPC 绑定了研学主题，按研学进度显示"当前任务/下一步"
        const linkedTheme = getResearchThemeByNpcId(npcId)
        if (linkedTheme) {
            const next = getNextResearchLevel(linkedTheme.id)
            const prog = getThemeProgress(linkedTheme.id)
            if (!next) {
                setDialogState('post')
                setCurrentTask(null)
            } else {
                const started = prog && prog.levels.some(l => l.status === 'in_progress' || l.status === 'completed')
                setDialogState(started ? 'task' : 'pre')
                setCurrentTask({ id: next.id, title: next.name })
            }
        }

        // 如果是首次解锁，发送开场白
        const session = getChatSession(npcId)
        if (!session || session.messages.length === 0) {
            sendInitialGreeting()
        }

        return () => {
            // 离开页面时标记消息为已读
            markMessagesAsRead(npcId)
        }
    }, [])

    useEffect(() => {
        // 滚动到底部
        scrollToBottom()
    }, [messages])

    const loadChatHistory = () => {
        const session = getChatSession(npcId)
        if (session && session.messages.length > 0) {
            // 只显示最近 10 条消息
            const recentMessages = session.messages.slice(-10)
            setMessages(recentMessages)

            // 如果有历史消息，生成快捷回复
            generateQuickReplies(recentMessages[recentMessages.length - 1])
        }
    }

    const sendInitialGreeting = async () => {
        // 模拟 NPC 开场白
        const greetings: Record<string, string> = {
            'npc-fairy': '这片茶园在等你，五百年前的故事想讲给你听~ 你想了解什么呢？',
            'npc-tea-farmer': '来啦？正泡着茶呢，坐下来聊聊制茶的手艺吧！',
            'npc-soldier': '同志，有段历史需要你来了解，跟我来。'
        }

        const greeting = greetings[npcId] || '你好，我是' + npc?.name

        // 延迟发送，模拟真实场景
        setTimeout(() => {
            addMessage(npcId, {
                role: 'assistant',
                content: greeting,
                sceneId: 'default'
            })
            setMessages(prev => {
                const session = getChatSession(npcId)
                return session ? session.messages.slice(-10) : prev
            })

            // 设置初始快捷回复
            setQuickReplies(getInitialQuickReplies(npcId))
        }, 500)
    }

    const getInitialQuickReplies = (npcId: string): string[] => {
        const replies: Record<string, string[]> = {
            'npc-fairy': ['白茶有什么传说？', '万里茶道是什么？', '这里有什么民俗？'],
            'npc-tea-farmer': ['制茶分几步？', '双泉的水有什么特别？', '李白真的来过？'],
            'npc-soldier': ['茶筐怎么传情报？', '千塘百坝是什么？', '这里发生过什么战斗？']
        }
        return replies[npcId] || []
    }

    const generateQuickReplies = (lastMessage: ChatMessage) => {
        // 根据 NPC 角色和最后一条消息生成快捷回复
        // 这里简化处理，实际应该由后端根据对话上下文生成
        const replies = getInitialQuickReplies(npcId)
        setQuickReplies(replies)
    }

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isSending) return

        const userMessage = inputValue.trim()
        setInputValue('')
        setIsSending(true)

        // 添加用户消息
        addMessage(npcId, {
            role: 'user',
            content: userMessage,
            sceneId: 'default'
        })

        // 更新消息列表
        setTimeout(() => {
            const session = getChatSession(npcId)
            setMessages(session ? session.messages.slice(-10) : [])
        }, 100)

        // 调用大模型 API 获取回复
        try {
            const session = getChatSession(npcId)
            const history = session ? session.messages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            })) : []

            // 优先走后端：NPC 人设 + 三段式状态机在服务端拼装，AI Key 不下发到小程序端
            let npcReply = ''
            try {
                const res = await chatWithNpc(npcId, userMessage)
                npcReply = res.reply
                // 绑定了研学主题的 NPC，阶段条以研学进度为准，不覆盖为后端状态机
                if (!getResearchThemeByNpcId(npcId)) {
                    setDialogState(res.state)
                    setCurrentTask(res.task)
                }
            } catch (e) {
                const npcData = npcs.find(n => n.id === npcId)
                npcReply = await callLLM(
                    npcId,
                    npc?.name || 'NPC',
                    npcData?.systemPrompt || '',
                    userMessage,
                    history
                )
            }

            addMessage(npcId, {
                role: 'assistant',
                content: npcReply,
                sceneId: 'default'
            })

            setMessages(prev => {
                const session = getChatSession(npcId)
                return session ? session.messages.slice(-10) : prev
            })
        } catch (error) {
            console.error('[NPCChat] 获取回复失败:', error)
            // 失败时使用模拟回复
            const npcReply = generateNPCReply(userMessage)
            addMessage(npcId, {
                role: 'assistant',
                content: npcReply,
                sceneId: 'default'
            })
            setMessages(prev => {
                const session = getChatSession(npcId)
                return session ? session.messages.slice(-10) : prev
            })
        }

        setIsSending(false)
    }

    const generateNPCReply = (userMessage: string): string => {
        // 简化的回复逻辑，实际应该调用大模型 API
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

    const handleQuickReply = (reply: string) => {
        setInputValue(reply)
        setTimeout(() => {
            handleSendMessage()
        }, 300)
    }

    const handleClearHistory = () => {
        Taro.showModal({
            title: '清空对话',
            content: '确定要清空与' + npc?.name + '的对话历史吗？',
            success: (res) => {
                if (res.confirm) {
                    clearChatHistory(npcId)
                    setMessages([])
                    setShowMoreMenu(false)
                    setTimeout(() => {
                        sendInitialGreeting()
                    }, 500)
                }
            }
        })
    }

    /** 自动播报最新的 NPC 回复（同一条只播一次） */
    useEffect(() => {
        if (!voiceOn || !ttsAvailable) return
        const last = messages[messages.length - 1]
        if (!last || last.role !== 'assistant') return
        if (lastSpokenRef.current === last.id) return
        lastSpokenRef.current = last.id
        setSpeakingId(last.id)
        speak(last.content, {
            onEnd: () => setSpeakingId(null),
            onError: (err: any) => {
                setSpeakingId(null)
                if (err?.errMsg === 'TTS_PLUGIN_UNAVAILABLE') {
                    Taro.showToast({ title: '语音插件未启用', icon: 'none' })
                }
            }
        })
    }, [messages, voiceOn, ttsAvailable])

    /** 离开页面时停止播报，避免后台继续播放 */
    useEffect(() => () => { stopSpeak() }, [])

    /** 语音播报开关 */
    const handleToggleVoice = () => {
        const next = !voiceOn
        setVoiceOn(next)
        Taro.setStorageSync('chashan_voice_on', next)
        if (!next) {
            stopSpeak()
            setSpeakingId(null)
        }
    }

    const handleFavoriteMessage = (message: ChatMessage) => {
        if (message.role === 'assistant' && npc) {
            addFavoriteMessage(npcId, npc.name, message.id, message.content, message.sceneId)
            Taro.showToast({
                title: '已收藏',
                icon: 'success'
            })
            setShowMoreMenu(false)
        }
    }

    const scrollToBottom = () => {
        // 延迟滚动，确保内容已渲染
        setTimeout(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    top: 99999,
                    duration: 300
                })
            }
        }, 100)
    }

    if (!npc) {
        return null
    }

    return (
        <View className={styles.npcChatPage}>
            {/* 三段式任务状态：pre 布置任务 / task 完成中 / post 延续对话 */}
            {dialogState !== 'pre' && (
                <View className={styles.stageBar}>
                    <Text className={styles.stageText}>
                        {dialogState === 'task'
                            ? `当前任务：${currentTask?.title || '前往园区完成任务'}`
                            : '任务已完成，可继续深聊'}
                    </Text>
                </View>
            )}
            {/* 语音播报开关：插件未启用时整条隐藏，不影响其他功能 */}
            {ttsAvailable && (
                <View className={styles.voiceBar}>
                    <View className={styles.voiceBarLabel}>
                        <Icon name='volume' size={26} color={voiceOn ? 'primary' : 'tertiary'} />
                        <Text>{speakingId ? '正在播报…' : '语音播报'}</Text>
                    </View>
                    <View
                        className={`${styles.voiceSwitch} ${voiceOn ? styles.voiceSwitchOn : ''}`}
                        onClick={handleToggleVoice}
                    >
                        <View className={`${styles.voiceKnob} ${voiceOn ? styles.voiceKnobOn : ''}`} />
                    </View>
                </View>
            )}

            {/* 对话区域 */}
            <ScrollView
                ref={scrollViewRef}
                className={styles.chatContainer}
                scrollY
                scrollWithAnimation
            >
                {messages.map((message, index) => (
                    <View
                        key={message.id}
                        className={`${styles.messageRow} ${message.role === 'user' ? styles.messageRowUser : styles.messageRowNPC
                            }`}
                    >
                        {message.role === 'assistant' && (
                            <NPCAvatar npc={npc} size={72} />
                        )}
                        <View
                            className={`${styles.messageBubble} ${message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleNPC
                                }`}
                            onLongPress={() => {
                                if (message.role === 'assistant') {
                                    handleFavoriteMessage(message)
                                }
                            }}
                        >
                            <Text className={styles.messageContent}>{message.content}</Text>
                        </View>
                        {message.role === 'user' && (
                            <View className={styles.userAvatarPlaceholder} />
                        )}
                    </View>
                ))}

                {isSending && (
                    <View className={`${styles.messageRow} ${styles.messageRowNPC}`}>
                        <NPCAvatar npc={npc} size={72} />
                        <View className={`${styles.messageBubble} ${styles.messageBubbleNPC}`}>
                            <Text className={styles.typingIndicator}>正在输入...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* 快捷回复区域 */}
            {quickReplies.length > 0 && (
                <View className={styles.quickRepliesContainer}>
                    <ScrollView className={styles.quickRepliesScroll} scrollX>
                        {quickReplies.map((reply, index) => (
                            <View
                                key={index}
                                className={styles.quickReplyBtn}
                                onClick={() => handleQuickReply(reply)}
                            >
                                <Text className={styles.quickReplyText}>{reply}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* 输入区域 */}
            <View className={styles.inputContainer}>
                <Input
                    className={styles.input}
                    value={inputValue}
                    onInput={(e) => setInputValue(e.detail.value)}
                    placeholder={`和${npc.name}说点什么…`}
                    confirmType="send"
                    onConfirm={handleSendMessage}
                />
                <Button
                    className={`${styles.sendBtn} ${!inputValue.trim() ? styles.sendBtnDisabled : ''}`}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                >
                    <Text className={styles.sendBtnText}>发送</Text>
                </Button>
            </View>

            {/* 更多菜单（简化版本） */}
            {showMoreMenu && (
                <View className={styles.moreMenuOverlay} onClick={() => setShowMoreMenu(false)}>
                    <View className={styles.moreMenu} onClick={(e) => e.stopPropagation()}>
                        <View className={styles.menuItem} onClick={handleClearHistory}>
                            <Text>清空对话</Text>
                        </View>
                        <View className={styles.menuItem}>
                            <Text>举报</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

export default NPCChatPage
