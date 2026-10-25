# 槎山智慧文旅小程序（前端）

湖北孝感安陆「槎山白茶」景区文旅小程序 —— Taro 4 + React 18 + TypeScript + Sass（CSS Modules），目标端微信小程序（`weapp`）。

> 详细的项目说明、架构约定与踩坑记录在 [AGENTS.md](AGENTS.md)，改代码前请先读。

---

## 快速开始

### 只想跑起来看效果（不需要 Node）

**本仓库已包含构建好的 `dist/`。** 下载 ZIP 解压后：

> 微信开发者工具 → 导入项目 → 目录选**解压出来的仓库根目录**（不是 `dist/` 子目录）→ 填自己的 AppID 或选「测试号」→ 导入

`project.config.json` 里 `miniprogramRoot` 已经是 `dist/`，工具会自动去读它，**不需要装 Node、不需要构建**。

### 要改代码

改完源码必须重新构建，否则工具里看到的还是旧产物：

```bash
npm install          # 首次，Node ≥ 18（实测 v24）
npm run build:weapp  # 编译到 dist/（约 25 秒）
```

开发时用 watch 模式，改完源码在开发者工具里点「编译」：

```bash
npm run dev:weapp
```

> ⚠️ 提交代码前请先 `npm run build:weapp`，让 `dist/` 和源码保持同步，否则队友拉下来的产物会比你改的旧。

## 其他命令

| 命令 | 作用 |
| --- | --- |
| `npm run build:weapp` | 生产构建 → `dist/`（约 25 秒，1.8 MB） |
| `npm run dev:weapp` | 监听构建 → `dist/` |
| `npm run build:h5` | H5 构建（**会清空小程序 `dist/`，请改用下方隔离写法**） |
| `TARO_OUTPUT_DIR=dist_h5 npm run build:h5` | 构建 H5 到独立目录，不污染 `dist/` |

## 首次运行可能遇到的两件事

**1. 报「页面未注册 / 白屏」**

微信开发者工具的 **设置 → 通用 → 自动热重载** 必须关闭。Taro 每次构建会先清空再重建 `dist/`，热重载会在「半截产物」上编译，导致工具认定页面不存在且不自愈。`project.private.config.json` 里已置 `"compileHotReLoad": false`。

**2. 控制台红字 `webapi_getwxaasyncsecinfo:fail`**

当前 appid 是 `touristappid`（游客模式），这行是游客模式限制，**无害**。要真机验证登录/定位/语音插件需换成真实 appid。

## 后端

后端不在本仓库。默认请求 `http://127.0.0.1:3001`（`src/config/api.ts`），**没启动后端也能完整跑**：所有接口失败会自动降级到 `src/data/` 的本地 mock，首页顶部显示「离线演示数据」。

真机调试时把地址改成电脑局域网 IP，或运行时调用 `setBaseURL(url)`。

需要打开微信开发者工具的「不校验合法域名、web-view、TLS 版本以及 HTTPS 证书」。

## 目录速览

```
config/            Taro 构建配置
src/
  app.config.ts    页面注册（主包 13 页 + 研学 6 页分包）
  styles/          variables.scss ★ 唯一设计令牌源
  components/      Icon / Seal / Motif / Reveal 等 19 个组件
  pages/           主包页面
  subpackages/study/  研学分包
  services/        ★ 唯一服务层（页面只依赖它）
  data/            离线 mock 数据
  utils/           请求、存储、定位、状态机等
docs/              UI 改造与设计令牌文档
```

## 设计约定（详见 AGENTS.md §5）

- 颜色、字号、间距、圆角、阴影一律取自 `src/styles/variables.scss`，**禁止硬编码色值**。
- 图标统一用 `<Icon name="..." size={28} color="primary" />`，不要用 emoji；Icon 是块级元素，**不能放进 `<Text>`**。
- 卡片用「白底 + 1rpx 发丝线」，投影只留给真正浮起的层（`$shadow-float` / `$shadow-popup`）。
- 按钮两档：页面级 CTA 用胶囊 `$radius-button`，卡片内操作按钮用 `$radius-btn-card`；材质走 `@include paper-btn-sage` / `paper-btn-oat`。
