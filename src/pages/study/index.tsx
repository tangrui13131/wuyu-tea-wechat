import React, { useState, useEffect } from 'react'
import Taro, { navigateTo } from '@tarojs/taro'
import { View, Text, Button, Textarea } from '@tarojs/components'
import { getResearchThemes } from '../../data/research'
import ResearchCard from '../../components/ResearchCard'
import Reveal from '@/components/Reveal'
import { checkNPCUnlocked } from '../../utils/chat'
import './index.scss'
import { getStudyModules, getTasks, track, assistantChat } from '@/services'

export default function Study() {
    const [themes, setThemes] = useState([])
    const [modules, setModules] = useState([])
    const [taskSummary, setTaskSummary] = useState({ total: 0, completed: 0 })

    // ========== AI 对话状态（研学任务单助手，走后端智能体） ==========
    const [panelOpen, setPanelOpen] = useState(false)
    const [inputText, setInputText] = useState('')
    const [messages, setMessages] = useState([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [generateError, setGenerateError] = useState('')

    useEffect(function() {
        setThemes(getResearchThemes())
        // 拉取后端课程模块与任务状态（失败则沿用本地数据）
        getStudyModules().then(function (list) {
            if (list && list.length) setModules(list)
        }).catch(function () { })
        getTasks().then(function (list) {
            if (list && list.length) {
                var done = list.filter(function (t) { return t.status === 'completed' })
                setTaskSummary({ total: list.length, completed: done.length })
            }
        }).catch(function () { })
        track('page_view', 'pages/study/index')
    }, [])

    function handleThemeClick(theme) {
        var isUnlocked = checkNPCUnlocked(theme.npcId)
        if (!isUnlocked) {
            Taro.showToast({ title: '先去和' + theme.npcName + '聊聊天吧', icon: 'none', duration: 2000 })
            setTimeout(function() { navigateTo({ url: '/pages/npc/index' }) }, 1500)
            return
        }
        enterTheme(theme)
    }

    function enterTheme(theme) {
        var progress = Taro.getStorageSync('research_' + (Taro.getStorageSync('user_id') || 'default_user'))
        var themeProgress = progress && progress.find ? progress.find(function(p) { return p.themeId === theme.id }) : null
        if (!themeProgress) {
            var userId = Taro.getStorageSync('user_id') || 'default_user'
            var key = 'research_' + userId
            var allProgress = Taro.getStorageSync(key) || []
            allProgress.push({
                themeId: theme.id, status: 'in_progress', startedAt: Date.now(),
                levels: theme.levels.map(function(lv, i) { return { levelId: lv.levelId, status: i === 0 ? 'not_started' : 'locked' } })
            })
            Taro.setStorageSync(key, allProgress)
        }
        navigateTo({ url: '/subpackages/study/pages/study-detail/index?id=' + theme.id })
    }

    // ========== AI 对话：走后端智能体（services → 业务中台 → LLM） ==========
    function requestAssistant(text, historyForSend) {
        setGenerateError('')
        setIsGenerating(true)
        var userMsg = { role: 'user', content: text }
        var newMessages = (historyForSend || messages).concat([userMsg])
        setMessages(newMessages)
        setInputText('')
        // 转成后端 messages 格式（role: user/assistant）
        var payload = newMessages.slice(-10).map(function (m) {
            return { role: m.role === 'ai' ? 'assistant' : m.role, content: m.content }
        })
        assistantChat(payload).then(function (res) {
            setMessages(newMessages.concat([{ role: 'ai', content: res.reply }]))
            setIsGenerating(false)
        }).catch(function (err) {
            console.error('[研学助手生成失败]', err)
            setGenerateError('生成失败，请点击重试')
            setIsGenerating(false)
        })
    }

    function handleSend() {
        var text = inputText.trim()
        if (!text) {
            Taro.showToast({ title: '请输入你的需求', icon: 'none' })
            return
        }
        requestAssistant(text)
    }

    function handleRetry() {
        // 找到最后一条用户消息重新发送
        for (var i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                requestAssistant(messages[i].content, messages.slice(0, i))
                return
            }
        }
    }

    return (
        <View className='study-page'>

            {/* ========== 精装 Hero ========== */}
            <View className='study-header'>
                <View className='heroRing' />
                <View className='heroRingSm' />
                <View className='heroDot' />
                <View className='heroBadge'>
                    <Text>研学 · 槎山白茶</Text>
                </View>
                <Text className='study-title'>研学任务</Text>
                <View className='study-rule' />
                <Text className='study-subtitle'>完成 NPC 布置的任务，获得你的专属研学报告</Text>
            </View>

            {/* ========== 功能入口 ========== */}
            <Text className='sectionTitle'>研学服务</Text>
            <View className='entryGrid'>
                <View
                    className='entryCard'
                    onClick={function () { track('study_combo_enter', 'pages/study/index'); navigateTo({ url: '/pages/report/index?tab=modules' }) }}
                >
                    <View className='entryIconWrap iconGreen'>
                        <View className='entryIcon iconBook' />
                    </View>
                    <Text className='entryTitle'>课程组合</Text>
                    <Text className='entryDesc'>勾选模块拼行程</Text>
                </View>

                <View
                    className='entryCard'
                    onClick={function () { track('study_report_enter', 'pages/study/index'); navigateTo({ url: '/pages/report/index?tab=generate' }) }}
                >
                    <View className='entryIconWrap iconGold'>
                        <View className='entryIcon iconDoc' />
                    </View>
                    <Text className='entryTitle'>报告 / 证书</Text>
                    <Text className='entryDesc'>一键生成 PDF</Text>
                </View>

                <View
                    className='entryCard'
                    onClick={function () { track('study_courses_enter', 'pages/study/index'); navigateTo({ url: '/subpackages/study/pages/study-courses/index' }) }}
                >
                    <View className='entryIconWrap iconDeep'>
                        <View className='entryIcon iconCap' />
                    </View>
                    <Text className='entryTitle'>研学课程</Text>
                    <Text className='entryDesc'>选课 + 加入课单</Text>
                </View>

                <View
                    className='entryCard'
                    onClick={function () { track('study_mybookings_enter', 'pages/study/index'); navigateTo({ url: '/subpackages/study/pages/study-my-bookings/index' }) }}
                >
                    <View className='entryIconWrap iconLight'>
                        <View className='entryIcon iconCal' />
                    </View>
                    <Text className='entryTitle'>我的预约</Text>
                    <Text className='entryDesc'>查看已约场次</Text>
                </View>
            </View>

            {/* ========== AI 对话面板 ========== */}
            <View className='aiCard'>
                <View
                    className='aiCardHead'
                    onClick={function() { setPanelOpen(!panelOpen) }}
                >
                    <View className='aiHeadIcon' />
                    <Text className='aiTitle'>生成专属研学任务单</Text>
                    <View className='aiToggle'>
                        <Text>{panelOpen ? '收起' : '展开'}</Text>
                        <Text className={'aiArrow' + (panelOpen ? ' aiArrowOpen' : '')}>⌄</Text>
                    </View>
                </View>

                {panelOpen && (
                    <View className='aiBody'>

                        {/* 对话记录区域 */}
                        <View className='chatScroll'>
                            {messages.length === 0 && !isGenerating && (
                                <View className='chatEmpty'>
                                    <View className='chatEmptyIcon' />
                                    <Text className='chatEmptyText'>还没有对话记录{"\n"}请在下方输入你的需求</Text>
                                </View>
                            )}

                            {messages.map(function(msg, idx) {
                                if (msg.role === 'user') {
                                    return (
                                        <View key={'u' + idx} className='msgRow msgRowUser'>
                                            <View className='bubbleUser'>
                                                <Text>{msg.content}</Text>
                                            </View>
                                        </View>
                                    )
                                } else {
                                    return (
                                        <View key={'a' + idx} className='msgRow msgRowAi'>
                                            <View className='bubbleAi'>
                                                <Text>{msg.content}</Text>
                                            </View>
                                        </View>
                                    )
                                }
                            })}

                            {isGenerating && (
                                <View className='msgRow msgRowAi'>
                                    <View className='bubbleTyping'>
                                        <Text>AI 正在生成中...</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* 输入框 + 发送按钮 */}
                        <View className='inputRow'>
                            <Textarea
                                className='aiInput'
                                placeholder='请告诉我你的年级、研学时长和主题（例如：3年级，半天，茶文化）'
                                placeholderClass='ai-ph'
                                value={inputText}
                                disabled={isGenerating}
                                onInput={function(e) { setInputText(e.detail.value) }}
                                onConfirm={handleSend}
                                autoHeight
                            />
                            <Button
                                className={'sendBtn' + (isGenerating ? ' sendBtnDisabled' : '')}
                                disabled={isGenerating}
                                onClick={handleSend}
                            >
                                <Text>{isGenerating ? '生成中' : '发送'}</Text>
                            </Button>
                        </View>

                        {/* 失败重试提示 */}
                        {generateError && !isGenerating && (
                            <View className='errorBox'>
                                <Text className='errorText'>{generateError}</Text>
                                <Button className='retryBtn' onClick={handleRetry}>
                                    <Text>点击重试</Text>
                                </Button>
                            </View>
                        )}

                    </View>
                )}
            </View>

            {/* ========== 主题列表 ========== */}
            <Text className='sectionTitle'>研学主题</Text>
            <View className='themeList'>
                {themes.length === 0 ? (
                    <View className='emptyBox'>
                        <View className='emptyIcon' />
                        <Text className='emptyText'>暂无研学主题，先去和 NPC 聊聊吧</Text>
                    </View>
                ) : themes.map(function(theme, idx) {
                    return (
                        // 滚动到视口才入场，三张卡 40/110/180ms 错峰
                        <Reveal key={theme.id} variant='fade-up' delay={40 + idx * 70}>
                            <ResearchCard
                                theme={theme}
                                onClick={function() { handleThemeClick(theme) }}
                            />
                        </Reveal>
                    )
                })}
            </View>
        </View>
    )
}
