import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Icon from '@/components/Icon'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import TagSelector from '@/components/TagSelector'
import RouteCard from '@/components/RouteCard'
import Reveal from '@/components/Reveal'
import Seal from '@/components/Seal'
import Motif from '@/components/Motif'
import RubberSegment from '@/components/RubberSegment'
import { getTagOptions } from '@/utils/routeMatcher'
import { matchRoutes } from '@/utils/routeMatcher'
import { userPreferencesStorage } from '@/utils/storage'
import { recommend, getComboRoutes, track } from '@/services'
import { netState } from '@/utils/request'
import { handleQRCodeScan, startScan } from '@/utils/location'
import type { UserPreferences } from '@/types/route'
import { IMG } from '@/assets/images'
import { haptic } from '@/utils/feedback'

const HomePage: React.FC = () => {
    const tagOptions = getTagOptions()

    const [showForm, setShowForm] = useState(false)
    const [preferences, setPreferences] = useState<UserPreferences>({
        travelType: [],
        duration: '',
        interests: []
    })
    const [matchedRoutes, setMatchedRoutes] = useState<any[]>([])
    const [comboRoutes, setComboRoutes] = useState<any[]>([])
    const [recommendInfo, setRecommendInfo] = useState<{
        name?: string; score?: number; reasons?: string[]
        stageName?: string; cfNote?: string; cfActive?: boolean
    }>({})
    const [loading, setLoading] = useState(false)
    const [online, setOnline] = useState(true)

    /** 调起微信扫一扫，按二维码类型统一路由（溯源码 / NPC 触发码） */
    const handleScan = async () => {
        const r = await startScan()
        if (r) await handleQRCodeScan(r)
    }
    const [locationStatus, setLocationStatus] = useState('湖北·安陆槎山')
    const [openStatus, setOpenStatus] = useState('开放中')

    useEffect(() => {
        track('page_view', 'pages/home/index')

        const savedPrefs = userPreferencesStorage.get()
        if (savedPrefs) {
            setPreferences(savedPrefs)
            fetchRecommend(savedPrefs)
        } else {
            setShowForm(true)
        }
    }, [])

    /** 调后端推荐服务（规则匹配 40/30/30 + 联动线路） */
    const fetchRecommend = async (prefs: UserPreferences) => {
        setLoading(true)
        try {
            const res: any = await recommend({
                travelType: (prefs.travelType || [])[0] || '',
                duration: prefs.duration || '',
                interests: prefs.interests || []
            })
            if (res?.recommended) {
                setMatchedRoutes([res.recommended, ...(res.alternatives || [])])
                setRecommendInfo({
                    name: res.recommended.name,
                    score: res.recommended.matchScore,
                    reasons: res.recommended.reasons,
                    stageName: res.stageName,
                    cfNote: res.cf?.note,
                    cfActive: !!res.cf?.active
                })
                setComboRoutes(res.comboRoutes || [])
            } else {
                // 后端无推荐结果时退回本地全部线路，避免推荐区空白
                setMatchedRoutes(matchRoutes(prefs))
                setRecommendInfo({})
            }
            setOnline(netState.online)
        } catch (e) {
            // 降级：本地规则匹配
            setOnline(false)
            const routes = matchRoutes(prefs)
            setMatchedRoutes(routes)
            const list: any[] = await getComboRoutes().catch(() => [])
            setComboRoutes(list)
        } finally {
            setLoading(false)
        }
    }

    const handleTagSelect = (type: keyof UserPreferences, value: string) => {
        setPreferences(prev => {
            const current = prev[type] as string[]
            if (type === 'duration') return { ...prev, duration: value }
            if (Array.isArray(current)) {
                const isSelected = current.includes(value)
                const newTags = isSelected ? current.filter(t => t !== value) : [...current, value]
                return { ...prev, [type]: newTags }
            }
            return prev
        })
    }

    const handleSubmit = () => {
        haptic('light')
        userPreferencesStorage.set(preferences)
        track('route_select', 'pages/home/index', preferences)
        fetchRecommend(preferences)
        setShowForm(false)
    }

    /**
     * 跳过偏好采集：仍要出推荐结果。
     * 原实现只关闭表单、不请求推荐，导致跳过之后推荐区一片空白（显示"暂无推荐路线"）。
     * 偏好为空时后端会给出全部线路供浏览，与"未采集偏好"的预期一致。
     */
    const handleSkip = () => {
        setShowForm(false)
        fetchRecommend(preferences)
    }

    const handleOpenMap = () => {
        track('quick_entry_map', 'pages/home/index')
        Taro.navigateTo({ url: '/pages/route-detail/index' })
    }

    return (
        <ScrollView className={styles.homePage} scrollY>
            <View className={styles.header}>
                {/* 纪实照片垫底：小程序 wxss 的 background-image 不支持本地相对路径，
                    所以用绝对定位的 <Image> 当底图，内容层再抬到 z-index 之上 */}
                <Image className={styles.heroBg} src={IMG.hero.field} mode="aspectFill" />
                <View className={styles.heroScrim} />
                <View className={styles.heroContent}>
                    <View className={styles.heroBadge}>
                        <Image className={styles.heroLogo} src={IMG.brand.logo} mode="aspectFill" />
                        <Text>湖北安陆 · 槎山白茶</Text>
                    </View>
                    <View className={styles.headerTop}>
                        <Text className={styles.headerTitle}>槎山智慧文旅</Text>
                        <View className={styles.statusBar}>
                            <View className={styles.statusItem}>
                                <Icon className={styles.statusIcon} name='pin' size={24} color='onDark' />
                                <Text className={styles.statusText}>{locationStatus}</Text>
                            </View>
                            <View className={styles.statusItem}>
                                <Icon className={styles.statusIcon} name='clock' size={24} color='onDark' />
                                <Text className={styles.statusText}>开放 08:30–17:30</Text>
                            </View>
                            <View className={styles.statusItem}>
                                <Icon className={styles.statusIcon} name='check' size={24} color='onDark' />
                                <Text className={styles.statusText}>{openStatus}</Text>
                            </View>
                        </View>
                    </View>
                    <Text className={styles.headerDesc}>为您定制专属游览路线</Text>
                </View>
                {/* 落款：一张图配一枚朱印，页面立刻从「设计稿」变成「文档」 */}
                <Seal text='槎山' size={76} className={styles.heroSeal} />
            </View>

            <Reveal variant="fade-up" delay={40} className={styles.quickEntry} onClick={handleOpenMap}>
                <View className={styles.quickIconWrap}>
                    <Icon className={styles.quickIcon} name='map' size={44} color='primary' />
                </View>
                <View className={styles.quickTextBox}>
                    <Text className={styles.quickTitle}>园区导览地图</Text>
                    <Text className={styles.quickDesc}>6个景点 · 到达自动触发讲解</Text>
                </View>
                <Text className={styles.quickArrow}>›</Text>
            </Reveal>

            <Reveal variant="fade-up" delay={110} className={styles.quickEntry} onClick={handleScan}>
                <View className={styles.quickIconWrap}>
                    <Icon className={styles.quickIcon} name='search' size={44} color='primary' />
                </View>
                <View className={styles.quickTextBox}>
                    <Text className={styles.quickTitle}>扫一扫 · 验真/触发 NPC</Text>
                    <Text className={styles.quickDesc}>扫描茶包溯源码或景点 NPC 码</Text>
                </View>
                <Text className={styles.quickArrow}>›</Text>
            </Reveal>

            {!online && (
                <View className={styles.offlineBar}>
                    <Image className={styles.offlineIcon} src={IMG.states.offline} mode="aspectFill" />
                    <Text className={styles.offlineBarText}>当前为离线演示数据（后端未连接）· 勾选开发者工具「不校验合法域名」并启动后端即可看真实数据</Text>
                </View>
            )}

            {/* 章节分隔：茶枝线描，比单纯拉大间距更像「翻页」 */}
            <View className={styles.motifDivider}>
                <Motif name='branch' height={40} color='accent' opacity={0.5} />
            </View>

            {showForm ? (
                <View className={styles.section}>
                    <Text className={styles.sectionTitle}>您的偏好是？</Text>
                    <View className={styles.formCard}>
                        <TagSelector
                            title="出行类型"
                            options={tagOptions.travelType}
                            selected={preferences.travelType}
                            multiple={true}
                            onSelect={(value) => handleTagSelect('travelType', value)}
                        />
                        <View className={styles.segmentField}>
                            <Text className={styles.segmentTitle}>停留时长</Text>
                            <RubberSegment
                                options={tagOptions.duration}
                                value={preferences.duration || tagOptions.duration[0]}
                                onChange={(value) => {
                                    if (value !== preferences.duration) handleTagSelect('duration', value)
                                }}
                            />
                        </View>
                        <TagSelector
                            title="兴趣偏好"
                            options={tagOptions.interests}
                            selected={preferences.interests}
                            multiple={true}
                            onSelect={(value) => handleTagSelect('interests', value)}
                        />
                        <View className={styles.buttonGroup}>
                            <View className={styles.submitBtn} hoverClass={styles.btnPress} onClick={handleSubmit}>
                                <Text className={styles.btnText}>{loading ? '生成中...' : '生成路线'}</Text>
                            </View>
                            <View className={styles.skipBtn} hoverClass={styles.btnPress} onClick={handleSkip}>
                                <Text className={styles.btnText}>跳过</Text>
                            </View>
                        </View>
                    </View>
                </View>
            ) : (
                <>
                    <Reveal variant="fade-up" className={styles.section}>
                        <Text className={styles.sectionTitle}>为您推荐的场景线路</Text>

                        {/* 推荐引擎阶段（对齐 BP 三阶段：规则 → 行为采集 → 协同过滤） */}
                        {recommendInfo.stageName && (
                            <View className={styles.engineBar}>
                                <Icon className={styles.engineIcon} name='gear' size={28} color='accentText' />
                                <View className={styles.engineCol}>
                                    <Text className={styles.engineName}>
                                        推荐引擎：{recommendInfo.stageName}
                                    </Text>
                                    {recommendInfo.cfNote ? (
                                        <Text className={styles.engineNote}>{recommendInfo.cfNote}</Text>
                                    ) : null}
                                </View>
                            </View>
                        )}

                        {recommendInfo.reasons && recommendInfo.reasons.length > 0 && (
                            <View className={styles.reasonBar}>
                                <Text className={styles.reasonText}>
                                    匹配度 {recommendInfo.score}% · {recommendInfo.reasons?.join('、')}
                                </Text>
                            </View>
                        )}
                        <View className={styles.routeList}>
                            {matchedRoutes.length > 0 ? (
                                matchedRoutes.map((route) => (
                                    <RouteCard key={route.id} route={route} />
                                ))
                            ) : (
                                <Text className={styles.emptyTip}>暂无推荐路线</Text>
                            )}
                        </View>
                    </Reveal>

                    {/* 调研刚需③：周边景区联动线路 */}
                    {comboRoutes.length > 0 && (
                        <Reveal variant="fade-up" delay={80} className={styles.section}>
                            <Text className={styles.sectionTitle}>周边联动线路</Text>
                            {comboRoutes.map((c: any) => (
                                <View key={c.id} className={styles.comboCard}>
                                    <Text className={styles.comboName}>{c.name}</Text>
                                    <Text className={styles.comboPartner}>联动：{c.partnerScenic}</Text>
                                    <Text className={styles.comboDesc}>{c.description}</Text>
                                    <View className={styles.comboFooter}>
                                        <Text className={styles.comboMeta}>{c.duration} · {c.priceDesc}</Text>
                                        <Text className={styles.comboHighlight}>{c.highlight}</Text>
                                    </View>
                                </View>
                            ))}
                        </Reveal>
                    )}
                </>
            )}
        </ScrollView>
    )
}

export default HomePage
