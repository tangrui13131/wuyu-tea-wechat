import React, { useState, useEffect } from 'react'
import Taro, { useRouter, navigateTo } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { getCourse, track } from '@/services'
import './index.scss'

const GREEN = '#4A7C59'
const GREEN2 = '#6FAE73'

export default function StudyCourseDetail() {
    const router = useRouter()
    const code = router.params.code || ''
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(function () {
        if (!code) { setLoading(false); return }
        getCourse(code).then(function (c) {
            setCourse(c); setLoading(false)
            track('course_detail_view', 'pages/study-course-detail/index', { code: code })
        }).catch(function () {
            setLoading(false)
            Taro.showToast({ title: '课程加载失败', icon: 'none' })
        })
    }, [code])

    function goBooking(sessionCode: string) {
        track('course_session_pick', 'pages/study-course-detail/index', { code: code, session: sessionCode })
        navigateTo({ url: '/subpackages/study/pages/study-booking/index?courseCode=' + code + '&sessionCode=' + sessionCode })
    }

    if (loading) {
        return <View style={{ padding: '120rpx 0', textAlign: 'center', color: '#999' }}><Text>加载中…</Text></View>
    }
    if (!course) {
        return <View style={{ padding: '120rpx 0', textAlign: 'center', color: '#999' }}><Text>未找到该课程</Text></View>
    }

    const openSessions = (course.sessions || []).filter(function (s: any) { return s.status === 'open' && s.remaining > 0 })

    return (
        <View className='detail-page'>
            <View className='detail-hero' style={{ background: 'linear-gradient(135deg,' + GREEN + ',' + GREEN2 + ')' }}>
                <Text className='detail-cat'>{course.category}</Text>
                <Text className='detail-name'>{course.name}</Text>
                <Text className='detail-summary'>{course.summary}</Text>
                <View className='detail-quick'>
                    <View className='quick-item'><Text className='quick-num'>{course.durationHours}</Text><Text className='quick-label'>小时</Text></View>
                    <View className='quick-item'><Text className='quick-num'>¥{course.price}</Text><Text className='quick-label'>人均</Text></View>
                    <View className='quick-item'><Text className='quick-num'>{course.capacity}</Text><Text className='quick-label'>单场容量</Text></View>
                </View>
            </View>

            <View className='detail-section'>
                <Text className='sec-title'>课程介绍</Text>
                <Text className='sec-text'>{course.detail}</Text>
                <View className='tag-row'>
                    {(course.tags || []).map(function (t: string, i: number) {
                        return <Text key={i} className='tag'>{t}</Text>
                    })}
                </View>
                <View className='info-row'><Text className='info-label'>适合学段</Text><Text className='info-val'>{course.suitableGrade}</Text></View>
                <View className='info-row'><Text className='info-label'>上课地点</Text><Text className='info-val'>{course.location}</Text></View>
            </View>

            <View className='detail-section'>
                <Text className='sec-title'>开放场次（点击预约）</Text>
                {openSessions.length === 0 && (
                    <View style={{ padding: '30rpx 0', textAlign: 'center', color: '#999' }}>
                        <Text>近期场次已约满，敬请关注新排期</Text>
                    </View>
                )}
                {openSessions.map(function (s: any) {
                    return (
                        <View key={s.code} className='session-item' onClick={function () { goBooking(s.code) }}>
                            <View style={{ flex: 1 }}>
                                <Text className='session-date'>{s.date}</Text>
                                <Text className='session-time'>{s.startTime} - {s.endTime}</Text>
                                <Text className='session-left'>剩余 {s.remaining}/{s.quota} 个名额</Text>
                            </View>
                            <Button className='book-mini'>
                                <Text style={{ color: '#fff', fontSize: '26rpx' }}>预约</Text>
                            </Button>
                        </View>
                    )
                })}
            </View>

            <View style={{ height: '40rpx' }} />
        </View>
    )
}
