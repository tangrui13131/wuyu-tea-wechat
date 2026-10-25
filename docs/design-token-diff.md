# 设计令牌差异表

> **对照对象**：本项目 `src/styles/variables.scss`（234 行）× TDesign MiniProgram **v1.17.0**
> **TDesign 数据来源**：npm `tdesign-miniprogram` 包内 `miniprogram_dist/common/style/theme/{_light,_font,_spacer,_radius}.wxss`（腾讯官方发布的编译产物，非二手转述）
> **对照口径**：TDesign 设计基准 750rpx（`--td-spacer: 16rpx` = 8px@375），与本项目 `designWidth: 375` + rpx 完全同基准 → **数值可 1:1 直接比较，无需换算**。
> **项目侧实测**：34 个 `*.scss`，`rgba(` 88 处、除 variables.scss 外硬编码 hex 46 处（其中 23 处在死文件 `src/styles/theme.scss`）、`1rpx solid` 边框 31 处、`border-radius: 50%` 15 处、`z-index` 9 处。

---

## ✅ 执行状态（2026-10-24 已落地）

P0 + P1 已全部实施，共改 **13 个 scss**、`variables.scss` 从 239 行扩到 **337 行**，构建 `Compiled successfully`，且**编译产物数值与改前逐条比对一致**（阴影 `rgba(47,93,58,.08)`、金描边 `rgba(185,142,78,.12/.14)`、`z-index` 1/2/50/100/1000、`border-radius:50%` × 15 全部原值输出）。

| 项 | 改前 | 改后 |
| --- | --- | --- |
| 硬编码 hex（variables.scss 外） | 46 处 | **23 处，且全部在死文件 `theme.scss`**（无 git 兜底，未删） |
| 字面量 `rgba(R,G,B,a)` | 72 处 | **47 处**（剩余全是 `rgba(0,0,0,·)` / `rgba(255,255,255,·)` 中性透明度） |
| `z-index` 魔法数字 | 9 处 | **0**（→ `$z-base/raised/header/overlay/modal`） |
| `border-radius: 50%` | 15 处 | **0**（→ `$radius-circle`） |
| `$shadow-*` 写死 RGB 分量 | 4/5 个 | **0**（→ `rgba($color-primary-dark, ·)` / `rgba($color-ink, ·)` / `rgba($color-accent, ·)`） |
| 色板 | 主色 4 档 | **brand-1~10 + 功能色 light/active** |
| 字号行高绑定 | 无 | **`$leading-*` 7 档 + `text-caption`~`text-hero` 7 个 mixin** |

**页面层面的实际修正**（都是字面量→token，颜色含义不变）：

- `src/pages/task-detail/index.module.scss`：整页原用**冷灰体系**（`#eef1f5`/`#f2f4f7`/`#f0f2f5`），是「拼凑感」最大来源，现已全部回收到 `$color-bg-component` / `$color-border-light` / `$brand-1` / `$brand-2`。
- 3 个**旧调色板残留色**统一回竹墨绿：`rgba(91,140,90,·)`（旧主色 `#5B8C5A`，4 处）、`rgba(76,175,80,·)`（Material 绿，1 处）、橙色 `rgba(255,125,0,·)`（3 处 → `$color-warning`）。
- 价格/强调橙 `#e0792b`（2 处）→ `$color-warning`；`#8a6428` → `$color-accent-text`；`#e8f5e9` → `$brand-1`。
- 金描边 5 处字面量 → `$color-gold-line` / `$color-gold-line-strong`。

---


---

## 0. 一句话结论

项目在**品牌调性层已经反超 TDesign 默认**（国风渐变、金描边、绿调柔光阴影这三样 TDesign 根本没有），
缺口全部在**系统层**：

