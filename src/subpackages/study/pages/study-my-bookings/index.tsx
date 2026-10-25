import React, { useState, useEffect } from 'react'
import Taro, { navigateTo } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { getMyBookings, cancelBooking, track } from '@/services'
import './index.scss'



const STATUS_MAP: any = {
  pending: { text: '待确认', color: '#e0792b', bg: '#fdf0e3' },
  confirmed: { text: '已确认', color: '#4A7C59', bg: '#eaf2e7' },
  cancelled: { text: '已取消', color: '#999', bg: '#f2f2f2' }
}

export default function StudyMyBookings() {
    const [list, setList] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    function load() {
        getMyBookings().then(function (rows) {
            setList(rows || []); setLoading(false)
        }).catch(function () {
            setList([]); setLoading(false)
        })
    }

    useEffect(function () {
        load()
        track('page_view', 'pages/study-my-bookings/index')
    }, [])

    function handleCancel(b: any) {
        Taro.showModal({
            title: '取消预约',
            content: '取消后该场次名额将释放，确定取消吗？',
            success: function (r) {
                if (!r.confirm) return
                cancelBooking(b.code).then(function () {
                    Taro.showToast({ title: '已取消', icon: 'success' })
                    load()
                }).catch(function (e: any) {
                    Taro.showToast({ title: (e && e.message) || '取消失败', icon: 'none' })
                })
            }
        })
    }

    return (
        <View className='mb-page'>
            <View className='mb-header'>
                <Text className='mb-title'>我的预约</Text>
                <Text className='mb-sub'>研学课程场次预约记录</Text>
            </View>

            {loading && <View style={{ textAlign: 'center', padding: '80rpx 0', color: '#999' }}><Text>加载中…</Text></View>}

            {!loading && list.length === 0 && (
                <View className='empty'>
                    <Text className='empty-text'>还没有预约记录</Text>
                    <Button className='empty-btn'
                        onClick={function () { navigateTo({ url: '/subpackages/study/pages/study-courses/index' }) }}>
                        <Text>去挑选课程</Text>
                    </Button>
                </View>
            )}

            {list.map(function (b) {
                const st = STATUS_MAP[b.status] || STATUS_MAP.pending
                const cancelled = b.status === 'cancelled'
                return (
                    <View key={b.code} className='mb-card' style={{ opacity: cancelled ? 0.6 : 1 }}>
                        <View className='mb-top'>
                            <Text className='mb-name'>{b.courseName}</Text>
                            <Text className='mb-status' style={{ color: st.color, background: st.bg }}>{st.text}</Text>
                        </View>
                        <View className='mb-row'><Text className='mb-label'>场次</Text><Text className='mb-val'>{b.date} {b.startTime}-{b.endTime}</Text></View>
                        <View className='mb-row'><Text className='mb-label'>地点</Text><Text className='mb-val'>{b.location || '槎山景区'}</Text></View>
                        <View className='mb-row'><Text className='mb-label'>联系人</Text><Text className='mb-val'>{b.contactName} · {b.phone}</Text></View>
                        <View className='mb-row'><Text className='mb-label'>人数</Text><Text className='mb-val'>{b.participantCount} 人</Text></View>
                        {b.remark ? <View className='mb-row'><Text className='mb-label'>备注</Text><Text className='mb-val'>{b.remark}</Text></View> : null}
                        {!cancelled && (
                            <View className='mb-foot'>
                                <Text className='mb-code'>预约号 {b.code}</Text>
                                <Button className='mb-cancel' onClick={function () { handleCancel(b) }}>
                                    <Text>取消预约</Text>
                                </Button>
                            </View>
                        )}
                    </View>
                )
            })}
            <View style={{ height: '40rpx' }} />
        </View>
    )
}
