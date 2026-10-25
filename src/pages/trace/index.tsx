import React, { useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import styles from './index.module.scss'
import Icon from '@/components/Icon'
import { TRACE_LIST, getTraceByKey, type TraceData } from '@/data/trace'
import { track } from '@/services'
import { IMG } from '@/assets/images'

/** 溯源配图；无真实图片时回退为「渐变 + 线性图标」占位块 */
const Placeholder: React.FC<{ icon: string; gradient: [string, string]; label?: string; src?: string }> = ({ icon, gradient, label, src }) => (
    <View
        className={styles.placeholder}
        style={{ background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)` }}
    >
        {src ? (
            <Image className={styles.placeholderImg} src={src} mode="aspectFill" />
        ) : (
            <Icon className={styles.placeholderEmoji} name={icon} size={72} color='white' />
        )}
        {label ? <Text className={styles.placeholderLabel}>{label}</Text> : null}
    </View>
)

const TraceSectionCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <View className={styles.card}>
        <View className={styles.cardHead}>
            <Icon name={icon} size={30} color='accentText' />
            <Text className={styles.cardTitle}>{title}</Text>
        </View>
        {children}
    </View>
)

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View className={styles.row}>
        <Text className={styles.rowLabel}>{label}</Text>
        <Text className={styles.rowValue}>{value}</Text>
    </View>
)

const TracePage: React.FC = () => {
    const [list] = useState<TraceData[]>(TRACE_LIST)
    const [current, setCurrent] = useState<TraceData>(TRACE_LIST[0])

    useEffect(() => {
        const inst: any = Taro.getCurrentInstance()
        const id = inst?.router?.params?.traceId
        if (id) {
            const t = getTraceByKey(id)
            if (t) setCurrent(t)
        }
    }, [])

    useDidShow(() => { track('page_view', 'pages/trace/index', { traceId: current.traceId }) })

    const select = (t: TraceData) => {
        setCurrent(t)
        track('trace_switch', 'pages/trace/index', { traceId: t.traceId })
    }

    return (
        <ScrollView className={styles.tracePage} scrollY>
            <View className={styles.header}>
                <Text className={styles.headerTitle}>茶叶溯源</Text>
                <View className={styles.headerRule} />
                <Text className={styles.headerDesc}>从茶园到茶杯，每一片叶子都查得到</Text>
            </View>

            {/* 产品切换 */}
            <View className={styles.tabBar}>
                {list.map(t => (
                    <View
                        key={t.traceId}
                        className={`${styles.tab} ${t.traceId === current.traceId ? styles.tabActive : ''}`}
                        onClick={() => select(t)}
                    >
                        <Icon className={styles.tabEmoji} name={t.emoji} size={36} color={t.traceId === current.traceId ? 'white' : 'tertiary'} />
                        <Text className={styles.tabText}>{t.productLevel}</Text>
                    </View>
                ))}
            </View>

            {/* 基础信息 */}
            <View className={styles.infoCard}>
                <Text className={styles.productName}>{current.productName}</Text>
                <View className={styles.tagRow}>
                    <Text className={styles.tag}>{current.productLevel}</Text>
                    <Text className={styles.tag}>{current.netWeight}</Text>
                    <Text className={styles.tag}>{current.origin}</Text>
                </View>
                <View className={styles.baseGrid}>
                    <Row label="生产日期" value={current.productionDate} />
                    <Row label="保质期" value={current.shelfLife} />
                    <Row label="储存条件" value={current.storageCondition} />
                    <Row label="生产厂家" value={current.manufacturer} />
                </View>
            </View>

            {/* 茶园信息 */}
            <TraceSectionCard icon="pin" title="茶园信息">
                <Placeholder icon="leaf" gradient={current.gradient} label={current.teaGarden.name} src={IMG.trace.coreGarden} />
                <Row label="片区" value={current.teaGarden.area} />
                <Row label="海拔" value={current.teaGarden.altitude} />
                <Row label="土壤类型" value={current.teaGarden.soilType} />
                <Text className={styles.desc}>{current.teaGarden.description}</Text>
            </TraceSectionCard>

            {/* 采摘信息 */}
            <TraceSectionCard icon="leaf" title="采摘信息">
                <Placeholder icon="leaf" gradient={current.gradient} label="采茶现场" src={IMG.trace.ecoGarden} />
                <Row label="采摘日期" value={current.picking.date} />
                <Row label="采摘标准" value={current.picking.standard} />
                <Row label="采茶人" value={current.picking.worker} />
                <Row label="当天天气" value={current.picking.weather} />
            </TraceSectionCard>

            {/* 加工信息 */}
            <TraceSectionCard icon="chef" title="加工信息">
                <Placeholder icon="fire" gradient={current.gradient} label="制茶工坊" src={IMG.trace.workshop} />
                <Row label="加工日期" value={current.processing.date} />
                <Row label="加工师傅" value={current.processing.master} />
                <View className={styles.steps}>
                    {current.processing.steps.map((s, i) => (
                        <Text key={i} className={styles.step}>{s}</Text>
                    ))}
                </View>
                <View className={styles.params}>
                    {current.processing.keyParams.map((p, i) => (
                        <View key={i} className={styles.paramItem}>
                            <Text className={styles.paramName}>{p.name}</Text>
                            <Text className={styles.paramValue}>{p.value}</Text>
                        </View>
                    ))}
                </View>
            </TraceSectionCard>

            {/* 检测信息 */}
            <TraceSectionCard icon="check" title="检测信息">
                <Row label="品质检测" value={current.testing.qualityReport} />
                <Row label="农残检测" value={current.testing.pesticideReport} />
                {current.testing.thirdParty ? (
                    <Row label="第三方" value={current.testing.thirdParty} />
                ) : null}
            </TraceSectionCard>

            {/* 品牌故事 */}
            <TraceSectionCard icon="book" title="品牌故事">
                <Text className={styles.desc}>{current.brandStory}</Text>
            </TraceSectionCard>

            <View className={styles.trustBadge}>
                <Icon className={styles.trustIcon} name="lock" size={26} color="accentText" />
                <Text className={styles.trustText}>数据真实可追溯 · 扫码验真</Text>
            </View>
        </ScrollView>
    )
}

export default TracePage