1. 色板只有离散 4 档，没有 ramp → 状态色只能手写 `rgba`；
2. 字号是孤立数字，**没有绑定行高** → 文字垂直节奏靠各页自己凑；
3. 没有发丝线（hairline）、没有 z-index 阶梯、没有 `50%` 圆角令牌；
4. `$shadow-*` 里写着硬编码 RGB 分量 → **改主色时阴影不跟随**（这是真 bug，不是口味问题）。

---

## 1. 逐项差异表

| # | 维度 | 项目现状 | TDesign v1.17.0 | 判定 | 建议动作 |
| --- | --- | --- | --- | --- | --- |
| 1 | **色板结构** | 主色 4 档（`primary` / `-light` / `-dark` / `-deep`）+ 金 3 档 + 功能色各 1 档 | 每个语义色 10 档 ramp：brand / warning / error / success 各 `1~10`，另加 `light` / `light-active` / `focus` / `active` / `disabled` 语义别名 | ❌ **最大缺口** | 补 brand 10 档（下方有现成色值）；功能色补 `-light` / `-active` 两档 |
| 2 | **灰阶** | 无独立灰阶，靠 `$color-border` / `$color-divider` / `$color-text-tertiary` 兼职 | `--td-gray-color-1~14` 共 14 档 | ⚠️ 中性 | 不必补 14 档；但**缺 2~3 档中间灰**用于「弱化态」「骨架屏」 |
| 3 | **字号阶梯** | 7 档：22 / 24 / 28 / 32 / 36 / 44 / 56 | 按「角色 × 尺寸」组织：body 20/24/28/32、title 28/32/36/40、headline 48/56/72、display 96/128 | ⚠️ 缺层级 | 补 20（注释/角标）、40（区块标题）、48（页面大标题）；`22` 与 `44` **不在阶上**，建议并到 20 / 40 |
| 4 | **行高** | 3 个倍数：1.3 / 1.5 / 1.8 | **每个字号绑定专属行高**：body-s 24/40、body-m 28/44、body-l 32/48、title-m 32/48、title-l 36/52、headline-m 56/72… | ❌ **第二大缺口** | 至少给 4 个核心字号做成 `$text-*` 复合令牌（字号+行高一体） |
| 5 | **字重** | 400 / 500 / 600 / 700 | 只有 400 与 500（medium 走独立 `--td-font-family-medium`） | ✅ 项目更细，保留 | 不动 |
| 6 | **字体家族** | 仅 `src/app.scss:8` 一处全局栈，无令牌 | `--td-font-family` + `-medium` 变体 + 13 个复合 `font` shorthand | ⚠️ 可移植性 | 抽 `$font-family-base` / `$font-family-number` 进 variables.scss（数字统计用等宽更整齐） |
| 7 | **间距** | 8 / 16 / 24 / 32 / 48 / 64（base 8rpx，6 档） | 16 / 24 / 32 / 48 / 64 / 96 / 160（base 16rpx，7 档） | ⚠️ 缺大间距 | 补 `96`（区块）、`160`（章节）；8rpx 是项目优势，保留 |
| 8 | **圆角** | 6 / 12 / 16 / 24 / 32 / 999 / 999 | 6 / 12 / 18 / 24 / 999px + `50%` | ⚠️ 微差 + 缺项 | `16`→`18` 消除 2rpx 无意义差；补 `$radius-circle: 50%`（现散落 15 处手写）；`$radius-button` 与 `$radius-round` 重复，合并留别名 |
| 9 | **阴影** | 5 个单层、绿调 rgba：`card` / `card-hover` / `float` / `popup` / `glow` | 4 档**三层叠加**（`shadow-1/2/3` 各由 3 个方向的阴影拼成）+ `shadow-4` 单层 + 4 个 `inset` 发丝线 | ⚠️ 各有取舍 | **别换成纯黑多层**（会压垮米白底）；但必须把 `rgba(47,93,58,…)` 改成 `rgba($color-primary-dark, …)` |
| 10 | **发丝线** | 靠 `border: 1rpx solid`（31 处） | `--td-shadow-inset-{top,right,bottom,left}: inset 0 ±0.5px 0 #dcdcdc` | ❌ 缺 | 补 `$hairline-bottom: inset 0 -1rpx 0 $color-border-light`，比 border 更贴边、不占盒模型 |
| 11 | **透明度色** | `rgba(` 88 处手写（variables.scss 内 11 处，页面散落 77 处） | 预置 `font-white-1~4`、`font-gray-1~4`、`mask-active/disabled/background` | ❌ 缺 | 补 `$color-white-{55,35,22}`、`$color-ink-{90,60,40,26}`、`$color-mask` 三档 |
| 12 | **层级 z-index** | 实测散落 `1 / 1 / 2 / 2 / 50 / 100 / 100 / 1000`（9 处），无令牌 | 同样无令牌（组件内写死） | ⚠️ 双方都缺 | 自建 `$z-base:1 / $z-sticky:10 / $z-drawer:100 / $z-mask:900 / $z-modal:1000 / $z-toast:1100` |
| 13 | **动效 token** | `$dur-fast/base/slow` + `$ease-out` / `$ease-out-back` | 本版本**未暴露** duration / easing 令牌（组件内部写死） | ✅ **项目更强** | 保持，别为了「对齐 TDesign」删掉 |
| 14 | **组件级语义色** | `$color-bg-section` / `$color-border` / `$color-bg-hover` 近似覆盖 | `bg-color-container` / `secondarycontainer` / `component` / `component-stroke` / `component-border` 五层 | ⚠️ 少两层 | 补 `$color-bg-component`（控件底，如输入框/分段槽）这一档即可 |

