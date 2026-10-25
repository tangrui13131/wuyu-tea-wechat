# AGENTS.md — 槎山智慧文旅小程序（前端）

本文件是给 AI 编码代理 / 新加入的开发者看的项目说明书。改动代码前请先读完「约定」和「已知坑」两节。

---

## 1. 项目是什么

湖北孝感安陆「槎山白茶」景区的大创项目微信小程序，一套前端同时承担比赛演示与真实使用。

- 技术栈：**Taro 4.1.9 + React 18 + TypeScript 5 + webpack5 + Sass（CSS Modules）**
- 目标端：微信小程序（`weapp`）。`h5` / `tt` / `alipay` 脚本仍在 `package.json` 里，但不是交付重点，改样式时注意别把 H5 专用补丁（`src/styles/compat.scss`）删掉。
- 设计稿基准 **375**（`config/index.ts` → `designWidth: 375`，`deviceRatio[375] = 2`），样式一律写 `rpx` 语义的 px 数值，由 pxtransform 自动换算。
- 出包目录 `dist/`，微信开发者工具导入的就是它（`project.config.json` → `miniprogramRoot: "dist/"`）。
- **本目录不是 git 仓库**（`git status` 报 not a git repository），也没有 `.gitignore`。提交/协作前要先确认版本管理方式，别假设有 git 历史可回滚。

## 2. 命令（已在本机实测）

```bash
npm run build:weapp      # 生产构建 → dist/        （Node v24.15.0 实测 7~9s 编译成功）
npm run dev:weapp        # watch 开发构建 → dist/   （改完在开发者工具里刷新）
npm run build:h5         # H5 构建
```

- 想验证构建又不想覆盖 `dist/`：`TARO_OUTPUT_DIR=dist_verify npm run build:weapp`（`config/index.ts:19` 支持该环境变量），验证完记得删掉目录。
- **同一时刻只允许一个进程写 `dist/`**：`dev:weapp` 的 watch 与一次性 `build:weapp` 同时跑，会互相 clean/覆盖，微信开发者工具读到「半截产物」时表现为**页面全白**（导航栏、tabBar 正常，内容区空白、控制台无红字）。遇到白屏先看是不是两个构建在抢目录，再点一次开发者工具「编译」。
- **H5 构建也必须隔离 `outputRoot`**：`TARO_OUTPUT_DIR` 对 h5 同样生效，直接 `npm run build:h5` 会**清空小程序的 `dist/`**。做跨端对照请用 `TARO_OUTPUT_DIR=dist_h5 npm run build:h5`。
- **验证手段只有构建**。仓库没有 test / lint 脚本，也不存在 `eslint.config.*` / `.stylelintrc*`（虽然 devDependencies 里装了 eslint、stylelint）。
- `npx tsc --noEmit` **不能当门禁**：当前有 141 个历史遗留类型错误（`strictNullChecks` + `noUnusedLocals` + `noUnusedParameters` 全开，主要集中在 `src/pages/study/index.tsx`、`src/utils/chat.ts`、`src/pages/mine/index.tsx`）。判断改动是否安全，看 webpack 是否 `Compiled successfully`。
- 后端不在本仓库。开发时需自行启动 `http://127.0.0.1:3001`，并在微信开发者工具里勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」。

## 3. 目录地图

```
config/               Taro 构建配置（index.ts 主配置，dev.ts / prod.ts 极简）
types/global.d.ts     *.png/*.scss 模块声明 + TARO_ENV/NODE_ENV 类型
src/
  app.tsx             App 入口：启动即静默登录 login()
  app.config.ts       全局配置：主包 13 页 + 研学分包 6 页、tabBar（5 个 Tab）、位置权限声明
  app.scss            全局样式：@use compat + variables + animations
  config/
    api.ts            API_CONFIG.baseURL（默认 http://127.0.0.1:3001）、超时、mock 降级开关、setBaseURL()
    llm.ts            大模型直连封装（provider 默认 'mock'，apiKey 留空）
  services/index.ts   ★ 唯一服务层：页面只依赖它，不直接依赖 data/*
  utils/
    request.ts        Taro.request 封装 + requestWithFallback（失败降级到 mock）+ netState
    storage.ts        本地存储，统一前缀 chashan_wenlv_；userPreferencesStorage / studyReportStorage
    user.ts           openid / token / userId，微信登录失败降级为本地身份
    location.ts       景区真实坐标 SCENE_LOCATIONS（6 个景点）、距离计算、围栏触发、扫码路由
    chat.ts           NPC 会话历史（按 userId+npcId 分 key）、收藏、解锁
    research.ts       研学主题/关卡进度状态机（locked→in_progress→completed/skipped）
    checkin.ts        景点打卡记录
    tts.ts            微信同声传译 WechatSI 语音播报，插件缺失时全部安全降级
    routeMatcher.ts   规则推荐（40/30/30 权重）+ 标签选项
    recommend.ts      任务/报告→商品推荐映射
    validator.ts      敏感词与内容安全检查
  data/               ★ 离线 mock 数据（routes/npcs/tasks/quality/research/products/scenes/trace/studyCourses/dashboardMock）
  components/         8 个复用组件（卡片类 + Chart / DashboardChart / NPCAvatar / TagSelector）
  pages/              13 个主包页面（5 个 Tab + 8 个二级页），见下
  subpackages/study/  研学分包：6 个 study-* 页面 + 课程封面图，路由前缀 /subpackages/study/pages/...
  styles/             variables.scss（唯一变量源）、theme.scss（旧配色，勿引用）、animations.scss、compat.scss
```

