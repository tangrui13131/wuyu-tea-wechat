import React, { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Icon from '@/components/Icon'
import styles from './index.module.scss'
import { getProducts, getShopContact, track } from '@/services'
import { getTraceByProductId } from '@/data/trace'
import SpotlightCard from '@/components/SpotlightCard'
import { IMG } from '@/assets/images'

interface Product {
    id: number; name: string; category: string; description: string
    price: number; unit: string; image: string; recommendScene: string
    /** 无真实图片时的占位图标与渐变色（本地兜底数据提供） */
    emoji?: string; gradient?: [string, string]
}

/** 商品占位视觉：有真实图片用图片，没有则渲染「渐变 + 线性图标」 */
const ProductThumb: React.FC<{ p: Product; className: string; emojiClass: string; iconSize?: number }> = ({ p, className, emojiClass, iconSize = 64 }) => (
    p.image
        ? <Image className={className} src={p.image} mode='aspectFill' />
        : <View
            className={className}
            style={{ background: `linear-gradient(135deg, ${p.gradient?.[0] || '#9CC5A1'} 0%, ${p.gradient?.[1] || '#4A7C59'} 100%)` }}
        >
            <Icon className={emojiClass} name={p.emoji || 'tea'} size={iconSize} color='white' />
        </View>
)

const ShopPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [contact, setContact] = useState<any>(null)
    const [category, setCategory] = useState('全部')
    const [current, setCurrent] = useState<Product | null>(null)

    const categories = ['全部', '白茶', '茶礼', '文创']

    useEffect(() => {
        load()
        const inst: any = Taro.getCurrentInstance()
        const id = inst?.router?.params?.id
        if (id) {
            getProducts().then(list => {
                const p = (list || []).find((x: any) => String(x.id) === String(id))
                if (p) { setCurrent(p); track('shop_view', 'pages/shop/index', { productId: id }) }
            }).catch(() => { })
        }
    }, [])

    const load = async () => {
        try {
            const [list, ct] = await Promise.all([getProducts(), getShopContact()])
            setProducts(list || [])
            setContact(ct)
        } catch (e) { /* 离线：显示空态 */ }
    }

    const filtered = category === '全部' ? products : products.filter(p => p.category === category)

    const copyWechat = () => {
        if (!contact?.serviceWechat) {
            Taro.showToast({ title: '暂未配置客服微信号', icon: 'none' })
            return
        }
        Taro.setClipboardData({
            data: contact.serviceWechat,
            success: () => Taro.showToast({ title: '微信号已复制' })
        })
        track('shop_contact_copy', 'pages/shop/index')
    }

    return (
        <ScrollView className={styles.shopPage} scrollY>
            <View className={styles.header}>
                <Text className={styles.headerTitle}>槎山茶礼</Text>
                <Text className={styles.headerDesc}>把北纬 31 度的茶香带回家</Text>
            </View>

            {current ? (
                <View className={styles.detailCard}>
                    <ProductThumb p={current} className={styles.detailImg} emojiClass={styles.detailEmoji} iconSize={120} />
                    <Text className={styles.detailName}>{current.name}</Text>
                    <Text className={styles.detailPrice}>¥{current.price}<Text className={styles.unit}>/{current.unit}</Text></Text>
                    <Text className={styles.detailDesc}>{current.description}</Text>
                    {getTraceByProductId(current.id) ? (
                        <Button
                            className={styles.traceBtn}
                            onClick={() => {
                                const t = getTraceByProductId(current.id)
                                track('trace_view', 'pages/shop/index', { traceId: t?.traceId, productId: current.id })
                                Taro.navigateTo({ url: `/pages/trace/index?traceId=${t?.traceId}` })
                            }}
                        >查看茶叶溯源</Button>
                    ) : null}
                    <Button className={styles.backBtn} onClick={() => setCurrent(null)}>返回列表</Button>
                </View>
            ) : (
                <>
                    <ScrollView className={styles.catBar} scrollX>
                        {categories.map(c => (
                            <Text
                                key={c}
                                className={`${styles.catItem} ${category === c ? styles.catActive : ''}`}
                                onClick={() => setCategory(c)}
                            >{c}</Text>
                        ))}
                    </ScrollView>

                    <View className={styles.grid}>
                        {filtered.map(p => (
                            <SpotlightCard
                                key={p.id}
                                className={styles.card}
                                glowColor="rgba(185, 142, 78, 0.34)"
                                onClick={() => { setCurrent(p); track('shop_view', 'pages/shop/index', { productId: p.id }) }}
                            >
                                <ProductThumb p={p} className={styles.cardImg} emojiClass={styles.cardEmoji} />
                                <Text className={styles.cardName}>{p.name}</Text>
                                <Text className={styles.cardDesc}>{p.description}</Text>
                                <Text className={styles.cardPrice}>¥{p.price}<Text className={styles.unit}>/{p.unit}</Text></Text>
                            </SpotlightCard>
                        ))}
                        {filtered.length === 0 && (
                            <View className={styles.empty}>
                                <Image className={styles.emptyImg} src={IMG.states.empty} mode="aspectFill" />
                                <Text className={styles.emptyText}>暂无商品（请确认后端已启动）</Text>
                            </View>
                        )}
                    </View>
                </>
            )}

            {/* 客服引导：不做小程序内支付（学生主体无支付资质） */}
            {contact && (
                <View className={styles.contactCard}>
                    <Text className={styles.contactTitle}>咨询与购买</Text>
                    <Text className={styles.contactTip}>
                        {contact.qrcode
                            ? contact.tip
                            : `添加茶园客服微信 ${contact.serviceWechat || ''}，可咨询团购、研学包场与茶礼定制`}
                    </Text>
                    {contact.qrcode ? <Image className={styles.qrcode} src={contact.qrcode} mode='aspectFit' showMenuByLongpress /> : null}
                    <Button className={styles.copyBtn} hoverClass={styles.btnPress} onClick={copyWechat}>复制客服微信号</Button>
                    <Text className={styles.contactNote}>{contact.note}</Text>
                </View>
            )}
        </ScrollView>
    )
}

export default ShopPage