---

## 2. 对比度审计（WCAG 2.1，实测计算）

| 前景 / 背景 | 比值 | 判定 | 说明 |
| --- | --- | --- | --- |
| `#1F2A24` on `#F6F2E9`（正文） | **13.28** | AAA | 优秀 |
| `#4A564E` on `#F6F2E9`（次要） | **6.88** | AA | 合格 |
| `#8A938C` on `#F6F2E9`（三级） | **2.83** | ❌ FAIL | **全仓库引用 73 处**，是当前最普遍的可用性缺陷 |
| `#C9CDD4` on `#F6F2E9`（禁用） | 1.43 | — | 禁用态可接受，但**冷灰与暖米白底不协调** |
| `#FFFFFF` on `#4A7C59`（主绿按钮） | **4.86** | AA | 合格，可继续用于按钮文字 |
| `#FFFFFF` on `#B98E4E`（暖金） | **2.98** | ❌ FAIL | 现在只用于装饰条，**尚未踩到**；一旦做「金色按钮 + 白字」就不可读 |
| `#B98E4E` on `#F6F2E9`（金当文字） | **2.67** | ❌ FAIL | 金色**不能当小号文字色**，只能做描边/底色/18rpx 以上粗体 |
| `#4A7C59` on `#F6F2E9`（绿当文字） | 4.35 | ⚠️ 接近 | 正文不达标，≥32rpx 或粗体时可用 |
| `#8A938C` on `#FFFFFF`（三级 / 白卡） | 3.17 | ❌ FAIL | 白卡上的说明文字同样偏浅 |

**结论**：`$color-text-tertiary` 需要一个更深的替代值用于「真正需要读的说明文字」，浅灰留给「装饰性小字」。

---

## 3. 修复优先级

### P0（会咬人的）— ✅ 全部完成

