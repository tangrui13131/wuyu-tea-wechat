# 前端「AI 味」改造记录（A / B 两档）

日期：2026-10-24
范围：A 档（图标系统、死动画、三处 bug）+ B 档（卡片节奏、页头分级、区块留白）+ 质感层 P0（纸纹、印章、纹样）
未做：品质页图表重做、实拍替换 AI 图、金色收敛、字号收口

---

## 为什么改

用 `frontend-design` 视角审了一轮，六个「模板感」来源（按影响排序）：

| # | 症状 | 实测证据 |
| --- | --- | --- |
| 1 | emoji 当图标，还塞进绿渐变圆角方块里 | 81 处 emoji / 23 文件；`🍵` 12 次、`✓` 6 次 |
| 2 | 卡片汤：所有白卡同一个投影 | `$shadow-card` 47 处 / 19 文件 |
| 3 | 每页同一个绿渐变页头 | `$gradient-hero` 11 个 scss / 21 处 |
| 4 | 无衬线字体栈，没有茶/文旅该有的笔意 | `$font-family-base` 纯无衬线（`src/styles/variables.scss`） |
| 5 | 字号 32 种、26/28rpx 手写值遍地 | 字面量 26rpx×20、28rpx×19、24rpx×18… |
| 6 | 25 处入场动画从来没动过 | module.scss 引用全局 keyframe，被哈希后悬空 |

---

## A 档：把「像 AI 生成」的痕迹去掉

### A① 图标系统：`<Icon>` 取代 emoji

- 新组件 `src/components/Icon/`：`icons.ts` 存 33 个 24 网格线性路径（`stroke-width 1.8`、圆角端点、单色描边），`index.tsx` 用 `background-image: data:image/svg+xml` 渲染（WXML 不支持内联 `<svg>`），按 `name|color` 缓存 URI。
- props：`name`（IconName 或历史 emoji）/ `size`（rpx）/ `color`（令牌名）/ `className` / `style` / `onClick`。
- **`data/*.ts` 里的 emoji 字段一个没改**：`EMOJI_TO_ICON` 把 emoji 当语义 id 翻译成图标，数据零改动、零回归。
- 替换覆盖主包 13 页 + 研学 6 页，含 `ranking` 的奖牌 emoji（改为纯数字排名，图形与线性图标风格冲突）。
- 尺寸统一：列表图标 24~32rpx，入口底座 44~56rpx，空态 72~120rpx。

### A② 死动画

- 删掉 23 处 `animation: fadeIn / fadeInUp`——写在 `*.module.scss` 里引用全局 keyframe，CSS Modules 会把动画名一起哈希，动画名永远悬空。
- `src/pages/home/index.module.scss` 保留的 `floatY` / `pulseSoft`，把 `@keyframes` **补进同一个文件**，让两边同哈希（已核对产物：`animation` 与 `@keyframes` 同名）。
- 结论写进 AGENTS §8 第 10 条：module 里要用的动画必须在本文件定义。

### A③④ 两处真 bug

- 品质页标题拼接：两个兄弟 `<Text>`（inline）之间不会换行，渲染成「品质展示北纬 31 度黄金产茶带的馈赠」。页头改 `masthead-title` 时顺带 `display: block` 解决。
- NPC 页胶囊溢出：右栏固定宽按钮把左栏挤窄 → 胶囊文字换行跑出圆角。`.npc-header-left{flex:1;min-width:0}` + `white-space:nowrap` + 文案缩短。

---

## B 档：让页面有「纸感」而不是「卡片汤」

### B① 卡片节奏

- 删除 43 处 `box-shadow: $shadow-card`，以及 9 处手写 `rgba(0,0,0,.05/.08/.12)` 的卡片投影。
- `@mixin card-surface` / `@mixin tea-card` 改为「白底 + 1rpx 发丝线」；页面本身是暖米白（`#F6F2E9`），卡片纯白（`#FFF`）已有明度差，再叠投影就是卡片汤。
- 投影只留给真正浮起的层：`$shadow-float`（底部操作栏、悬浮块）、`$shadow-popup`（弹层/模态）、金色徽标、滑块。