页面清单与角色：

| 页面 | 说明 |
| --- | --- |
| `pages/home` | Tab1 首页：偏好采集 → 规则推荐线路 + 周边联动线路 |
| `pages/npc` | Tab2 NPC 列表 |
| `pages/npc-chat` | NPC 对话（最复杂，462 行）：阶段条 pre/task/post、快捷回复、TTS、收藏 |
| `pages/study` | Tab3 研学主题列表（用**非** module 的 `index.scss`）。**Tab 页必须留在主包** |
| `subpackages/study/pages/study-detail` `study-task` `study-courses` `study-course-detail` `study-booking` `study-my-bookings` | 研学关卡执行、课程与预约（同样用普通 `index.scss`），已拆分到研学分包，路由前缀 `/subpackages/study/pages/...` |
| `pages/quality` | Tab4 品质展示：槎山白茶 vs 普通茶对比图表 + 商品转化入口 |
| `pages/mine` | Tab5 我的：统计、功能入口（含运营看板入口） |
| `pages/route-detail` | 导览地图 + 景点列表 + 定位触发 NPC |
| `pages/task-detail` `pages/report` | 关卡详情、研学报告生成与导出 |
| `pages/shop` `pages/trace` | 商品、茶叶溯源 |
| `pages/dashboard` `pages/ranking` | 运营看板（客流/转化）、排行榜 |

## 4. 架构：数据从哪来（改数据前必看）

```
页面 (pages/*)
  ↓ 只 import from '@/services'
services/index.ts  —— 每个函数都包 requestWithFallback(接口, 本地兜底)
  ↓
utils/request.ts → Taro.request(API_CONFIG.baseURL + path)
                    头部带 x-openid、Authorization: Bearer <token>
                    后端返回 { code: 0, data }，code≠0 或网络失败则抛错
  ↓ 失败且 API_CONFIG.fallbackToMock === true
data/*.ts 本地 mock → 页面照常渲染
```

三条铁律：

1. **页面不要直接 `import ... from '@/data/xxx'`**。数据源统一收口在 `services/index.ts`，这样后续切真实接口只改一个文件。现有例外是 `pages/trace`（直接读 `data/trace`）和 `pages/quality`（读 `data/quality` 的 `geographyData` 常量），属于合理只读常量，但新增页面请走 services。
2. **新增接口必须带 fallback**：用 `requestWithFallback(path, options, fallback)`，否则后端没起时页面会白屏/空列表——本项目的演示场景强制要求「断网也能跑」。只有写操作（创建预约、生成报告）才用裸 `request`。
3. **离线态要在 UI 上显式提示**：`API_CONFIG.fallbackToMock` 生效时，用 `netState.online` 判断，参考 `pages/home/index.tsx` 的 `offlineBar` 写法（「当前为离线演示数据」）。

## 5. 代码约定

- **路径别名**：`@/` → `src/`（`tsconfig.json` + `config/index.ts` 的 TsconfigPathsPlugin）。跨目录引用一律用 `@/`，不要写 `../../`。
- **新增页面三件套**：`src/pages/<name>/index.tsx` + `index.config.ts`（`export default definePageConfig({...})`）+ 样式文件；**然后必须把 `'pages/<name>/index'` 加进 `src/app.config.ts` 的 `pages` 数组**，否则页面不存在。Tab 页才进 `tabBar.list`，非 Tab 页只能 `navigateTo`。
  - 研学分包页面放 `src/subpackages/study/pages/<name>/`，注册到 `app.config.ts` 的 `subPackages[0].pages`（只写 `pages/<name>/index`，不带 `subpackages/study` 前缀），跳转路径写全 `/subpackages/study/pages/<name>/index`。**分包内代码用 `@/` 引用 utils/data，不要用 `../../`**（层级已经变深，相对路径极易算错）。
- **样式两种写法并存，不要混用**：
  - 组件与大部分页面：`index.module.scss` + `import styles from './index.module.scss'` + `className={styles.xxx}`（CSS Modules，`namingPattern: 'module'` 只对 `*.module.scss` 生效）。
  - `study*` 系列与 `npc` 页面 + `components/ResearchCard`：普通 `index.scss` + 全局类名。改这些页面不要擅自改成 module，类名一改整页样式就崩。
