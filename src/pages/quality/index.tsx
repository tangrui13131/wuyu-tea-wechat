import React, { useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Icon from '@/components/Icon'
import Reveal from '@/components/Reveal'
import styles from './index.module.scss'
import { getQualityCompare, getProducts, getShopContact, track } from '@/services'
import { geographyData } from '@/data/quality'
import { startScan, handleQRCodeScan } from '@/utils/location'

interface CompareItem {
    metric: string
    chashan: { value: number; unit: string }
    normal: { value: number; unit: string }
    description: string
    benefit?: string
}
interface Product {
    id: number; name: string; category: string; description: string
    price: number; unit: string; image: string
}

const QualityPage: React.FC = () => {
    const [compare, setCompare] = useState<CompareItem[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [contact, setContact] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [online, setOnline] = useState(true)

    const loadData = async () => {
        setLoading(true)
        try {
            const [cmp, prods, ct] = await Promise.all([
                getQualityCompare(),
                getProducts('quality'),
                getShopContact()
            ])
            setCompare(cmp || [])
            setProducts(prods || [])
            setContact(ct)
            setOnline(!!(cmp && cmp.length))
        } catch (e) {
            setOnline(false)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [])
    useDidShow(() => { track('page_view', 'pages/quality/index') })

    const goShop = (p?: Product) => {
        track('shop_click', 'pages/quality/index', { productId: p?.id })
        Taro.navigateTo({ url: `/pages/shop/index${p ? `?id=${p.id}` : ''}` })
    }

    // 溯源验真：扫包装上的二维码
    const onScanVerify = async () => {
        const r = await startScan()
        if (r) handleQRCodeScan(r)
    }

    // 溯源验真：直接查看第一款茶（明前特级）的溯源信息
    const onViewTrace = () => {
        track('trace_view', 'pages/quality/index', { traceId: 'mingqian' })
        Taro.navigateTo({ url: '/pages/trace/index?traceId=mingqian' })
    }

    // 条宽按「该指标内两者较大值 = 满格」换算（设计稿 92%/31% 即此逻辑），
    // 不同指标量纲不同（% vs mg/kg），不能跨指标比长短
    const barPct = (item: CompareItem, value: number) => {
        const max = Math.max(item.chashan.value, item.normal.value)
        return max > 0 ? `${Math.round((value / max) * 94)}%` : '0%'
    }

    return (
        <ScrollView className={styles.qualityPage} scrollY>
            {/* 页头：金描边小签 + 宋体大标题 + 内联金线副题（设计稿「品质展示 - 槎山白茶审美升级」） */}
            <View className={styles.header}>
                <Text className={styles.headerTag}>北纬 31° 黄金产茶带</Text>
                <Text className={styles.headerTitle}>品质展示</Text>
                <View className={styles.subtitleRow}>
                    <View className={styles.subtitleLine} />
                    <Text className={styles.subtitleText}>山海云雾滋养的自然馈赠</Text>
                </View>
            </View>

            {/* 核心亮点：古籍题签风——纸底 + 金棕细线内框 + 右下「鲜」字水印 + 数字胶囊 */}
            <Reveal variant='fade-up' delay={40} className={styles.highlightCard}>
                <View className={styles.highlightFrame} />
                <Text className={styles.highlightWatermark}>鲜</Text>
                <View className={styles.highlightHeader}>
                    <Text className={styles.highlightBadge}>◆ 核心亮点</Text>
                    <Text className={styles.sealTag}>茶中珍品</Text>
                </View>
                <Text className={styles.highlightText}>
                    槎山白茶氨基酸含量高达
                    <Text className={styles.highlightNum}>6.8%</Text>
                    ，约为普通绿茶的
                    <Text className={styles.highlightNum}>3 倍</Text>
                    。高氨低酚的天然配比，造就了其鲜爽回甘、久泡不苦的独特韵味。
                </Text>
            </Reveal>

            {/* 品质对比：宋体小标题 + 图例置顶 + 纸卡横条（替代竖柱图，条宽=指标内两者相对占比） */}
            <View className={styles.section}>
                <View className={styles.compareHeader}>
                    <Text className={styles.compareTitle}>品质对比</Text>
                    <View className={styles.legendBox}>
                        <View className={styles.legendItem}>
                            <View className={`${styles.legendDot} ${styles.dotChashan}`} />
                            <Text className={styles.legendText}>槎山白茶</Text>
                        </View>
                        <View className={styles.legendItem}>
                            <View className={`${styles.legendDot} ${styles.dotNormal}`} />
                            <Text className={styles.legendText}>普通绿茶</Text>
                        </View>
                    </View>
                </View>
                {compare.length > 0 ? (
                    <Reveal variant='fade-up' delay={110} className={styles.compareCard}>
                        {compare.map((item, i) => (
                            <View key={i} className={styles.metricItem}>
                                <View className={styles.metricHeader}>
                                    <Text className={styles.metricTitle}>{item.metric}</Text>
                                    {item.benefit && <Text className={styles.metricBenefit}>{item.benefit}</Text>}
                                </View>
                                <View className={`${styles.barRow} ${styles.barPrimary}`}>
                                    <Text className={styles.barLabel}>槎山白茶</Text>
                                    <View className={styles.barTrack}>
                                        <View
                                            className={`${styles.barFill} ${styles.fillPrimary}`}
                                            style={{ width: barPct(item, item.chashan.value) }}
                                        />
                                    </View>
                                    <Text className={styles.barValue}>{item.chashan.value}{item.chashan.unit}</Text>
                                </View>
                                <View className={styles.barRow}>
                                    <Text className={styles.barLabel}>普通绿茶</Text>
                                    <View className={styles.barTrack}>
                                        <View
                                            className={`${styles.barFill} ${styles.fillSecondary}`}
                                            style={{ width: barPct(item, item.normal.value) }}
                                        />
                                    </View>
                                    <Text className={styles.barValue}>{item.normal.value}{item.normal.unit}</Text>
                                </View>
                            </View>
                        ))}
                        <Text className={styles.chartFootnote}>* 注：高氨基酸赋予茶汤鲜甜，适度偏低的茶多酚与咖啡碱使口感更温润不涩</Text>
                    </Reveal>
                ) : (
                    <View className={styles.empty}><Text>加载中...</Text></View>
                )}
            </View>

            {/* 溯源验真入口 */}
            <View className={styles.section}>
                <Text className={styles.sectionTitle}>茶叶溯源 · 验真</Text>
                <View className={styles.traceEntry}>
                    <View className={styles.traceBtn} onClick={onScanVerify}>
                        <Icon className={styles.traceBtnIcon} name='camera' size={32} color='white' />
                        <Text className={styles.traceBtnText}>扫一扫验真</Text>
                    </View>
                    <View className={styles.traceBtn} onClick={onViewTrace}>
                        <Icon className={styles.traceBtnIcon} name='search' size={32} color='white' />
                        <Text className={styles.traceBtnText}>查看茶叶溯源</Text>
                    </View>
                </View>
            </View>

            {/* 刚需④：品质看板 → 商城转化入口 */}
            {products.length > 0 && (
                <View className={styles.section}>
                    <View className={styles.sectionHeader}>
                        <Text className={styles.sectionTitle}>好茶带回家</Text>
                        <Text className={styles.sectionMore} onClick={() => goShop()}>查看全部 ›</Text>
                    </View>
                    <ScrollView className={styles.productScroll} scrollX>
                        {products.map(p => (
                            <View key={p.id} className={styles.productCard} onClick={() => goShop(p)}>
                                {p.image ? <Image className={styles.productImg} src={p.image} mode='aspectFill' /> : null}
                                <Text className={styles.productName}>{p.name}</Text>
                                <Text className={styles.productDesc}>{p.description}</Text>
                                <Text className={styles.productPrice}>¥{p.price}<Text className={styles.productUnit}>/{p.unit}</Text></Text>
                            </View>
                        ))}
                    </ScrollView>
                    {contact && contact.tip && (
                        <View className={styles.contactTip} onClick={() => goShop()}>
                            <Text className={styles.contactText}>{contact.tip}</Text>
                        </View>
                    )}
                </View>
            )}

            <View className={styles.section}>
                {/* 模块标题：宋体 + 英文副题（设计稿「地理参数 - 槎山白茶审美升级」） */}
                <View className={styles.moduleHeader}>
                    <Text className={styles.moduleTitle}>地理参数</Text>
                    <Text className={styles.moduleEn}>TERROIR &amp; CLIMATE</Text>
                </View>

                <Reveal variant='fade-up' delay={40} className={styles.geoBoard}>
                    {/* 右上等高线暗纹：小程序无内联 SVG，data-URI 背景承载（同纸纹方案） */}
                    <View className={styles.topoWatermark} />

                    {/* 黄金产茶带小标题 */}
                    <View className={styles.beltHeader}>
                        <View className={styles.beltTitleWrap}>
                            <View className={styles.beltBar} />
                            <Text className={styles.beltTitle}>{geographyData.belt.title}</Text>
                        </View>
                        <Text className={styles.beltBadge}>{geographyData.belt.badge}</Text>
                    </View>

                    {/* 经纬罗盘通栏：左纬右经，中置罗盘十字 */}
                    <View className={styles.coordBanner}>
                        <View className={styles.coordItem}>
                            <Text className={styles.coordLabel}>{geographyData.coords[0].label}</Text>
                            <View className={styles.coordValue}>
                                <Text className={styles.coordDir}>{geographyData.coords[0].dir}</Text>
                                <Text>{geographyData.coords[0].value}</Text>
                            </View>
                        </View>
                        <View className={styles.coordDivider}>
                            <Icon name='crosshair' size={44} color='geo' />
                        </View>
                        <View className={`${styles.coordItem} ${styles.alignRight}`}>
                            <Text className={styles.coordLabel}>{geographyData.coords[1].label}</Text>
                            <View className={styles.coordValue}>
                                <Text className={styles.coordDir}>{geographyData.coords[1].dir}</Text>
                                <Text>{geographyData.coords[1].value}</Text>
                            </View>
                        </View>
                    </View>

                    {/* 四宫格风物参数：数值型拆「数字 + 单位」，文字型（土壤）整段走 paramTextVal */}
                    <View className={styles.paramGrid}>
                        {geographyData.params.map((p, i) => (
                            <View key={i} className={styles.paramCard}>
                                <View className={styles.paramTop}>
                                    <Text className={styles.paramLabel}>{p.label}</Text>
                                    <Icon name={p.icon} size={32} color='accentText' style={{ opacity: 0.65 }} />
                                </View>
                                {p.unit ? (
                                    <View className={styles.paramBottom}>
                                        <Text className={styles.paramNum}>{p.value}</Text>
                                        <Text className={styles.paramUnit}>{p.unit}</Text>
                                    </View>
                                ) : (
                                    <Text className={styles.paramTextVal}>{p.value}</Text>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* 底部风物按语：hl 段渲染为金点下划线强调 */}
                    <View className={styles.geoSummary}>
                        <View className={styles.summaryText}>
                            {geographyData.summary.map((s, i) => (
                                <Text key={i} className={s.hl ? styles.summaryHighlight : ''}>
                                    {s.text}
                                </Text>
                            ))}
                        </View>
                    </View>
                </Reveal>
            </View>

            {!online && !loading && (
                <View className={styles.offlineTip}>
                    <Text className={styles.offlineText}>当前为离线演示数据（未连接后端服务）</Text>
                </View>
            )}
        </ScrollView>
    )
}

export default QualityPage