### B② 页头分级

- 绿渐变 hero 只保留「首页」与「NPC」两个主场页面。
- 研学、品质、溯源改成「宣纸底 + 大号墨色标题 + 3rpx 金线 + 说明文字」，统一走 `@mixin masthead-title($size)` + `@mixin masthead-rule($width)`。
- 报告页、我的页的「大绿块」也一并改宣纸白卡 + 金线。

### B③ 区块留白

- 区块间距 `$spacing-xl` → `$spacing-xxl`；研学页区标题补上边距（原来只有下边距，标题紧贴上一块卡片）。

---

## 质感层（P0）：纸、印、纹

去掉「AI 味」之后，页面变干净了，但也变「平」了——纯色底 + 无衬线字 + 无材质的组合，看着像后台模板。这一层补三件东西，全部是**代码生成**，不占素材体积：

| 件 | 实现 | 成本 |
| --- | --- | --- |
| 纸 | `src/styles/textures.scss` 里用 `feTurbulence` 生成纤维噪点，`@mixin paper-surface` 铺到页面底 | 每个 wxss +0.4K，合计 +7.7K |
| 印 | `src/components/Seal`（朱文/白文两式，宋体字 + 纸纹叠加） | 组件代码 ~2K |
| 纹 | `src/components/Motif`（茶枝 / 水波 / 缠枝，纯 stroke 路径） | 组件代码 ~2.5K |

- **纸纹参数是量出来的**：用 PIL 取纯底色区 400×400 的灰度 `mean/std`，目标是「看得见但不脏」。最终取 `180×180`、`baseFrequency 0.42`、`numOctaves 4`、`feFuncA gamma 1.9/1.4` → `mean 233.4 / std 3.36`；`std 67` 是砂纸，`std 1.65` 等于没铺。
- **新色 `$color-seal`（`#A83C2E`）只给印章**，不当强调色；`$font-family-seal`（宋体栈）只给印章和研学卡封面水印，正文仍是无衬线——小程序不能装字体，宋体栈靠系统字体命中，Windows/iOS 都有。
- 落点：首页 hero 右下角「槎山」朱文印、报告页「研学」白文印、首页入口卡下方金线茶枝、报告页页尾水波、研学卡封面单字水印（茶/耕/红）。
- 纹样 `height` 单位是 rpx：**20rpx（10px）时线宽 0.6px，几乎看不见；40rpx（20px）才成图**。

---

## 顺手改掉的同类问题

- 首页 hero 负 margin 导致宽 406px、首字被裁（父级没有左右 padding 却写了 `margin: 0 -$page-padding`）。
- 首页 hero 标题被状态胶囊挤成两行（断在「智慧 / 文旅」）→ 标题独占一行，胶囊移到副标题下方。
- 首页/研学的图标底座从「深绿实心渐变块」改「浅茶底 + 金线 + 主色描边」，颜色不再用来区分入口。
- NPC 页「我到达了」三个深绿实心按钮 → 列表行（白底 + 发丝线 + 左对齐 + 右侧箭头）。
- 排行榜：名次前多了反引号（`` `${idx+1}` `` 被当字面量）、名次与头像重叠、进度条压住校名 → 重排为「名次 44rpx + 头像 + 信息 flex + 右侧 150rpx」。
- 溯源页：绿渐变主卡改白卡（证据类信息压在绿底上读着发灰）；标题与说明粘成一行；三个 Tab 只有选中项有边框 → 全部给发丝线，选中态换浅茶底。
- 商城页客服卡：「咨询与购买」标题与说明粘成一行（又是 inline `<Text>`），补 `display:block` + 金线描边。
- 研学卡封面：原来 inline `style={{ background: coverBg, backgroundImage: 'none' }}` 把渐变清掉、字又是白色 100rpx → 三张卡顶部是纯白空块。改为宣纸底 + 单字宋体水印 + 茶枝纹样。

---

## hero 换实拍底图（用户提供照片）