- **SCSS 变量**：所有 `*.scss` 开头统一 `@use '@/styles/variables.scss' as *;`（全仓库 29 个文件已迁移，**不要再写 `@import`**，Dart Sass 3.0 会移除）。颜色/字号/间距/圆角/阴影/mixin 都从这里取，禁止硬编码十六进制色值——新增色值请先加进 `variables.scss` 并在注释里说明用途。
  - **令牌清单（本轮新增，写样式前先查这张表，别自造值）**：
    - 色板：`$brand-1~10`（竹墨绿 10 档，`$brand-7` = `$color-primary`；浅底用 1/2、描边 3、图表 5、hover 6、active 8）、功能色 `$color-{success,warning,error,info}-{light,active}`、控件底 `$color-bg-component`、蒙层 `$color-mask`、金线 `$color-gold-line` / `$color-gold-line-strong`。
    - 排版：`$leading-caption…$leading-hero`（rpx 绝对值）配 `@include text-caption|text-note|text-body|text-emphasis|text-title|text-heading|text-hero`——**字号与行高一次拿到，不要只写 font-size 让行高走默认**。
    - 形状与层级：`$radius-circle`（正圆）、`@include hairline-bottom($color)`（发丝线，优于 `1rpx solid`）、`$z-base/raised/sticky/header/overlay/mask/modal/toast`。
    - 字体栈：`$font-family-base` / `$font-family-number`（在 `app.scss` 里给 `page` 用）。
  - **禁止 `rgba(<手抄色值>, α)`**：要半透明一律 `rgba($color-xxx, α)`。历史坑：`$shadow-*` 曾写成 `rgba(47, 93, 58, ·)`（= 手抄 `$color-primary-dark`），改主色时阴影不跟随。
  - `src/styles/theme.scss` 是**旧版配色，未在任何文件中 `@use`，属于历史残留**，不要引用（它还是全仓最后一处硬编码 hex 聚集地，23 处）。
- **单位**：写 px 数值 + 语义化变量，如 `padding: $spacing-md;`、`border-radius: $radius-lg;`。不要写 `rem`、`vw`。
- **图标（已统一，别再引 emoji）**：一律用 `src/components/Icon`（`<Icon name='tea' size={32} color='primary' />`）。`src/components/Icon/icons.ts` 里有 33 个 24 网格线性路径（`stroke-width 1.8`、圆角端点、单色描边），渲染方式是 `background-image: data:image/svg+xml`（WXML 不支持内联 `<svg>`），按 `name|color` 缓存 URI。
  - `name` 同时接受 `IconName` 和**历史 emoji**（`EMOJI_TO_ICON` 兜底）：`data/*.ts` 里那些 emoji 字段因此不用改，只当语义 id 用。
  - **Icon 是块级 `<View>`，不能塞进 `<Text>` 里**（weapp 会丢）。要行内效果就改成 flex 容器 + 兄弟节点。
  - 尺寸：列表 24~32rpx、入口底座 44~56rpx、空态 72~120rpx；颜色只能用 `ICON_COLORS` 里的令牌名（primary/primaryDark/white/onDark/ink/secondary/tertiary/accent/accentText/warning/error/success），不要传十六进制。
- **卡片与投影（B 档已定）**：内容卡一律「白底 + `1rpx` 发丝线」（`@mixin card-surface` / `@mixin tea-card` 已改），**不要再加投影**——页面是暖米白、卡片纯白，已有明度差，再叠投影就是「卡片汤」。投影只留给真正浮起的层：`$shadow-float`（底部操作栏、悬浮块）、`$shadow-popup`（弹层/模态）。新写卡片时先问一句「它浮起来了吗」，没浮就别写 `box-shadow`。
- **页头分级（B 档已定）**：绿渐变 hero 只属于「首页」和「NPC」两个主场页；其余页面（研学、品质、溯源、报告、我的）一律「宣纸底 + 大号墨色标题 + 3rpx 金线 + 说明文字」，用 `@mixin masthead-title($size: 52rpx)` + `@mixin masthead-rule($width: 56rpx)`，`<Text>` 必须 `display: block`（否则标题和说明会粘成一行，品质页踩过）。
- **质感三件套（P0 已定，都是代码生成、不占素材）**：
  - **纸**：页面根用 `@include paper-surface;`（`src/styles/textures.scss` 的 `feTurbulence` 纤维纹，实测灰度 `mean 233.4 / std 3.36`）。**只铺页面底，不要铺卡片**——卡片保持纯白才有「纸上的卡」的明度差；输入框、列表行、按钮这类控件也用纯色，别铺纹。
  - **印**：`<Seal text='槎山' size={76} variant='yin'|'yang' />`（`src/components/Seal`）。只用于落款与签章（首页 hero、报告页），颜色固定 `$color-seal`（`#A83C2E`，第三色，**不当强调色**），字体固定 `$font-family-seal`（宋体栈）。
  - **纹**：`<Motif name='branch'|'wave'|'vine' height={40} opacity={0.4} />`（`src/components/Motif`）。`height` 单位 rpx，**低于 40rpx 线宽不足 1px 基本看不见**；只做分隔与页尾收束，别铺成背景。
  - Seal / Motif 内部都带 `position: relative`，页面里要绝对定位时**用两级选择器**（`.header .heroSeal { position: absolute }`），否则同权重会被组件样式压掉（§8 第 16 条）。
