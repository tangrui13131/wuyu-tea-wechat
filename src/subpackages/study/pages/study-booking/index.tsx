import React, { useState, useEffect } from 'react'
import Taro, { useRouter, navigateTo, redirectTo } from '@tarojs/taro'
import { View, Text, Button, Input } from '@tarojs/components'
import Icon from '@/components/Icon'
import { getCourse, createBooking, track } from '@/services'
import './index.scss'



export default function StudyBooking() {
    const router = useRouter()
    const courseCode = router.params.courseCode || ''
    const sessionCode = router.params.sessionCode || ''
    const [course, setCourse] = useState<any>(null)
    const [session, setSession] = useState<any>(null)
    const [contactName, setContactName] = useState('')
    const [phone, setPhone] = useState('')
    const [count, setCount] = useState(1)
    const [remark, setRemark] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState<any>(null)
    const [error, setError] = useState('')

    useEffect(function () {
        if (!courseCode) return
        getCourse(courseCode).then(function (c) {
            setCourse(c)
            const s = (c.sessions || []).find(function (x: any) { return x.code === sessionCode })
            setSession(s || null)
            track('booking_form_open', 'pages/study-booking/index', { course: courseCode, session: sessionCode })
        }).catch(function () { })
    }, [courseCode, sessionCode])

    function validPhone(v: string) { return /^1\d{10}$/.test(v) }

    function submit() {
        setError('')
        if (!contactName.trim()) { setError('请填写联系人姓名'); return }
        if (!validPhone(phone.trim())) { setError('请填写正确的 11 位手机号'); return }
        if (!session) { setError('场次信息缺失'); return }
        if (count > (session.remaining || 0)) { setError('人数超过该场剩余名额'); return }

        setSubmitting(true)
        createBooking({
            courseCode: courseCode, sessionCode: sessionCode,
            contactName: contactName.trim(), phone: phone.trim(),
            participantCount: count, remark: remark.trim()
        }).then(function (res: any) {
            setSubmitting(false)
            setDone(res)
            track('booking_submit_ok', 'pages/study-booking/index', { code: res.bookingCode })
            Taro.showToast({ title: '预约成功', icon: 'success' })
        }).catch(function (e: any) {
            setSubmitting(false)
            setError(e && e.message ? e.message : '预约失败，请稍后重试')
        })
    }

    if (done) {
        return (
            <View className='book-page'>
                <View className='success-card'>
                    <Icon className='success-icon' name='check' size={36} color='white' />
                    <Text className='success-title'>预约提交成功</Text>
                    <Text className='success-code'>预约号：{done.bookingCode}</Text>
                    <View className='success-info'>
                        <Text className='si-line'>课程：{done.course}</Text>
                        <Text className='si-line'>日期：{done.date} {done.startTime}</Text>
                        <Text className='si-line'>人数：{done.participantCount} 人</Text>
                        <Text className='si-line'>状态：待确认（到店核销）</Text>
                    </View>
                    <Button className='big-btn'
                        onClick={function () { redirectTo({ url: '/subpackages/study/pages/study-my-bookings/index' }) }}>
                        <Text>查看我的预约</Text>
                    </Button>
                    <Text className='back-link' onClick={function () { navigateTo({ url: '/subpackages/study/pages/study-courses/index' }) }}>继续挑选课程 ›</Text>
                </View>
            </View>
        )
    }

    return (
        <View className='book-page'>
            <View className='book-header'>
                <Text className='book-title'>填写预约信息</Text>
            </View>

            {course && session ? (
                <View className='pick-card'>
                    <Text className='pick-name'>{course.name}</Text>
                    <Text className='pick-session'>{session.date} {session.startTime}-{session.endTime}</Text>
                    <Text className='pick-left'>本场剩余 {session.remaining}/{session.quota} 个名额 · 人均 ¥{course.price}</Text>
                </View>
            ) : (
                <View className='pick-card'><Text className='pick-name'>场次信息加载中…</Text></View>
            )}

            <View className='form-card'>
                <View className='field'>
                    <Text className='label'>联系人姓名</Text>
                    <Input className='input' placeholder='请输入预约人姓名' value={contactName} onInput={function (e: any) { setContactName(e.detail.value) }} />
                </View>
                <View className='field'>
                    <Text className='label'>联系电话</Text>
                    <Input className='input' type='number' placeholder='11 位手机号' value={phone} onInput={function (e: any) { setPhone(e.detail.value) }} maxlength={11} />
                </View>
                <View className='field'>
                    <Text className='label'>参与人数</Text>
                    <View className='stepper'>
                        <Text className='step-btn' onClick={function () { setCount(Math.max(1, count - 1)) }}>−</Text>
                        <Text className='step-val'>{count}</Text>
                        <Text className='step-btn' onClick={function () { setCount(count + 1) }}>＋</Text>
                    </View>
                </View>
                <View className='field'>
                    <Text className='label'>备注（选填）</Text>
                    <Input className='input' placeholder='特殊需求，如儿童/老人随行' value={remark} onInput={function (e: any) { setRemark(e.detail.value) }} />
                </View>
            </View>

            {error ? (
                <View className='err-tip'><Text>{error}</Text></View>
            ) : null}

            <Button className='submit-btn'
                disabled={submitting} onClick={submit}>
                <Text>{submitting ? '提交中…' : '提交预约'}</Text>
            </Button>
        </View>
    )
}
