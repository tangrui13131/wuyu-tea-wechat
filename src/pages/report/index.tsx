import React, { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View, Text, ScrollView, Input, Button, Image } from '@tarojs/components'
import Icon from '@/components/Icon'
import Seal from '@/components/Seal'
import Motif from '@/components/Motif'
import styles from './index.module.scss'
import {
    generateReport, generateCertificate, getMyReports, getMyCertificates,
    getTasks, getStudyModules, createStudyPlan, track
} from '@/services'
import { API_CONFIG } from '@/config/api'
import { getReportHomeProducts } from '@/utils/recommend'
import { LocalProduct } from '@/data/products'

interface TaskItem { id: string; title: string; status: string; points: number }
interface ModuleItem { id: string; name: string; durationHours: number; curriculumStandard: string; category: string; price: number }

const ReportPage: React.FC = () => {
    const [tasks, setTasks] = useState<TaskItem[]>([])
    const [modules, setModules] = useState<ModuleItem[]>([])
    const [selected, setSelected] = useState<string[]>([])
    const [studentName, setStudentName] = useState('')
    const [school, setSchool] = useState('')
    const [reports, setReports] = useState<any[]>([])
    const [certs, setCerts] = useState<any[]>([])
    const [planId, setPlanId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const homeProducts: LocalProduct[] = getReportHomeProducts()
    const [tab, setTab] = useState<'generate' | 'modules' | 'history'>(
        (router?.params?.tab as any) || 'generate'
    )

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        try {
            const [t, m, r, c] = await Promise.all([
                getTasks(), getStudyModules(), getMyReports(), getMyCertificates()
            ])
            setTasks((t || []).map((x: any) => ({ id: x.id, title: x.title, status: x.status, points: x.points || 10 })))
            setModules(m || [])
            setReports(r || [])
            setCerts(c || [])
        } catch (e) { /* 静默：离线时页面仍可用 */ }
    }

    const completed = tasks.filter(t => t.status === 'completed')
    const totalPoints = completed.reduce((s, t) => s + t.points, 0)
    const estHours = modules.filter(m => selected.includes(m.id)).reduce((s, m) => s + (m.durationHours || 0), 0)
    const estPrice = modules.filter(m => selected.includes(m.id)).reduce((s, m) => s + (m.price || 0), 0)

    const toggleModule = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    /** 先按勾选生成研学方案，再据此出报告/证书 */
    const ensurePlan = async () => {
        if (selected.length === 0) return null
        if (planId) return planId
        try {
            const res: any = await createStudyPlan({
                school: school || undefined,
                moduleIds: selected,
                studentsCount: 1
            })
            setPlanId(res?.planId || null)
            return res?.planId || null
        } catch (e) {
            Taro.showToast({ title: '方案生成失败，将按默认模板出报告', icon: 'none' })
            return null
        }
    }

    const onGenerateReport = async () => {
        setLoading(true)
        Taro.showLoading({ title: '生成报告中' })
        try {
            const pid = selected.length ? await ensurePlan() : null
            const res: any = await generateReport({ planId: pid || undefined, studentName, school })
            Taro.hideLoading()
            Taro.showModal({
                title: '报告已生成',
                content: '研学实践报告 PDF 已生成，是否打开查看？',
                success: (r) => {
                    if (r.confirm && res?.url) openPdf(res.url)
                }
            })
            track('report_generate', 'pages/report/index', { planId: pid })
            loadData()
        } catch (e: any) {
            Taro.hideLoading()
            Taro.showToast({ title: e?.message || '生成失败，请确认后端已启动', icon: 'none' })
        } finally {
            setLoading(false)
        }
    }

    const onGenerateCert = async () => {
        if (!studentName.trim()) {
            Taro.showToast({ title: '请填写学生姓名', icon: 'none' })
            return
        }
        setLoading(true)
        Taro.showLoading({ title: '生成证书中' })
        try {
            const pid = selected.length ? await ensurePlan() : null
            const res: any = await generateCertificate({ studentName, school, planId: pid || undefined })
            Taro.hideLoading()
            Taro.showModal({
                title: '证书已生成',
                content: `证书编号：${res?.certNo || '-'}\n是否打开查看？`,
                success: (r) => { if (r.confirm && res?.url) openPdf(res.url) }
            })
            track('cert_generate', 'pages/report/index', { certNo: res?.certNo })
            loadData()
        } catch (e: any) {
            Taro.hideLoading()
            Taro.showToast({ title: e?.message || '生成失败，请确认后端已启动', icon: 'none' })
        } finally {
            setLoading(false)
        }
    }

    const openPdf = (url: string) => {
        const full = url.startsWith('http') ? url : API_CONFIG.baseURL + url
        Taro.downloadFile({
            url: full,
            success: (res) => {
                Taro.openDocument({ filePath: res.tempFilePath, fileType: 'pdf' })
            },
            fail: () => Taro.showToast({ title: '打开失败', icon: 'none' })
        })
    }

    const progress = tasks.length ? Math.round(completed.length / tasks.length * 100) : 0

    return (
        <ScrollView className={styles.reportPage} scrollY>
            {/* 研学概览 */}
            <View className={styles.overview}>
                {/* 朱文印（白底红框）：压在成果卡上，比白文印更雅，也不抢数据 */}
                <Seal text='研学' size={84} variant='yang' className={styles.ovSeal} />
                <Text className={styles.ovTitle}>我的研学成果</Text>
                <View className={styles.ovRow}>
                    <View className={styles.ovItem}>
                        <Text className={styles.ovNum}>{completed.length}/{tasks.length}</Text>
                        <Text className={styles.ovLabel}>任务关卡</Text>
                    </View>
                    <View className={styles.ovItem}>
                        <Text className={styles.ovNum}>{totalPoints}</Text>
                        <Text className={styles.ovLabel}>获得积分</Text>
                    </View>
                    <View className={styles.ovItem}>
                        <Text className={styles.ovNum}>{progress}%</Text>
                        <Text className={styles.ovLabel}>完成度</Text>
                    </View>
                </View>
            </View>

            {/* Tab */}
            <View className={styles.tabs}>
                {([['generate', '生成报告'], ['modules', '课程模块'], ['history', '我的记录']] as const).map(([k, label]) => (
                    <Text
                        key={k}
                        className={`${styles.tab} ${tab === k ? styles.tabActive : ''}`}
                        onClick={() => setTab(k)}
                    >{label}</Text>
                ))}
            </View>

            {tab === 'generate' && (
                <View className={styles.formCard}>
                    <Text className={styles.formTitle}>填写信息</Text>
                    <View className={styles.fieldRow}>
                        <Text className={styles.fieldLabel}>学生姓名</Text>
                        <Input
                            className={styles.input}
                            placeholder='请输入姓名（证书必填）'
                            value={studentName}
                            onInput={(e) => setStudentName(e.detail.value)}
                        />
                    </View>
                    <View className={styles.fieldRow}>
                        <Text className={styles.fieldLabel}>学校/机构</Text>
                        <Input
                            className={styles.input}
                            placeholder='选填'
                            value={school}
                            onInput={(e) => setSchool(e.detail.value)}
                        />
                    </View>

                    <View className={styles.formTip}>
                        <Text className={styles.formTipText}>
                            已勾选 {selected.length} 个课程模块 · 预计 {estHours} 小时 · 参考费用 ¥{estPrice}/人
                        </Text>
                    </View>

                    <Button className={styles.primaryBtn} loading={loading} onClick={onGenerateReport}>
                        生成研学报告 PDF
                    </Button>
                    <Button className={styles.secondaryBtn} loading={loading} onClick={onGenerateCert}>
                        生成电子研学证书
                    </Button>
                    <Text className={styles.hint}>
                        报告含：基本信息、劳动教育课标对应、任务完成情况、成果小结；证书含唯一编号可核验。
                    </Text>
                </View>
            )}

            {tab === 'modules' && (
                <View className={styles.formCard}>
                    <Text className={styles.formTitle}>勾选课程模块（可组合成研学方案）</Text>
                    {modules.length === 0 && <Text className={styles.hint}>暂无课程模块（请确认后端已启动）</Text>}
                    {modules.map(m => (
                        <View
                            key={m.id}
                            className={`${styles.moduleItem} ${selected.includes(m.id) ? styles.moduleActive : ''}`}
                            onClick={() => toggleModule(m.id)}
                        >
                            <View className={styles.moduleHead}>
                                <View className={styles.moduleTitleRow}>
                                    <Icon
                                        name={selected.includes(m.id) ? 'check' : 'square'}
                                        size={26}
                                        color={selected.includes(m.id) ? 'primary' : 'tertiary'}
                                    />
                                    <Text className={styles.moduleName}>{m.name}</Text>
                                </View>
                                <Text className={styles.moduleMeta}>{m.durationHours}h · {m.category}</Text>
                            </View>
                            {m.curriculumStandard ? (
                                <Text className={styles.moduleStandard}>课标：{m.curriculumStandard}</Text>
                            ) : null}
                        </View>
                    ))}
                </View>
            )}

            {tab === 'history' && (
                <View className={styles.formCard}>
                    <Text className={styles.formTitle}>研学报告（{reports.length}）</Text>
                    {reports.length === 0 && <Text className={styles.hint}>还没有生成过报告</Text>}
                    {reports.map((r: any) => (
                        <View key={r.id} className={styles.recordItem} onClick={() => r.pdf_path && openPdf(r.pdf_path)}>
                            <Text className={styles.recordTitle}>{r.title}</Text>
                            <Text className={styles.recordTime}>{r.created_at}</Text>
                        </View>
                    ))}

                    <Text className={styles.formTitle}>电子证书（{certs.length}）</Text>
                    {certs.length === 0 && <Text className={styles.hint}>还没有证书</Text>}
                    {certs.map((c: any) => (
                        <View key={c.id} className={styles.recordItem} onClick={() => c.pdf_path && openPdf(c.pdf_path)}>
                            <Text className={styles.recordTitle}>{c.student_name} · {c.cert_no}</Text>
                            <Text className={styles.recordTime}>{c.issued_at}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* 好茶带回家：研学 → 卖茶闭环（3 款主力横滑） */}
            <View className={styles.homeTea}>
                <View className={styles.homeTeaHead}>
                    <Icon name='tea' size={32} color='primary' />
                    <Text className={styles.homeTeaTitle}>好茶带回家</Text>
                </View>
                <Text className={styles.homeTeaSub}>研学有收获，也带份槎山好茶回去慢慢品</Text>
                <ScrollView className={styles.homeTeaScroll} scrollX>
                    {homeProducts.map((p) => (
                        <View
                            key={p.id}
                            className={styles.homeTeaCard}
                            onClick={() => {
                                track('report_shop_click', 'pages/report/index', { productId: p.id })
                                Taro.navigateTo({ url: `/pages/shop/index?id=${p.id}` })
                            }}
                        >
                            <View
                                className={styles.homeTeaThumb}
                                style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
                            >
                                <Icon name={p.emoji} size={88} color='white' />
                            </View>
                            <Text className={styles.homeTeaName}>{p.name}</Text>
                            <Text className={styles.homeTeaPrice}>¥{p.price}/{p.unit}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* 页脚：水波收尾，让长页面对「读完了」有交代 */}
            <View className={styles.footerMotif}>
                <Motif name='wave' height={40} color='accent' opacity={0.3} />
            </View>

        </ScrollView>
    )
}

export default ReportPage
