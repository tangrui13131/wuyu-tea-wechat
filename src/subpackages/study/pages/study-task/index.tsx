import React, { useState, useEffect } from 'react'
import Taro, { useRouter, navigateBack, navigateTo } from '@tarojs/taro'
import { View, Text, Button, Input, Textarea } from '@tarojs/components'
import Icon from '@/components/Icon'
import { getResearchLevel, getResearchThemeById } from '@/data/research'
import { getLevelProgress, completeLevel, skipLevel, saveLevelDraft, getNextResearchLevel } from '@/utils/research'
import { getNPCById } from '@/data/npcs'
import { LocalProduct } from '@/data/products'
import { unlockNPC, addMessage } from '@/utils/chat'
import { storage } from '@/utils/storage'
import { track } from '@/services'
import { getRecommendedProducts } from '@/utils/recommend'
import { haptic } from '@/utils/feedback'
import NPCAvatar from '@/components/NPCAvatar'
import './index.scss'

export default function StudyTask() {
    const router = useRouter()
    const { themeId, levelId } = router.params
    const [level, setLevel] = useState<any>(null)
    const [inputValue, setInputValue] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [locationStatus, setLocationStatus] = useState('定位中...')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [recommendProducts, setRecommendProducts] = useState<LocalProduct[]>([])

    useEffect(() => {
        if (!themeId || !levelId) return

        // 加载关卡数据
        const loadedLevel = getResearchLevel(themeId, parseInt(levelId))
        if (!loadedLevel) {
            Taro.showToast({
                title: '关卡不存在',
                icon: 'none'
            })
            return
        }

        setLevel(loadedLevel)

        // 加载进度
        const progress = getLevelProgress(themeId, parseInt(levelId))
        if (progress?.submissionDraft) {
            setInputValue(progress.submissionDraft)
        }

        // 如果是打卡型任务，获取定位
        if (loadedLevel.type === 'checkin') {
            getLocation()
        }
    }, [themeId, levelId])

    const getLocation = () => {
        Taro.getLocation({
            type: 'gcj02',
            success: (res) => {
                setLocationStatus('已到达')
                console.log('[定位] 当前位置:', res.latitude, res.longitude)
            },
            fail: () => {
                setLocationStatus('未到达，请前往景点')
            }
        })
    }

    const handleChooseImage = () => {
        Taro.chooseImage({
            count: 1,
            success: (res) => {
                const tempFilePath = res.tempFilePaths[0]
                setImageUrl(tempFilePath)
            }
        })
    }

    const handleSubmit = async () => {
        if (isSubmitting) return

        // 验证提交内容
        if (level.type === 'observation' && inputValue.length < 20) {
            Taro.showToast({
                title: '至少 20 字哦',
                icon: 'none'
            })
            return
        }

        if (level.type === 'experience' && !imageUrl) {
            Taro.showToast({
                title: '请上传图片',
                icon: 'none'
            })
            return
        }

        setIsSubmitting(true)

        try {
            // 模拟提交（实际应该调用后端 API）
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 完成关卡
            const submission = {
                type: level.submissionType,
                content: inputValue,
                imageUrl: imageUrl,
                verified: true
            }

            completeLevel(
                themeId!,
                parseInt(levelId!),
                submission,
                getNPCFeedback(level)
            )
            haptic('medium')

            // 研学任务 ↔ NPC 联动：完成关卡即解锁对应 NPC，并向 NPC 推送"下一步"引导
            const theme = getResearchThemeById(themeId!)
            if (theme?.npcId) {
                unlockNPC(theme.npcId, level.name)
                const next = getNextResearchLevel(themeId!)
                if (next) {
                    addMessage(theme.npcId, {
                        role: 'assistant',
                        content: `【下一步 · ${next.name}】${next.npcGuidance}`,
                        sceneId: 'research'
                    })
                } else {
                    addMessage(theme.npcId, {
                        role: 'assistant',
                        content: `【${theme.npcName}】这个主题的研学任务你全部完成啦，真厉害！去「研学」页生成你的专属研学报告和证书吧。`,
                        sceneId: 'research'
                    })
                }
            }

            // 显示知识卡片 → 之后按主题首次完成才弹商品推荐
            showKnowledgeCard(themeId!)

        } catch (error) {
            Taro.showToast({
                title: '提交失败，请重试',
                icon: 'none'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSkip = () => {
        Taro.showModal({
            title: '跳过此关',
            content: '跳过后不计入完成进度，报告中会标注"已跳过"。确定跳过？',
            success: (res) => {
                if (res.confirm) {
                    skipLevel(themeId!, parseInt(levelId!))
                    navigateBack()
                }
            }
        })
    }

    const getNPCFeedback = (lvl: any): string => {
        const npc = getNPCById(lvl.themeId === 'tea_culture' ? 'npc-fairy' : lvl.themeId === 'farming' ? 'npc-tea-farmer' : 'npc-soldier')
        const feedbacks = {
            'npc-fairy': '你看到了，你感受到了。白茶的秘密，你已经开始懂了。',
            'npc-tea-farmer': '不错不错，有悟性！我当年学这个可费了不少功夫。',
            'npc-soldier': '答得好，同志。这些知识不能忘。'
        }
        return feedbacks[npc?.id as keyof typeof feedbacks] || '完成得很好！'
    }

    const showKnowledgeCard = (themeId: string) => {
        if (!level?.knowledgeCard) {
            maybeShowRecommendation(themeId)
            return
        }

        Taro.showModal({
            title: level.knowledgeCard.title,
            content: level.knowledgeCard.content,
            showCancel: false,
            confirmText: '收藏',
            success: () => {
                // 收藏逻辑（可以保存到本地）
                console.log('[知识卡片] 已收藏:', level.knowledgeCard)
                maybeShowRecommendation(themeId)
            }
        })
    }

    /**
     * 任务完成推荐：同一主题仅首次完成弹窗（本地存储去重），打通「研学→卖茶」
     */
    const maybeShowRecommendation = (themeId: string) => {
        const flagKey = `rec_shown_${themeId}`
        if (storage.get<boolean>(flagKey)) {
            navigateBack()
            return
        }
        const products = getRecommendedProducts(themeId)
        if (!products.length) {
            navigateBack()
            return
        }
        storage.set(flagKey, true)
        track('task_recommend_show', 'pages/study-task/index', {
            themeId,
            productIds: products.map((p) => p.id)
        })
        setRecommendProducts(products)
    }

    /** 点击推荐商品或「去商城」→ 埋点并跳转商城 */
    const goShopWithRecommend = (productId?: number) => {
        if (productId) {
            track('task_recommend_click', 'pages/study-task/index', { productId })
        }
        setRecommendProducts([])
        navigateTo({ url: `/pages/shop/index${productId ? `?id=${productId}` : ''}` })
    }

    if (!level) {
        return (
            <View className='loading'>
                <Text>加载中...</Text>
            </View>
        )
    }

    const npc = getNPCById(level.themeId === 'tea_culture' ? 'npc-fairy' : level.themeId === 'farming' ? 'npc-tea-farmer' : 'npc-soldier')

    return (
        <View className='task-page'>
            {/* 顶部导航栏 */}
            <View className='nav-bar'>
                <View className='back-btn' onClick={() => navigateBack()}>
                    <Text>‹</Text>
                </View>
                <Text className='page-title'>{level.name}</Text>
                <View className='placeholder' />
            </View>

            {/* NPC 任务布置区 */}
            <View className='npc-task'>
                {npc && <NPCAvatar npc={npc} size={88} />}
                <View className='task-content'>
                    <Text className='npc-name'>{npc?.name}</Text>
                    <View className='task-bubble'>
                        <Text>{level.npcGuidance}</Text>
                    </View>
                </View>
            </View>

            {/* 任务说明 */}
            <View className='task-info'>
                <View className='info-item'>
                    <Text className='info-label'>任务描述</Text>
                    <Text className='info-content'>{level.description}</Text>
                </View>
                <View className='info-item'>
                    <Text className='info-label'>完成条件</Text>
                    <Text className='info-content'>{level.completionCondition}</Text>
                </View>
            </View>

            {/* 提交区域 */}
            <View className='submit-section'>
                {level.type === 'checkin' && (
                    <View className='checkin-status'>
                        <Text className='status-text'>{locationStatus}</Text>
                    </View>
                )}

                {level.type === 'observation' && (
                    <Textarea
                        className='input-area'
                        placeholder='记录你的观察...'
                        value={inputValue}
                        onInput={(e) => setInputValue(e.detail.value)}
                        onBlur={() => {
                            if (inputValue) {
                                saveLevelDraft(themeId!, parseInt(levelId!), inputValue)
                            }
                        }}
                        maxlength={500}
                    />
                )}

                {level.type === 'qa' && (
                    <Input
                        className='input-area'
                        placeholder='输入你的答案...'
                        value={inputValue}
                        onInput={(e) => setInputValue(e.detail.value)}
                    />
                )}

                {level.type === 'experience' && (
                    <View className='image-upload'>
                        {imageUrl ? (
                            <Image
                                className='uploaded-image'
                                src={imageUrl}
                                mode='aspectFill'
                                onClick={() => setImageUrl('')}
                            />
                        ) : (
                            <Button className='upload-btn' onClick={handleChooseImage}>
                                选择照片
                            </Button>
                        )}
                    </View>
                )}
            </View>

            {/* 底部按钮 */}
            <View className='action-buttons'>
                <Button className='skip-btn' onClick={handleSkip}>跳过此关</Button>
                <Button
                    className='submit-btn'
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? '提交中...' : '提交任务'}
                </Button>
            </View>

            {/* 任务完成推荐：研学 → 卖茶闭环（同主题仅首次弹） */}
            {recommendProducts.length > 0 && (
                <View className='rec-mask' onClick={() => goShopWithRecommend()}>
                    <View className='rec-card' onClick={(e: any) => e.stopPropagation()}>
                        <Text className='rec-title'>研学完成，带点好茶回家</Text>
                        <Text className='rec-sub'>为你推荐槎山茶园好物</Text>
                        <View className='rec-list'>
                            {recommendProducts.map((p) => (
                                <View
                                    key={p.id}
                                    className='rec-item'
                                    onClick={() => goShopWithRecommend(p.id)}
                                >
                                    <View
                                        className='rec-thumb'
                                        style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
                                    >
                                        <Icon name={p.emoji} size={48} color='white' />
                                    </View>
                                    <View className='rec-info'>
                                        <Text className='rec-name'>{p.name}</Text>
                                        <Text className='rec-desc'>{p.description}</Text>
                                        <Text className='rec-price'>¥{p.price}/{p.unit}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                        <View className='rec-actions'>
                            <Button className='rec-skip' onClick={() => goShopWithRecommend()}>暂不需要</Button>
                            <Button className='rec-go' onClick={() => goShopWithRecommend()}>去商城看看</Button>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}
