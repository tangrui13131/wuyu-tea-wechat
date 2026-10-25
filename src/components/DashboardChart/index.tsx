import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

export interface ChartItem {
    label: string
    value: number
}

export type ChartType = 'bar' | 'hbar' | 'ratio'

interface DashboardChartProps {
    type: ChartType
    data: ChartItem[]
    unit?: string
    color?: string
    /** 空数据占位文案 */
    emptyText?: string
}

/**
 * 轻量图表组件（纯 View 实现，无第三方依赖）
 * bar   - 竖向柱状，适合时间序列（如近7日客流）
 * hbar  - 横向条形，适合 TOP 排行（如热门点位、商品销量）
 * ratio - 占比横条，适合构成分析（如游客画像、兴趣分布）
 */
const DashboardChart: React.FC<DashboardChartProps> = ({
    type,
    data,
    unit = '',
    color = '#4A7C59',
    emptyText = '暂无数据'
}) => {
    if (!data || data.length === 0) {
        return <Text className={styles.empty}>{emptyText}</Text>
    }

    const maxValue = Math.max(...data.map(d => d.value), 1)
    const total = data.reduce((s, d) => s + d.value, 0) || 1

    // ---------- 竖向柱状 ----------
    if (type === 'bar') {
        return (
            <View className={styles.barChart}>
                {data.map((item, index) => {
                    const heightPercent = Math.max((item.value / maxValue) * 100, 4)
                    return (
                        <View key={index} className={styles.barGroup}>
                            <Text className={styles.barValue}>
                                {item.value}{unit}
                            </Text>
                            <View className={styles.barTrack}>
                                <View
                                    className={styles.barFill}
                                    style={{ height: `${heightPercent}%`, background: color }}
                                />
                            </View>
                            <Text className={styles.barLabel}>{item.label}</Text>
                        </View>
                    )
                })}
            </View>
        )
    }

    // ---------- 横向条形 ----------
    if (type === 'hbar') {
        return (
            <View className={styles.hbarChart}>
                {data.map((item, index) => {
                    const widthPercent = Math.max((item.value / maxValue) * 100, 3)
                    return (
                        <View key={index} className={styles.hbarRow}>
                            <Text className={styles.hbarLabel}>{item.label}</Text>
                            <View className={styles.hbarTrack}>
                                <View
                                    className={styles.hbarFill}
                                    style={{ width: `${widthPercent}%`, background: color }}
                                />
                            </View>
                            <Text className={styles.hbarValue}>
                                {item.value}{unit}
                            </Text>
                        </View>
                    )
                })}
            </View>
        )
    }

    // ---------- 占比横条 ----------
    const palette = [color, '#C49A6C', '#165DFF', '#C41E3A', '#7AB379', '#86909C']
    return (
        <View className={styles.ratioChart}>
            {data.map((item, index) => {
                const percent = Math.round((item.value / total) * 1000) / 10
                return (
                    <View key={index} className={styles.ratioRow}>
                        <View className={styles.ratioHeader}>
                            <Text className={styles.ratioLabel}>{item.label}</Text>
                            <Text className={styles.ratioPercent}>{percent}%</Text>
                        </View>
                        <View className={styles.ratioTrack}>
                            <View
                                className={styles.ratioFill}
                                style={{
                                    width: `${Math.max(percent, 2)}%`,
                                    background: palette[index % palette.length]
                                }}
                            />
                        </View>
                    </View>
                )
            })}
        </View>
    )
}

export default DashboardChart
