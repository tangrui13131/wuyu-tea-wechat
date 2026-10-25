import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import Icon from '@/components/Icon'
import { track } from '@/services'
import type { Route } from '@/types/route'

interface RouteCardProps {
    route: Route
    onClick?: () => void
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onClick }) => {
    /** 查看详情：与「开始游览」一致带 routeId，进入后地图/列表以该路线为上下文，
     *  避免「点开红色教育路线却看到茶园」的内容错位。 */
    const handleViewDetail = () => {
        track('route_view_detail', 'components/RouteCard', { routeId: route.id })
        Taro.navigateTo({
            url: `/pages/route-detail/index?routeId=${route.id}`
        })
    }

    /**
     * 开始游览：进入园区电子地图，并带上当前路线作为游览上下文。
     * 地图页会显示「正在游览」横幅、按路线顺序标注站点序号，
     * 到达景点围栏时依旧自动解锁 NPC 讲解与打卡。
     */
    const handleStartTour = () => {
        track('route_start_tour', 'components/RouteCard', { routeId: route.id })
        Taro.navigateTo({
            url: `/pages/route-detail/index?routeId=${route.id}`
        })
    }

    return (
        <View className={styles.routeCard} onClick={onClick}>
            <View
                className={styles.routeCover}
                style={
                    route.coverImage
                        ? undefined
                        : {
                              background: `linear-gradient(135deg, ${route.coverGradient?.[0] || '#4A7C59'} 0%, ${route.coverGradient?.[1] || '#3D6B3C'} 100%)`
                          }
                }
            >
                {route.coverImage ? (
                    <>
                        <Image className={styles.routeCoverPic} src={route.coverImage} mode='aspectFill' />
                        <View className={styles.routeCoverMask} />
                        <Text className={styles.routeCoverName}>{route.name}</Text>
                    </>
                ) : (
                    <>
                        <Icon className={styles.routeCoverEmoji} name={route.coverEmoji || 'tea'} size={72} color='white' />
                        <Text className={styles.routeCoverName}>{route.name}</Text>
                    </>
                )}
            </View>
            <View className={styles.routeContent}>
                <Text className={styles.routeName}>{route.name}</Text>
                <Text className={styles.routeDesc}>{route.description}</Text>
                <View className={styles.routeMeta}>
                    <View className={styles.metaItem}>
                        <Text className={styles.metaLabel}>时长</Text>
                        <Text className={styles.metaValue}>{route.estimatedDuration}</Text>
                    </View>
                    <View className={styles.metaItem}>
                        <Text className={styles.metaLabel}>难度</Text>
                        <Text className={styles.metaValue}>
                            {route.difficulty === 'easy' ? '简单' : route.difficulty === 'medium' ? '中等' : '困难'}
                        </Text>
                    </View>
                </View>
                <View className={styles.routeTags}>
                    {route.tags.map((tag, index) => (
                        <View key={index} className={styles.routeTag}>
                            <Text className={styles.routeTagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
                <View className={styles.routeActions}>
                    <View className={styles.viewDetailBtn} onClick={handleViewDetail}>
                        <Text className={styles.detailBtnText}>查看详情</Text>
                    </View>
                    <View className={styles.startTourBtn} onClick={handleStartTour}>
                        <Text className={styles.startTourBtnText}>开始游览</Text>
                        {/* 主按钮右侧的引导箭头：把「开始」这件事指向下一个页面 */}
                        <Icon name='arrowRight' size={30} color='white' />
                    </View>
                </View>
            </View>
        </View>
    )
}

export default RouteCard
