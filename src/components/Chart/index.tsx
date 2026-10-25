import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface BarChartProps {
    data: Array<{
        label: string
        value1: number
        value2: number
        unit: string
    }>
    name1: string
    name2: string
}

const SimpleBarChart: React.FC<BarChartProps> = ({ data, name1, name2 }) => {
    const maxValue = Math.max(
        ...data.flatMap(item => [item.value1, item.value2])
    )

    return (
        <View className={styles.barChart}>
            {data.map((item, index) => {
                const height1 = (item.value1 / maxValue) * 200
                const height2 = (item.value2 / maxValue) * 200

                return (
                    <View key={index} className={styles.barGroup}>
                        <View className={styles.barContainer}>
                            <View className={styles.barWrapper}>
                                <View
                                    className={styles.bar1}
                                    style={{ height: `${height1}rpx` }}
                                />
                                <Text className={styles.barValue}>{item.value1}{item.unit}</Text>
                            </View>
                            <View className={styles.barWrapper}>
                                <View
                                    className={styles.bar2}
                                    style={{ height: `${height2}rpx` }}
                                />
                                <Text className={styles.barValue}>{item.value2}{item.unit}</Text>
                            </View>
                        </View>
                        <Text className={styles.barLabel}>{item.label}</Text>
                    </View>
                )
            })}
            <View className={styles.legend}>
                <View className={styles.legendItem}>
                    <View className={styles.legendColor1} />
                    <Text className={styles.legendText}>{name1}</Text>
                </View>
                <View className={styles.legendItem}>
                    <View className={styles.legendColor2} />
                    <Text className={styles.legendText}>{name2}</Text>
                </View>
            </View>
        </View>
    )
}

export default SimpleBarChart