- [x] **`$shadow-*` 去硬编码**：改为 `rgba($color-primary-dark, ·)` / `rgba($color-ink, ·)` / `rgba($color-accent, ·)`，5 个阴影全部跟随主色。
- [x] **金描边去硬编码**：新增 `$color-gold-line: rgba($color-accent, 0.12)` 与 `$color-gold-line-strong: … 0.14`，`tea-card` mixin 与 home/study 共 5 处字面量已替换。
- [x] **`pages/task-detail/index.module.scss` 13 处硬编码 hex** 已清零（整页冷灰体系回暖，见上方执行状态）。`theme.scss` 23 处仍在——那是死文件，**本目录无 git 兜底，故未删除**，建议确认后手动 `rm src/styles/theme.scss`。
- [x] **三级文字**：`$color-text-tertiary` 已从 `#8A938C`（2.83:1）加深到 `#66716A`（米底 **4.55:1** / 白卡 **5.08:1**）；金色文字由新增 `$color-accent-text: #8A6631` 承担（白卡 **5.22:1** / 米底 **4.67:1**）。

> 说明：原计划的 `$color-text-tertiary-strong` 没有采用「再加一档」的写法——直接把 tertiary 这一档本身提到达标，避免出现「同名同义两档、页面选错」的新问题。

### P1（结构性的）— ✅ 全部完成

- [x] brand 10 档 ramp（`$brand-1~10`，`$brand-7` 直接引用 `$color-primary` 保证同步）+ 功能色 `light` / `active`（success / warning / error / info 各 3 档）。
- [x] 字号绑行高：采用 **`$leading-caption…$leading-hero` 7 档 rpx 绝对值 + 7 个复合 mixin**（`text-caption` / `text-note` / `text-body` / `text-emphasis` / `text-title` / `text-heading` / `text-hero`），页面一次 `@include` 即拿到成对的字号与行高。
- [x] `$radius-circle: 50%`（15 处手写已替换）、`@mixin hairline-bottom/top`、`$z-base…$z-toast` 8 档（9 处魔法数字已替换）、`$color-mask`、`$color-bg-component`。
- [x] `$spacing-xxxl: 96rpx` / `$spacing-huge: 160rpx`。

### P2（口味与一致性）— ⬜ 未动，均匀性小账

- [ ] `$radius-md: 16rpx` → `18rpx`（会轻微改变所有卡片圆角，需真机看一眼再定）。
- [ ] `$color-text-disabled: #C9CDD4` 是冷灰，在暖米白底上显脏 → 换暖灰（实测 `#B8B0A0`≈1.93:1、`#C6BFB1` 与之接近，**禁用态不需要过对比度**，只需同明度换色相）。
- [ ] 字号 `22` → `20`、`44` → `40`（回到 8rpx 的 2.5 倍网格）——会牵动 7 个 mixin 的配对值，建议与 `$leading-*` 一起改。
- [ ] 剩余 47 处中性透明度（`rgba(0,0,0,·)` / `rgba(255,255,255,·)`）可收成 `$color-overlay-*` / `$color-white-*` 两族令牌，收益有限，属锦上添花。


---

## 4. 可直接粘贴的片段

### 4.1 竹墨绿 brand ramp（h=137°, s=26%，与现有 `#4A7C59` 对齐）

```scss
// 竹墨绿 10 档色阶（step 7 = 现有主色，逐级加深/减淡，用于状态、浅底、强描边）
$brand-1:  #F2F7F4; // 极浅底：选中行、tag 底
$brand-2:  #E2EEE5; // 浅底：卡片强调底、进度槽
$brand-3:  #C8DFCF; // 描边/分割：轻分隔线
$brand-4:  #ABCEB5; // 弱强调：图表次级
$brand-5:  #8BBB99; // 图表主色
$brand-6:  #68A67A; // hover / 高亮边
$brand-7:  #4A7C59; // ← 主色 = $color-primary
$brand-8:  #396044; // active / 按下
$brand-9:  #284330; // 深底、hero 底部
$brand-10: #1A2D20; // 墨底
```

### 4.2 功能色状态档

```scss
$color-success-light: #EAF6F1;  $color-success-active: #23865D;
$color-warning-light: #FCF1E8;  $color-warning-active: #BA5E14;
$color-error-light:   #FCECEC;  $color-error-active:   #BC3939;
```

### 4.3 阴影改用变量（P0）

