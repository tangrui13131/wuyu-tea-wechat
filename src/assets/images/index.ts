// 图片资产总表（唯一入口）
// 为什么集中在这里：weapp 打包只收集被模块 import 到的图片，写字符串路径（如 '/assets/images/x.jpg'）
// 打不进包会变成空白图；且页面里散落相对路径时改名就会漏改。新增图片：放对应目录 → 在这里登记。
// 注意：本文件就在 src/assets/images/ 里，跑 scripts/prepare-assets.py 时不要整个删掉这个目录。

import brandLogo from './brand/logo.png'
import badge from './states/badge.png'

import npcFairy from './npc/fairy-avatar.jpg'
import npcFarmer from './npc/farmer-avatar.jpg'
import npcSoldier from './npc/soldier-avatar.jpg'

import npcFairyPortrait from './npc/fairy-portrait.jpg'
import npcFarmerPortrait from './npc/farmer-portrait.jpg'
import npcSoldierPortrait from './npc/soldier-portrait.jpg'

import levelTemperature from './levels/01-temperature.jpg'
import levelAroma from './levels/02-aroma.jpg'
import levelPicking from './levels/03-picking.jpg'
import levelRelics from './levels/04-relics.jpg'

import traceCoreGarden from './trace/core-garden.jpg'
import traceEcoGarden from './trace/eco-garden.jpg'
import traceWorkshop from './trace/workshop.jpg'

import stateEmpty from './states/empty.jpg'
import stateOffline from './states/offline.jpg'

import sceneTeaGarden from './scenes/tea-garden.jpg'
import sceneWhiteTeaTree from './scenes/white-tea-tree.jpg'
import sceneTeaWorkshop from './scenes/tea-workshop.jpg'
import sceneShuangquanTemple from './scenes/shuangquan-temple.jpg'
import sceneRedMemorial from './scenes/red-memorial.jpg'
import sceneTeaBasket from './scenes/tea-basket.jpg'

import coverHalfday from './covers/route-halfday.jpg'
import coverOneday from './covers/route-oneday.jpg'
import coverCulture from './covers/route-culture.jpg'
import themeTea from './covers/theme-tea.jpg'
import themeFarming from './covers/theme-farming.jpg'
import themeRed from './covers/theme-red.jpg'

import productMingqianGift from './products/01-mingqian-gift.jpg'
import productFuxiDaily from './products/02-fuxi-daily.jpg'
import productFairyGift from './products/03-fairy-gift.jpg'
import productStudySouvenir from './products/04-study-souvenir.jpg'
import productRedBasket from './products/05-red-basket.jpg'
import productHoney from './products/06-honey.jpg'

import coursePicking from './courses/01-picking.jpg'
import courseProcessing from './courses/02-processing.jpg'
import courseTeaCeremony from './courses/03-tea-ceremony.jpg'
import courseRedBasket from './courses/04-red-basket.jpg'
import courseNature from './courses/05-nature.jpg'

import qualityReport from './quality/report.jpg'
import qualitySamples from './quality/samples.jpg'

// hero 底图：实拍照片（不是 AI 生成），750×560 / 750×520、q55，两张合计约 114K
import heroField from './hero/hero-field.jpg'
import heroRows from './hero/hero-rows.jpg'

export const IMG = {
    hero: {
        field: heroField,
        rows: heroRows
    },
    brand: {
        logo: brandLogo
    },
    states: {
        badge,
        empty: stateEmpty,
        offline: stateOffline
    },
    npc: {
        fairy: npcFairy,
        farmer: npcFarmer,
        soldier: npcSoldier,
        fairyPortrait: npcFairyPortrait,
        farmerPortrait: npcFarmerPortrait,
        soldierPortrait: npcSoldierPortrait
    },
    levels: {
        temperature: levelTemperature,
        aroma: levelAroma,
        picking: levelPicking,
        relics: levelRelics
    },
    trace: {
        coreGarden: traceCoreGarden,
        ecoGarden: traceEcoGarden,
        workshop: traceWorkshop
    },
    scenes: {
        teaGarden: sceneTeaGarden,
        whiteTeaTree: sceneWhiteTeaTree,
        teaWorkshop: sceneTeaWorkshop,
        shuangquanTemple: sceneShuangquanTemple,
        redMemorial: sceneRedMemorial,
        teaBasket: sceneTeaBasket
    },
    covers: {
        routeHalfday: coverHalfday,
        routeOneday: coverOneday,
        routeCulture: coverCulture,
        themeTea,
        themeFarming,
        themeRed
    },
    products: {
        mingqianGift: productMingqianGift,
        fuxiDaily: productFuxiDaily,
        fairyGift: productFairyGift,
        studySouvenir: productStudySouvenir,
        redBasket: productRedBasket,
        honey: productHoney
    },
    courses: {
        picking: coursePicking,
        processing: courseProcessing,
        teaCeremony: courseTeaCeremony,
        redBasket: courseRedBasket,
        nature: courseNature
    },
    quality: {
        report: qualityReport,
        samples: qualitySamples
    }
} as const

export default IMG
