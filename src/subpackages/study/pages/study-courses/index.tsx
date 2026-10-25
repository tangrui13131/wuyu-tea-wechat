import React, { useState, useEffect } from 'react'
import Taro, { navigateTo } from '@tarojs/taro'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Icon from '@/components/Icon'
import { getCourses, track } from '@/services'
import './index.scss'

const GREEN = '#4A7C59'
const GREEN2 = '#6FAE73'
const GOLD = '#B98E4E'

export default function StudyCourses() {
    const [courses, setCourses] = useState<any[]>([])
    const [activeCat, setActiveCat] = useState('全部')
    const [selection, setSelection] = useState<string[]>([])
    const [drawer, setDrawer] = useState(false)

    useEffect(function () {
        getCourses().then(function (list) { setCourses(list || []) }).catch(function () { setCourses([]) })
        const sel = Taro.getStorageSync('study_course_selection') || []
        setSelection(sel)
        track('page_view', 'pages/study-courses/index')
    }, [])

    const categories = ['全部'].concat(Array.from(new Set(courses.map(function (c) { return c.category }))))
    const filtered = activeCat === '全部' ? courses : courses.filter(function (c) { return c.category === activeCat })

    function toggleSelect(code: string) {
        let next = selection.slice()
        if (next.indexOf(code) >= 0) next = next.filter(function (x) { return x !== code })
        else next.push(code)
        setSelection(next)
        Taro.setStorageSync('study_course_selection', next)
        track(next.indexOf(code) >= 0 ? 'course_select_add' : 'course_select_remove', 'pages/study-courses/index', { code: code })
    }

    function openDetail(code: string) {
        track('course_enter', 'pages/study-courses/index', { code: code })
        navigateTo({ url: '/subpackages/study/pages/study-course-detail/index?code=' + code })
    }

    const selectedCourses = courses.filter(function (c) { return selection.indexOf(c.code) >= 0 })

    return (
        <View className='courses-page'>
            <View className='courses-header'>
                <Text className='courses-title'>研学课程</Text>
                <Text className='courses-subtitle'>挑选心仪的体验课，加入课单后再去预约场次</Text>
            </View>

            {/* 分类筛选 */}
            <ScrollView scrollX className='cat-scroll'>
                <View className='cat-row'>
                    {categories.map(function (cat) {
                        const active = cat === activeCat
                        return (
                            <View
                                key={cat}
                                className='cat-chip'
                                style={{ background: active ? 'linear-gradient(135deg,' + GREEN + ',' + GREEN2 + ')' : '#f2f6f0', color: active ? '#fff' : '#4A7C59', borderColor: active ? GREEN : '#dfe8db' }}
                                onClick={function () { setActiveCat(cat) }}
                            >
                                <Text>{cat}</Text>
                            </View>
                        )
                    })}
                </View>
            </ScrollView>

            {/* 课程卡片 */}
            <View className='course-list'>
                {filtered.map(function (c) {
                    const selected = selection.indexOf(c.code) >= 0
                    return (
                        <View key={c.code} className='course-card' onClick={function () { openDetail(c.code) }}>
                            <View className='course-cover' style={{ background: selected ? 'linear-gradient(135deg,' + GOLD + ',#D9BD8A)' : 'linear-gradient(135deg,' + GREEN + ',' + GREEN2 + ')' }}>
                                <Text className='course-cover-text'>{c.category}</Text>
                            </View>
                            <View className='course-body'>
                                <Text className='course-name'>{c.name}</Text>
                                <Text className='course-summary'>{c.summary}</Text>
                                <View className='course-meta'>
                                    <Text className='meta-item'>⏱ {c.durationHours} 小时</Text>
                                    <View className='meta-item'>
                                        <Icon name='users' size={24} color='tertiary' />
                                        <Text>{c.suitableGrade}</Text>
                                    </View>
                                </View>
                                <View className='course-foot'>
                                    <Text className='course-price'>¥{c.price}<Text style={{ fontSize: '20rpx' }}>/人</Text></Text>
                                    <Button
                                        className={selected ? 'sel-btn sel-btn-active' : 'sel-btn'}
                                        onClick={function (e: any) { e.stopPropagation(); toggleSelect(c.code) }}
                                    >
                                        <Text>{selected ? '已选' : '加入课单'}</Text>
                                    </Button>
                                </View>
                            </View>
                        </View>
                    )
                })}
                {filtered.length === 0 && (
                    <View style={{ textAlign: 'center', padding: '60rpx 0', color: '#999' }}>
                        <Text>该类暂无可预约课程</Text>
                    </View>
                )}
            </View>

            {/* 底部课单栏 */}
            {selection.length > 0 && (
                <View className='sel-bar'>
                    <View style={{ flex: 1 }} onClick={function () { setDrawer(true) }}>
                        <Text style={{ color: '#fff', fontSize: '28rpx' }}>已选 <Text style={{ fontWeight: 'bold' }}>{selection.length}</Text> 门课</Text>
                        <Text style={{ color: 'rgba(255,255,255,.8)', fontSize: '24rpx', marginLeft: '12rpx' }}>查看课单 ›</Text>
                    </View>
                    <Button className='sel-clear' onClick={function () { setSelection([]); Taro.setStorageSync('study_course_selection', []) }}>
                        <Text>清空</Text>
                    </Button>
                </View>
            )}

            {/* 课单抽屉 */}
            {drawer && (
                <View className='drawer-mask' onClick={function () { setDrawer(false) }}>
                    <View className='drawer' onClick={function (e: any) { e.stopPropagation() }}>
                        <View className='drawer-head'>
                            <Text style={{ fontSize: '32rpx', fontWeight: 'bold', color: '#333' }}>我的课单（{selectedCourses.length}）</Text>
                            <Text style={{ fontSize: '28rpx', color: '#999' }} onClick={function () { setDrawer(false) }}>收起</Text>
                        </View>
                        <View className='drawer-list'>
                            {selectedCourses.map(function (c) {
                                return (
                                    <View key={c.code} className='drawer-item'>
                                        <View style={{ flex: 1 }} onClick={function () { setDrawer(false); openDetail(c.code) }}>
                                            <Text style={{ fontSize: '28rpx', color: '#333', fontWeight: 'bold' }}>{c.name}</Text>
                                            <Text style={{ display: 'block', fontSize: '22rpx', color: '#999', marginTop: '4rpx' }}>{c.category} · ¥{c.price}/人</Text>
                                        </View>
                                        <Text style={{ fontSize: '26rpx', color: GREEN }} onClick={function () { setDrawer(false); openDetail(c.code) }}>去预约 ›</Text>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}