```scss
$shadow-card:       0 6rpx 20rpx rgba($color-primary-dark, 0.08);
$shadow-card-hover: 0 12rpx 32rpx rgba($color-primary-dark, 0.14);
$shadow-float:      0 10rpx 28rpx rgba($color-primary-dark, 0.12);
$shadow-popup:      0 16rpx 48rpx rgba($color-ink, 0.22);
$shadow-glow:       0 8rpx 28rpx rgba($color-accent, 0.22);
$hairline-bottom:   inset 0 -1rpx 0 $color-border-light;
$color-gold-line:   rgba($color-accent, 0.14);
```

### 4.4 层级阶梯

```scss
$z-base: 1;
$z-sticky: 10;
$z-drawer: 100;
$z-mask: 900;
$z-modal: 1000;   // npc-chat 现为 1000，可直接接上
$z-toast: 1100;
```

---

## 5. 不建议照搬 TDesign 的部分

| TDesign 做法 | 为什么不抄 |
| --- | --- |
| 文字色用 `rgba(0,0,0,0.9/0.6/0.4/0.26)` | 中性黑在暖米白底上会发灰发脏；本项目的墨绿系文字色是「国风」的一部分，改成纯黑会掉档 |
| 阴影 `shadow-1/2/3` 全黑三层叠加 | 适合纯白 B 端界面；本项目要的是茶文化的柔光，绿调单层更像宣纸上的漫射光 |
| `--td-radius-round: 999px` | 与 `999rpx` 视觉等价（rpx 换算后远超任何元素尺寸），换过去零收益 |
| 14 档灰阶 | 小程序页面层级远少于后台系统，语义化的 `border` / `divider` / `bg-section` 更好维护 |
| 组件级 5 层容器色 | 只有 `bg-color-component`（控件底）这一层是真正缺的，其余项目已有近似 |

---

## 6. 附：TDesign 原始令牌（备查）

**Spacer**（base 16rpx）：`16 / 24 / 32 / 48 / 64 / 96 / 160`

**Radius**：`small 6` / `default 12` / `large 18` / `extraLarge 24` / `round 999px` / `circle 50%`

**Font-size / line-height 配对**（rpx）：
`body-extraSmall 20/32` · `body-small 24/40` · `body-medium 28/44` · `body-large 32/48`
`title-small 28/44` · `title-medium 32/48` · `title-large 36/52` · `title-extraLarge 40/56`
`headline-small 48/64` · `headline-medium 56/72` · `headline-large 72/88`
`display-medium 96/112` · `display-large 128/144`
`mark-extraSmall 20/32` · `mark-small 24/40` · `mark-medium 28/44` · `mark-large 32/48`（mark = 强调内联文本）
`link-small 24/40` · `link-medium 28/44` · `link-large 32/48`

**Shadow**：
`shadow-1: 0 1px 10px rgba(0,0,0,.05), 0 4px 5px rgba(0,0,0,.08), 0 2px 4px -1px rgba(0,0,0,.12)`
`shadow-2: 0 3px 14px 2px rgba(0,0,0,.05), 0 8px 10px 1px rgba(0,0,0,.06), 0 5px 5px -3px rgba(0,0,0,.1)`
`shadow-3: 0 6px 30px 5px rgba(0,0,0,.05), 0 16px 24px 2px rgba(0,0,0,.04), 0 8px 10px -5px rgba(0,0,0,.08)`
`shadow-4: 0 2px 8px 0 rgba(0,0,0,.06)`
`inset-top/right/bottom/left: inset 0 ±0.5px 0 #dcdcdc`

**文字/蒙层**：`font-white-1 #fff` · `-2 rgba(255,255,255,.55)` · `-3 .35` · `-4 .22`
`font-gray-1 rgba(0,0,0,.9)` · `-2 .6` · `-3 .4` · `-4 .26`
`mask-active rgba(0,0,0,.6)` · `mask-disabled rgba(255,255,255,.6)` · `mask-background rgba(255,255,255,.96)`
