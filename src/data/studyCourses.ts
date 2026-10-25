import { IMG } from '@/assets/images'
// 研学课程与场次的离线 mock 数据（与后端 seed 同源）
// 后端不可达时，services 层降级到此处，保证「研学课程选择 + 预约」板块不白屏。

export interface StudySession {
  code: string
  date: string
  startTime: string
  endTime: string
  quota: number
  booked: number
  remaining: number
  status: string
}

export interface StudyCourse {
  code: string
  name: string
  category: string
  cover: string
  summary: string
  detail: string
  durationHours: number
  price: number
  capacity: number
  suitableGrade: string
  location: string
  tags: string[]
  sessions: StudySession[]
}

export const localCourses: StudyCourse[] = [
  {
    code: 'SC01', name: '采茶初体验', category: '采茶', cover: IMG.courses.picking,
    summary: '背上小茶篓，跟茶农学一芽一叶标准采摘',
    detail: '走进北纬31°白茶梯田，由资深茶农带队，学习"一芽一叶"标准采摘手法，认识白叶一号品种特征，亲手采下人生第一篓鲜叶。适合亲子与劳动教育研学。',
    durationHours: 1.5, price: 30, capacity: 40, suitableGrade: '亲子/1-9年级', location: '槎山茶园观光区',
    tags: ['采摘', '劳动教育', '亲子'],
    sessions: [
      { code: 'SS0101', date: '2026-10-17', startTime: '09:00', endTime: '10:30', quota: 40, booked: 12, remaining: 28, status: 'open' },
      { code: 'SS0102', date: '2026-10-24', startTime: '09:00', endTime: '10:30', quota: 40, booked: 5, remaining: 35, status: 'open' },
      { code: 'SS0103', date: '2026-10-31', startTime: '09:00', endTime: '10:30', quota: 40, booked: 40, remaining: 0, status: 'full' }
    ]
  },
  {
    code: 'SC02', name: '古法制茶工坊', category: '制茶', cover: IMG.courses.processing,
    summary: '萎凋·杀青·揉捻·干燥，做一泡自己的白茶',
    detail: '在制茶师傅指导下体验古法白茶全流程：摊青萎凋、高温杀青、手工揉捻、文火干燥。亲手完成四道工序并封装带走，理解"不炒不揉"的白茶工艺灵魂。',
    durationHours: 2.0, price: 50, capacity: 30, suitableGrade: '4-12年级', location: '槎山制茶工坊',
    tags: ['制茶', '非遗工艺', '动手'],
    sessions: [
      { code: 'SS0201', date: '2026-10-18', startTime: '14:00', endTime: '16:00', quota: 30, booked: 18, remaining: 12, status: 'open' },
      { code: 'SS0202', date: '2026-10-25', startTime: '14:00', endTime: '16:00', quota: 30, booked: 3, remaining: 27, status: 'open' }
    ]
  },
  {
    code: 'SC03', name: '宋代点茶茶艺', category: '品鉴', cover: IMG.courses.teaCeremony,
    summary: '换上茶服，学点茶技法与奉茶之礼',
    detail: '复原宋代文人四般闲事之一的点茶。换上茶服学习击拂技法与茶礼，为长辈奉一盏茶，理解"客来敬茶"的千年礼仪，带走专属茶礼体验。',
    durationHours: 1.5, price: 45, capacity: 24, suitableGrade: '3-12年级', location: '槎山茶艺教室',
    tags: ['茶艺', '传统文化', '礼仪'],
    sessions: [
      { code: 'SS0301', date: '2026-10-17', startTime: '14:30', endTime: '16:00', quota: 24, booked: 9, remaining: 15, status: 'open' },
      { code: 'SS0302', date: '2026-10-31', startTime: '14:30', endTime: '16:00', quota: 24, booked: 20, remaining: 4, status: 'open' }
    ]
  },
  {
    code: 'SC04', name: '茶筐里的红色研学', category: '红色研学', cover: IMG.courses.redBasket,
    summary: '跟随红军交通员，还原茶筐传情报的现场',
    detail: '以"茶筐传情报"为情景主线，跟随红军交通员完成情报送达任务，学习中原突围历史，完成红色研学手册。对应《革命传统进中小学课程教材指南》。',
    durationHours: 1.5, price: 25, capacity: 60, suitableGrade: '4-12年级', location: '槎山红色纪念点',
    tags: ['红色教育', '情景任务', '研学手册'],
    sessions: [
      { code: 'SS0401', date: '2026-10-18', startTime: '10:00', endTime: '11:30', quota: 60, booked: 33, remaining: 27, status: 'open' },
      { code: 'SS0402', date: '2026-11-01', startTime: '10:00', endTime: '11:30', quota: 60, booked: 2, remaining: 58, status: 'open' }
    ]
  },
  {
    code: 'SC05', name: '茶园自然观察课', category: '自然观察', cover: IMG.courses.nature,
    summary: '用科学眼光看茶园：土壤、昆虫与生态',
    detail: '在自然导师带领下用检测仪测土壤pH与硒含量、观察茶园益虫与传粉昆虫，制作自然笔记。集齐自然教育+劳动教育双课标，适合学校春秋游。',
    durationHours: 2.0, price: 40, capacity: 20, suitableGrade: '5-9年级', location: '槎山生态茶园',
    tags: ['自然教育', '科学观察', '生态'],
    sessions: [
      { code: 'SS0501', date: '2026-10-25', startTime: '09:30', endTime: '11:30', quota: 20, booked: 11, remaining: 9, status: 'open' },
      { code: 'SS0502', date: '2026-11-07', startTime: '09:30', endTime: '11:30', quota: 20, booked: 1, remaining: 19, status: 'open' }
    ]
  }
]

export const localBookings: any[] = []