- **hero 底图（实拍，已替换掉绿渐变）**：首页与 NPC 页的 hero 用 `src/assets/images/hero/` 下的实拍照片（`hero-field.jpg` 750×560 远景茶垄薄雾、`hero-rows.jpg` 750×520 中景茶垄，各 ~50~65K，q55）。
  - **必须用 `<Image mode="aspectFill">` 铺**：小程序 wxss 的 `background-image` 不吃本地相对路径（只认网络图/base64），写成 `background-image: url('./x.jpg')` 在真机上直接不显示（§8 第 19 条）。
  - 三层结构固定：`.heroBg`（绝对定位铺满）→ `.heroScrim`（渐变压字层）→ `.heroContent`（`position: relative; z-index: $z-raised`）。新增 hero 内容一定要塞进 `.heroContent`，否则会被底图盖住。
  - scrim 不是装饰而是**可读性底线**：亮雾区白字裸奔会掉到 3:1 以下。首页 `rgba(16,26,19,.74→.34→.84)`、NPC `(.74→.44→.90)`；换图后必须重新截图确认标题与副标题仍可读。
  - 照片上不要再用白色半透明胶囊（雾会把它吃掉），统一 `@include glass-pill`（`rgba(16,26,19,.42)` 深色玻璃 + `1rpx` 白边 + 内侧高光）。首页 hero 的徽标/状态条、NPC 页「体验：一键解锁」都走这个 mixin，**不要再手写 `rgba(16,26,19,·)`**。
  - **照片上的主操作仍用卡纸**（`paper-btn-oat` 燕麦纸片 = 暗照片上唯一的亮块），次操作用玻璃胶囊后退。两个按钮都做成纸片会失去层级（NPC 页踩过：两块米色并排，既无主次又像贴上去的卡片），都做成深绿则会和实拍糊在一起。
- **卡纸按钮（`paper-btn-*`）**：全站按钮统一四选一——主操作 `paper-btn-sage`（艾草绿 `#51684F`）、次操作 `paper-btn-oat`（燕麦 `#E5DEC9`）、禁用 `paper-btn-disabled`（内凹，**不用 opacity**）、危险操作用纸底 + 朱红描边/朱红字（不做红色实心）。所有 `<Button>` 都要 `@include button-reset`（去掉 `::after` 默认边框）；按压态靠 `<View hoverClass>` + `paper-btn-press`，**不要用 `@include press-fx` 的 `:active`**（WXSS 不一定支持，真机可能静默失效）。按钮上的图标颜色要跟着底色走（燕麦底用 `color='ink'`，sage 底用 `color='white'`）。
  - **形状分级（两档，别混用）**：页面级 CTA 用胶囊 `$radius-button`（999rpx，如「生成路线」「提交预约」）；**卡片内部的操作按钮**用 `$radius-btn-card`（20rpx）——胶囊塞进卡片会像「两根扁香肠」，且方角卡片托不住圆头。卡片内主次按钮按 **1.65 : 1**（黄金比）分配宽度：主 `flex: 1.65`、次 `flex: 1`，高度统一 `88rpx`（44px，28rpx 字不顶边框的下限），间距 `$spacing-md`（24rpx）。参考实现见 `src/components/RouteCard/index.module.scss` 的 `.routeActions`。
  - **不要在按钮里叠「内缩模切线」**：`paper-btn-*` 已经自带外描边 + 顶部受光（`inset 0 2rpx 0`）+ 底部背光（`inset 0 -3rpx 0`），88rpx 的高度里再加一道 `::before` 内框就是 5 条线，放大看像给按钮套了相框（路线卡试过，已删）。
