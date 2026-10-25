import { IMG } from '@/assets/images'
/**

 * 槎山茶礼 · 本地商品兜底数据

 *

 * 用途：后端 /api/shop/products 不可达时（演示环境未启动后端、断网）也能展示商品，

 * 避免商城页一片空白。商品信息取自茶园调研的真实在售/规划商品，价格为调研报价。

 *

 * 图片字段统一留空：项目不使用随机占位图，无真实素材时前端渲染「渐变 + emoji」占位。

 */



export interface LocalProduct {

    id: number

    name: string

    category: string

    description: string

    price: number

    unit: string

    image: string

    recommendScene: string

    /** 无真实图片时的占位图标 */

    emoji: string

    /** 占位卡片渐变色 [起, 止] */

    gradient: [string, string]

}



export const localProducts: LocalProduct[] = [

    {

        id: 1,

        name: '槎山白茶·明前特级礼盒',

        category: '茶礼',

        description: '一芽一叶头采原料，24罐独立小包装，附溯源二维码与品质检测报告',

        price: 398,

        unit: '盒',

        image: IMG.products.mingqianGift,

        recommendScene: 'quality',

        emoji: '🎁',

        gradient: ['#7AB379', '#3D6B3C']

    },

    {

        id: 2,

        name: '槎山白茶·富硒口粮茶',

        category: '白茶',

        description: '日常口粮装，250g 袋装，高性价比富硒白茶',

        price: 128,

        unit: '袋',

        image: IMG.products.fuxiDaily,

        recommendScene: 'quality',

        emoji: '🍵',

        gradient: ['#9CC5A1', '#4A7C59']

    },

    {

        id: 3,

        name: '白叶仙姑·白茶伴手礼',

        category: '文创',

        description: '仙姑主题包装白茶小礼盒（50g×2罐），附茶史知识卡一套',

        price: 88,

        unit: '套',

        image: IMG.products.fairyGift,

        recommendScene: 'study',

        emoji: '🌿',

        gradient: ['#C8D96F', '#7AB379']

    },

    {

        id: 4,

        name: '研学纪念茶·我的第一泡',

        category: '文创',

        description: '孩子亲手制作封装的白茶成品，附专属研学证书（现场制作后可预订）',

        price: 68,

        unit: '份',

        image: IMG.products.studySouvenir,

        recommendScene: 'report',

        emoji: '🎓',

        gradient: ['#C49A6C', '#A87B4F']

    },

    {

        id: 5,

        name: '红军茶筐·红色文创摆件',

        category: '文创',

        description: '复刻微型茶筐摆件，附《茶筐里的情报》故事册',

        price: 58,

        unit: '件',

        image: IMG.products.redBasket,

        recommendScene: 'study',

        emoji: '🧺',

        gradient: ['#C41E3A', '#8B1428']

    },

    {

        id: 6,

        name: '槎山土蜂蜜·春蜜',

        category: '茶礼',

        description: '茶园生态蜂蜜，配白茶同饮风味更佳，500g 玻璃瓶装',

        price: 98,

        unit: '瓶',

        image: IMG.products.honey,

        recommendScene: 'quality',

        emoji: '🍯',

        gradient: ['#E0A83C', '#C4862A']

    }

]



/** 客服引导兜底（后端不可达时使用） */

export const localShopContact = {

    serviceWechat: 'chashan-tea-service',

    qrcode: '',

    tip: '扫码添加茶园客服微信，可咨询团购、研学包场与茶礼定制',

    note: '小程序内不做在线支付，交易通过客服完成（学生团队主体限制）'

}