`pages/home` 与 `pages/npc` 原来各是一块 `$gradient-hero` 绿色渐变。问题不在「绿色」，在于**它没有承载任何信息**——一块纯色 + 一道 radial 柔光，本质是占位符，所以看着像模板。

用户提供的照片（1776×2256，清晨薄雾茶垄、低角度逆光、行距向远处收敛）正好符合「上半天光是雾、天然是压字区」这一要求，于是切了两个裁切：

| 资产 | 用途 | 尺寸 / 质量 | 体积 |
| --- | --- | --- | --- |
| `src/assets/images/hero/hero-field.jpg` | 首页 hero | 750×560，q55 | 49,646 B |
| `src/assets/images/hero/hero-rows.jpg` | NPC hero（中景，亮度 ×1.10、对比 ×1.04） | 750×520，q55 | 64,349 B |

合计 **114K**，主包余量从 ~400K 降到 ~290K。

**结构（三层，别少任何一层）**

```
<View class="header">          ← 兜底底色 $color-primary-dark + overflow:hidden
  <Image class="heroBg" mode="aspectFill" />   绝对定位铺满
  <View class="heroScrim" />                   渐变压字层
  <View class="heroContent"> …标题/胶囊/副标题… </View>
  <Seal class="heroSeal" />                    两级选择器定位（§8 第 16 条）
</View>
```

**四条约束（都踩过）**

1. wxss 的 `background-image` 不吃本地相对路径 → 必须用 `<Image>` 当底图；写 `url('./x.jpg')` 真机直接不显示。
2. scrim 是可读性底线，不是装饰：首页 `rgba(16,26,19,.74/.34/.84)`、NPC `(.74/.44/.90)`。亮雾区白字裸奔会掉到 3:1 以下。
3. 照片上的胶囊不能再用白色半透明（雾会吃掉它）→ 改深色玻璃 `rgba(16,26,19,.38)` + 白细描边。
4. 内容必须包在 `.heroContent`（`position:relative; z-index:$z-raised`）里，否则被底图盖住。

**顺手删掉的死代码**：`.heroDecor` / `.heroGlow`（漂浮茶叶 + 光斑呼吸）与它们的本地 `@keyframes floatY / pulseSoft`——hero 换成真实照片后，这两团装饰反而是「AI 味」的来源。

---

## 验证

| 项 | 命令 | 结果 |
| --- | --- | --- |
| 微信端编译 | `npm run build:weapp` | `Compiled successfully in 6.30s`，`dist/` 1.7M（1759K，含 hero 实拍 +116K） |
| H5 对照 | `TARO_OUTPUT_DIR=../h5check npx taro build --type h5` | 14~15s |
| 截图 | `C:/Users/tr666/dsh-shots/shoot.mjs`（裸 CDP，390 视口 DPR2，`Emulation.setDeviceMetricsOverride` 加高视口后直接 `captureScreenshot`） | 11 页复核，console error 0 |

**H5 只能当参考**：`Chart` 组件的柱子高度写在 JSX inline style 里（`height: ${h}rpx`），H5 端会被整条丢弃 → 图表区出现大片空白，微信端正常。`npc-chat` 页在 H5 白屏，别拿它做验证页。

---

## 还没做的

1. **品质页图表重做**（最弱的一块）：三组柱各占半屏、柱高 6rpx、无基线无图例，绿=槎山/金=普通茶全篇没标注。应重排为「一行一指标 + 数值右对齐 + 细长对比条」。
2. **实拍替换 AI 图**：hero 已换成实拍（见上节）；剩下 `scenes`（6 张茶园）与 `products`（6 张产品）建议继续用真机实拍，同名同尺寸覆盖，包体不变。NPC 立绘可保留。
3. 金色收敛：现在金色同时出现在边框、徽标、图标、文字四类，建议只保留「边框 + 极少数强调字」。
4. 字号收口：26/28/30rpx 这类手写值应回到 8rpx 网格（P2 遗留）。
5. 标题字体：若还想再进一步，只对**固定字标**做 SVG（3~5 个，共 20K），不要上 `wx.loadFontFace`（要 https + 域名白名单，和「断网也能跑」冲突）。