- **类型**：公共类型放 `src/types/`（`index.ts` 已统一 re-export）；仅页面内部用的 interface 写在页面顶部。允许 `any`（`noImplicitAny: false`），但 services 的返回值和 `data/*` 的结构尽量给类型。
- **存储**：一律走 `utils/storage.ts`（自动加 `chashan_wenlv_` 前缀、JSON 序列化）。直接 `Taro.setStorageSync('chashan_wenlv_api_base' | 'chashan_voice_on')` 的两处是刻意绕过（配置类、需少一层解析），新增业务数据不要效仿。
- **埋点**：调 `track(event, page, payload)`（`services/index.ts`），5 条缓冲后批量上报 `/api/track/batch`；页面进入用 `useDidShow(() => track('page_view', 'pages/xxx/index'))`。
- **动效**：keyframes 与工具类只存在于 `src/styles/animations.scss`（全局，类名不被哈希）。要「滚动进入才播放」一律用 `<Reveal variant="fade-up|fade-in|pop-in|scale-in" delay={ms} className={styles.卡片的类}>`（`src/components/Reveal`，内部用 `Taro.createIntersectionObserver` 观察，进入视口才加 `.anim-*` 类；观察失败则静态展示，**不会因为动画没触发而隐藏内容**）。延迟按 40/110/180ms 错峰即可，不要超过 300ms。
- **动效三件套**（都已实现，直接复用，不要另起一套）：`Reveal`（滚动进场，见上）；`Counter`（数字从 0 滚到目标值，props `value/duration/decimals/prefix/suffix/className`，`setTimeout(32ms)` + `easeOutCubic`，已在「我的」页三处统计使用）；`RubberSegment`（2~5 个**互斥**选项的胶囊分段控件，滑块宽度用 CSS 变量 `--seg-count` + WXSS `calc((100% - 12rpx) / var(--seg-count, 2))` 计算，位移 `translateX(activeIndex * 100%)`，回弹缓动 `cubic-bezier(0.34, 1.28, 0.64, 1)`；已用于首页「停留时长」）；`SpotlightCard`（触屏高光卡片，按下时 `Taro.createSelectorQuery` 取一次 rect，`clientX - rect.left` 定位 radial-gradient 光斑，move 节流 50ms；已用于商城商品卡）。**多选标签仍用 `TagSelector`**，只有互斥且选项少才换 `RubberSegment`。
- **不要在 `*.module.scss` 里写 `animation: fadeInUp 0.4s`** 引用全局 keyframe：CSS Modules 会把动画名改写成本地名（`index-module__fadeIn___xxx`），而 `@keyframes` 只有全局一份，结果动画名悬空、动画静默失效（见 §8 第 10 条）。要么用 `.anim-*` 全局类，要么把 `@keyframes` 也写进同一个 module 文件。
- **注释语言**：中文。已有代码里大量注释解释了「为什么这么写」，修 bug 时优先读懂注释再改，改完把过时注释一并更新。

## 6. 业务领域要点

- 五个 NPC 角色中已实现 3 个（`data/npcs.ts`）：`npc-fairy` 白叶仙姑（白茶传说）、`npc-tea-farmer` 双泉老茶农（制茶工艺）、`npc-soldier` 老战士（红色文化）。每个 NPC 有 `knowledgeDomain` + `systemPrompt`，超出领域要礼貌拉回。
- 6 个景点围栏坐标在 `utils/location.ts` 的 `SCENE_LOCATIONS`（安陆槎山真实坐标，`triggerRadius: 50` 米），`data/scenes.ts` 只补充展示文案、**复用同一份坐标**——不要在两处分别维护坐标。
- 对话三阶段：`pre`（寒暄）→ `task`（引导研学任务）→ `post`（任务完成反馈），由后端返回 `state` 字段驱动，前端 `npc-chat` 据此切 UI。
- 研学：主题 → 关卡 → 提交（location / text / answer / image 四种类型）→ NPC 反馈 + 知识卡片 → 报告生成。进度状态机全部在 `utils/research.ts`，**关卡解锁顺序和进度计算不要绕过它自己算**。
- 推荐引擎按 BP 分三阶段（规则 → 行为采集 → 协同过滤），当前只实现第一阶段；`services.recommend` 的本地兜底复用 `utils/routeMatcher.matchRoutes`（**注意导出名是复数 `matchRoutes`**，历史上写成 `matchRoute` 直接导致 `not a function`）。
- 定位权限已在 `app.config.ts` 声明 `requiredPrivateInfos` + `permission['scope.userLocation']`，删改会导致真机定位失效。

## 7. 外部依赖与配置

- **本机（睿的 Windows 机器）没有后端代码**：`chashan-backend` 只存在于另一台机器的 `C:\Users\20312\Desktop\yuya\大创项目\`，本机 MySQL 里也没有 chashan 库（全盘 C/D/E/F 已搜过）。所以本机默认跑的就是**离线演示模式**：`fallbackToMock` 生效，主包 13 页 + 研学分包 6 页全部可用，只是首页顶部显示「离线演示数据」、NPC 只回预设开场白、预约/报告等写操作会 toast「请确认后端已启动」（所有写操作都有 catch，不会崩页）。纯前端开发不需要后端。
- 后端接口前缀 `/api`，默认 `http://127.0.0.1:3001`（`src/config/api.ts`）。真机调试改成电脑局域网 IP：可直接改常量，或运行时调 `setBaseURL(url)`（会写入 storage，下次启动自动读回）。
- 小程序 appid 当前是 `touristappid`（游客/测试号），`project.tt.json` 同样是占位。要在真机上验证微信能力（登录、定位、插件）必须换成真实 appid。
- **微信同声传译插件（WechatSI）的 `plugins` 声明在 `app.config.ts` 中被刻意注释掉**。原因写在注释里：开发者工具模拟器不允许加载第三方 appid 插件，会导致模拟器启动失败（「登录用户不是该小程序的开发者」）。`utils/tts.ts` 已完整实现调用与降级，恢复声明前必须确认走真机验证。
- `src/config/llm.ts` 默认 `provider: 'mock'`，返回硬编码预置回复。真正对话走后端 `/api/npcs/:code/chat`。

## 8. 已知坑（别重复踩）

1. **`启动开发环境.bat` 是别的机器上的脚本**，里面写死 `C:\Users\20312\...` 的 MySQL、后端、node 路径。在本机直接双击必然失败，只能当「启动步骤说明」参考。
2. **`build.log`、`_nul`、`dist/` 都是历史产物**，路径指向 `C:/Users/20312/Desktop/yuya/大创项目/...`。`build.log` 里的 Sass `@import` 弃用警告已经过时（源码全部改成 `@use` 了），不要照着去「修复」。
3. **`package.json` 声明了 `zustand`、`dayjs`、`classnames`，但代码里一处都没用到**（全局状态目前靠 React state + storage）。想引入状态库可以，但别以为项目里已有现成的 store。
4. **`tsconfig` 开了 `noUnusedLocals` / `noUnusedParameters`**，留一个未使用的参数就会多一条 TS 错误，写代码时顺手清理。
5. **`dist/` 是构建产物，不要手改**；改完源码跑 `npm run build:weapp`。`src/config/api.ts` 的 `setBaseURL` 用 `require` 动态取 Taro，是为了规避循环依赖，别改成顶层 import。
6. **CSS Modules 类名是 `[name]__[local]___[hash:base64:5]`**，用字符串拼类名（``className={`${styles.a} ${styles.b}`}``）没问题，但别写 `styles['a-b']` 这种 kebab 动态取值——统一用 camelCase 类名。
7. `src/assets/chashan/` 是空目录（历史遗留），真正的图片资产在 `src/assets/images/`，统一经 `src/assets/images/index.ts` 的 `IMG` 表引用；`src/assets/tabbar/` 放 tabBar 图标。
8. **页面白屏 ≠ 代码坏**：`dist/` 被打断的构建写坏时，小程序端就是内容区全白且控制台不报错。先用 `TARO_OUTPUT_DIR=dist_h5 npm run build:h5` 起一个 H5 对照（`python -m http.server` 就能看），H5 正常即说明是产物/编译问题，而不是组件逻辑问题。
9. **组件 props 以组件定义为准**：`src/components/NPCCard/index.tsx` 的解锁态 prop 名字是 `isUnlocked`，`src/pages/npc/index.tsx` 之前误传 `unlocked`（React 不报错，只表现为卡片永远「未解锁」、点击不跳转）。已修正，新增页面复用时注意。
10. **CSS Modules 会把 `animation: fadeIn` 的动画名改写成本地名**（如 `index-module__fadeIn___xxxx`），而 `@keyframes` 只以全局名存在于 `dist/app-origin.wxss`，导致 `*.module.scss` 里的入场动画名悬空、动画静默不生效（页面仍可见，属视觉缺陷）。**统一解法已定**：入场动效改用全局工具类 `.anim-*` + `<Reveal>` 组件（见 §5「动效」）。`pages/npc`、`pages/home`、`pages/mine` 等 module 页里若还残留 `animation: xxx` 写法，改到 `.anim-*` 即可，不要再在 module 内引用全局 keyframe 名。
11. **inline style 里写 `rpx` 在 H5 端不生效**（Taro 只转译 WXSS/SCSS 里的 rpx，`style={{ width: 'calc(50% - 12rpx)' }}` 会被浏览器整条丢弃）。跨端组件的尺寸要么走 class + WXSS 的 `calc(100% / var(--x))`（用 `style={{ '--x': n }}` 传参），要么在 JS 里换算成 px。`RubberSegment` 的滑块踩过这个坑：H5 上宽度为 0、滑块完全不显示，而 weapp 正常——**这类「只在 H5 复现」的样式问题不要只靠微信开发者工具验**。

12. **`<Text>` 是 inline 元素，`margin` 上下不生效、相邻 `<Text>` 会粘成一段**：品质页曾把「品质展示」和「北纬 31 度…」两个兄弟 `<Text>` 并排，渲染成「品质展示北纬 31 度黄金产茶带的馈赠」；同类还有溯源页、报告页。页头/说明一律 `display: block`，或者改用 `<View>` 包一层 flex。
13. **小程序的 `<Button>` 默认 `display: block; width: 100%`**：放进横向 flex 里会占满整行、把兄弟节点挤到换行或压窄（NPC 页把左栏挤窄后，胶囊文字换行跑出圆角）。要「按钮本体宽度」就显式 `display: inline-flex; width: auto; flex: 0 0 auto; max-width: …`。另外 `button::after` 默认带 `left: 0`，想用伪元素画右侧箭头必须同时写 `left: auto`，否则箭头跑到左边。
14. **H5 截图只能当参考，不能当验收**：`Chart` 的柱子高度写在 JSX inline style（`height: ${h}rpx`），Taro 只转译 WXSS 的 rpx，H5 端整条丢弃 → 图表区大片空白，微信端正常；`npc-chat` 页在 H5 直接白屏。看视觉用 `.shots/shoot.mjs`（裸 CDP，390×844 DPR2），**尺寸/图表类问题必须在微信开发者工具里再看一遍**。

15. **H5 静态服务下改完样式要强制刷新**：`dist_h5` 是纯静态站点，`#/pages/xxx` 这类 hash 跳转**不会重新加载文档**，改了 token/SCSS 再切路由，看到的仍是旧样式（本次改三级文字颜色时，浏览器里量到的还是旧的 `#8A938C`，一度误判改动没生效）。验证顺序：重新 `npm run build:h5` → 换一个 query（`index.html?v=N`）或 Ctrl+Shift+R → 再用 `getComputedStyle` 量。

16. **组件自带的 `position: relative` 会压掉页面的 `position: absolute`**：两者都是单类名（0,1,0），而组件样式在 common chunk 里后加载 → 后写赢。表现是「绝对定位的元素变成静态块，跑回文档流左上角」（首页的朱文印章一度压在 hero 左侧文案上）。修法：页面侧用**两级选择器**（`.header .heroSeal { position: absolute }`，权重 0,2,0），不要用 `!important`，也不要给组件加无意义的包装层。

17. **SCSS 字符串里的 data URI 必须用双引号包、SVG 属性用单引号**：`$x: url("data:image/svg+xml,<svg width='120' …>")`。若外层也写单引号，第一个 `='` 就把字符串截断，编译产物被切碎、纹样静默消失**且构建不报错**（排查时表现为「wxss 里有一堆莫名片段」）。同理 SVG 里的 `#` 必须写成 `%23`（`fill='%23A83C2E'`），否则被当成 URL fragment 截断。

18. **拼 SVG 路径时要包 `<path>`**：`MOTIF_PATHS[name].join('')` 直接把 `d` 串拼进 `<svg>` 会得到一个「能加载、能 new Image、但不画任何东西」的图（300×40、`load` 事件正常）。必须 `.map(d => '<path d="' + d + '"/>').join('')`。

19. **wxss 的 `background-image` 不支持本地相对路径**：小程序只认网络图或 base64，写 `background-image: url('./hero.jpg')` 在真机上就是不显示（开发者工具模拟器有时能显示，容易误判）。要铺本地位图一律用绝对定位的 `<Image mode="aspectFill">` 当底图层，内容层抬 `z-index`（见 §5「hero 底图」）。
20. **`@include button-reset` 会把写在它前面的 `margin` 全部清零**：该 mixin 内有 `margin: 0`（用于清掉微信 button 默认的 `margin-left/right: auto`），SCSS 按书写顺序展开，所以 `.x { margin-top: 24rpx; @include button-reset; }` 最终是 **margin-top: 0**。症状是「应该分开的按钮完全贴在一起」，且编译不报错、样式表里看不出异常。规则：**margin 一律写在 `@include button-reset` 之后**。2026-10 已按此修掉 11 处历史 call site（report / shop / route-detail / npc / study-booking / study-task）。

## 9. 安全红线（硬规则）

- **绝不把 API key / token / 密码写进源码**。`src/config/llm.ts` 的 `apiKey` 必须保持空字符串；如需真实密钥，走后端代理或环境变量。
- **提交前确认没有本地配置与密钥被 staged**（本目录暂无 git，一旦初始化仓库先补 `.gitignore`）。
- 小程序包体积上限 **2MB（主包）**（分包另有额度）。当前 `dist/` 实测 **1.7M（约 1759K）**：主包 ≈1.66MB（其中图片 826K，含 hero 实拍 114K）、研学分包 92K，**余量约 290K**。新增图片/大依赖前必须先算体积。
  - 纸纹是 data URI，会**在每个 `@use` 到它的 wxss 里各展开一份**（当前 18 个页面），每份约 +0.4K，合计 +7.7K——这是已知且可接受的代价，但别再把别的纹理也这么铺。
  - 图片总量 608.8KB / 42 张 + tabBar 24.5KB / 10 张，最大项：`scenes` 110K、`covers` 95K、`courses` 86K、`npc` 62K（含 3 张立绘）、`levels` 62K、`trace` 55K。
  - 压缩参数见 `scripts/prepare-assets.py`：4:3 → 420×315 q52、16:9 → 440×248 q50、1:1 → 340 q58、空态 300 q60、头像 180 q72、立绘 320×427 q60、徽章/Logo 160 PNG（圆形另做 alpha 裁切）、tabBar 81×81 PNG。**不要直接塞 2048px 原图**（原始素材单张 0.8–1.3MB）。
  - **Taro 不按分包拆静态图**：所有被 import 的图片统一落在主包的 `dist/assets/images/` 下，把图片目录挪进 `src/subpackages/` 也不会减小主包，只能靠压尺寸/换远程图。

- **文字颜色有专门的 token，别直接拿品牌色当文字**：`$color-text-tertiary` 已从 `#8A938C`（宣纸米底 2.83:1，不达标）加深到 `#66716A`（4.55:1）；金色文字用新增的 `$color-accent-text` `#8A6631`（白卡 5.22:1），而 `$color-accent` `#B98E4E` 只用于渐变、描边、图标（作文字仅 2.98:1）。改配色时先用对比度算一遍，别只看设计稿。

## 10. 待办与改进方向

- 把 `study*` 系列页面与 `npc`、`ResearchCard` 的普通 `index.scss` 统一到 CSS Modules（需同步改类名，逐页验证）。
- 清理 141 个历史 TS 错误，让 `tsc --noEmit` 可当门禁；错误最集中的是 `src/utils/chat.ts`（12 个，均为 `storage.get` 返回 `undefined` 未处理）。
- `pages/ranking` 数据未走 services，是页面内硬编码，应迁到 `data/` + service。
- 组件名 `Chart` / `DashboardChart` 过于通用，后续新增图表容易冲突，建议按语义重命名（如 `QualityCompareChart`）。
- **48 张 AI 素材已全部接进代码**：`IMG.npc.*Portrait`（NPCCard 立绘）、`IMG.levels.*`（研学关卡缩略图）、`IMG.trace.*`（溯源页三段配图）、`IMG.states.empty/offline`（商城空态、首页离线条）、`IMG.brand.logo`（首页徽标）、`IMG.states.badge`（我的页昵称角标）。`../_deferred-assets/` 里留的是 12 张原图副本（每张 0.8MB+），图片已全部复制进包内，该目录可随时删除。
- 溯源页图片用 `Placeholder` 组件承载：传 `src` 就渲染真图（底部半透明文字条），不传回退渐变+emoji，方便以后接真实图。
- **动效四件套已落地**：`Reveal`（滚动进场，全站列表/卡片）、`Counter`（我的页三处统计）、`RubberSegment`（首页「停留时长」，替代原来的单选 TagSelector）、`SpotlightCard`（商城商品卡按下高光 + 轻微下压）。下一批候选：滚动进度条、文字逐字浮现、卡片 3D tilt、覆盖层模糊；要不要做取决于真机手感验收。

## 11. 移动端验收清单（改完 UI 逐条过）

> 来自 `ui-ux-pro-max` 技能里的 UX 规则，已剔除 Web-only 项（hover、cursor、focus ring、自定义滚动条在小程序里不适用）。

**触控**
- 可点元素不小于 **44×44 dp**（本项目按 88rpx 走）。当前已知偏小的：分段选择器已从 64rpx 调到 80rpx；tabBar 由原生渲染，不受影响。
- 可点元素之间留 ≥16rpx 间距，避免误触；滚动容器里不要放「贴边的小按钮」。

**对比度（WCAG AA）**
- 正文文字 ≥ **4.5:1**，大字（≥32rpx 粗体）与图标 ≥ **3:1**；目标是 4.5:1 以上。
- 禁用态/占位符也按 4.5:1 算——「看不清的灰字」是最常见的验收扣分项。
- 用 token：正文 `$color-text`、次要 `$color-text-secondary`、辅助 `$color-text-tertiary`、金色文字 `$color-accent-text`。

**反馈**
- 点击必须有 150ms 内的视觉变化（按下态 `:active` 或 `SpotlightCard` 的下压/高光）。
- 确认类动作（打卡、提交关卡、生成路线）调一次 `haptic()`（`src/utils/feedback.ts`，失败静默）。
- 异步操作要有 loading 或骨架，不能点完没反应。

**动效**
- 进场 150–300ms、出场 100–200ms，只用 `transform`/`opacity`；不要动画 `width/height/top/left`。
- 尊重「减少动态效果」目前无系统开关可读，因此动效一律是「不做也完整」的增强（`Reveal` 查不到节点就直接显示）。
- 动画名不要写在 `*.module.scss` 里（见 §8 第 10 条），用 `.anim-*` 全局类。

**排版与安全区**
- 正文不小于 20rpx（本项目普遍 24–28rpx）；行高 1.5–1.7。
- 底部 tabBar 页面留出安全区：页面底部内边距 ≥ `env(safe-area-inset-bottom)` + 120rpx（tabBar 高度）。
- 不要用纯图片承载信息文字（AI 生成的图里若出现文字，必须自行覆盖或裁掉）。
