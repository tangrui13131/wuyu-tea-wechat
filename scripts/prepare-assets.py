#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
素材规范化 / 压缩脚本（一次性工具，不参与小程序构建）

输入：E:/大创/chashan-frontend (2)/资产/**  （AI 生成的原图，实为 JPEG，扩展名误标 .png）
输出：本项目 src/assets/images/**           （规范命名的 jpg/png，体积受控）

做四件事：
1. 改名：中文/空格/语义化 → 全小写英文 kebab
2. 缩放 + 重编码：按用途定尺寸与质量（主包上限 2MB，见 AGENTS.md §9）
3. tabBar 图标：从白底线稿提取 alpha，染色成未选中/选中两态（81×81 PNG）
4. 徽章与 Logo：圆形 alpha 裁切（原图是奶油底，页面底色也是米白，裁圆后无痕）

体积策略（2026-10 二次收紧，主包余量曾只剩 400KB）：
- 卡片/列表缩略图按「渲染宽度 × 1.1」出图就够，手机屏不需要 480px 以上
- 质量统一压到 50~60，渐变/大面积色块仍干净，成本是暗部细节
- 全部图片都进主包（Taro 不按分包拆分静态资源），所以只能靠压尺寸控体积

用法：python scripts/prepare-assets.py [--dry]
"""
import os
import sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.normpath(os.path.join(ROOT, '..', '资产'))
DST = os.path.join(ROOT, 'src', 'assets', 'images')
TABBAR_DST = os.path.join(ROOT, 'src', 'assets', 'tabbar')

# ── 尺寸与质量 ────────────────────────────────────────────────
# 4:3：景点、课程、关卡、溯源、品质报告（渲染宽度 ≤360px）
W4K, H4K, Q4K = 420, 315, 52
# 16:9：路线封面、研学主题封面（卡片通栏，渲染宽度 ≈335px）
W16K, H16K, Q16K = 440, 248, 50
# 1:1：商品图（九宫格，渲染宽度 ≈160px）
W11, Q11 = 340, 58
# 空态插画（半屏，渲染宽度 ≈240px）
WEMPTY, QEMPTY = 300, 60
# NPC 头像（圆形 96rpx ≈ 48px，给到 180px 足够 3 倍屏）
WAV, QAV = 180, 72
# NPC 立绘（对话页/详情头部，渲染宽度 ≈200px）
WPOR, HPOR, QPOR = 320, 427, 60

GREY = (134, 144, 156)     # #86909C 未选中
GREEN = (74, 124, 89)      # #4A7C59 选中

# (源相对路径, 目标相对路径) —— 4:3
JOBS_4_3 = [
    ('scenes/01-chayuan', 'scenes/tea-garden'),
    ('scenes/02-baichashu', 'scenes/white-tea-tree'),
    ('scenes/03-zhizuo', 'scenes/tea-workshop'),
    ('scenes/04-shuangquansi', 'scenes/shuangquan-temple'),
    ('scenes/05-hongse', 'scenes/red-memorial'),
    ('scenes/06-chakuang', 'scenes/tea-basket'),
    ('study-courses/01-caicha', 'courses/01-picking'),
    ('study-courses/02-zhizuo', 'courses/02-processing'),
    ('study-courses/03-diancha', 'courses/03-tea-ceremony'),
    ('study-courses/04-chakuang-hongse', 'courses/04-red-basket'),
    ('study-courses/05-ziran-guancha', 'courses/05-nature'),
    ('levels/01-wenduji', 'levels/01-temperature'),
    ('levels/02-pinxiang', 'levels/02-aroma'),
    ('levels/03-caicha-jiyi', 'levels/03-picking'),
    ('levels/04-xunzhengji', 'levels/04-relics'),
    ('traceability/01-hexin-chayuan', 'trace/core-garden'),
    ('traceability/02-shengtai', 'trace/eco-garden'),
    ('traceability/03-jiagong-zhijian', 'trace/workshop'),
    ('quality/02-jiance-baogao', 'quality/report'),
]

JOBS_16_9 = [
    ('route-covers/01-banri', 'covers/route-halfday'),
    ('route-covers/02-yiri', 'covers/route-oneday'),
    ('route-covers/03-shendu', 'covers/route-culture'),
    ('study-themes/01-cha wenhua', 'covers/theme-tea'),
    ('study-themes/02-nonggeng', 'covers/theme-farming'),
    ('study-themes/03-hongse', 'covers/theme-red'),
]

JOBS_1_1 = [
    ('products/01-mingqian-lihe', 'products/01-mingqian-gift'),
    ('products/02-fuxi-kouliang', 'products/02-fuxi-daily'),
    ('products/03-baiye-banshou', 'products/03-fairy-gift'),
    ('products/04-yanxue-jinian', 'products/04-study-souvenir'),
    ('products/05-hongjun-chakuang', 'products/05-red-basket'),
    ('products/06-chashan-fengmi', 'products/06-honey'),
    ('quality/01-sayang-duibi', 'quality/samples'),
]

# 空态插画（1:1，尺寸更小）
JOBS_EMPTY = [
    ('states/01-kongzhuangtai', 'states/empty'),
    ('states/02-offline', 'states/offline'),
]

JOBS_AVATAR = [
    ('npc/baixian-avatar', 'npc/fairy-avatar'),
    ('npc/laonong-avatar', 'npc/farmer-avatar'),
    ('npc/hongjun-avatar', 'npc/soldier-avatar'),
]

JOBS_PORTRAIT = [
    ('npc/baixian-lihui', 'npc/fairy-portrait'),
    ('npc/laonong-lihui', 'npc/farmer-portrait'),
    ('npc/hongjun-lihui', 'npc/soldier-portrait'),
]

TABBAR = [
    ('tabbar-icons/home', 'home'),
    ('tabbar-icons/npc', 'npc'),
    ('tabbar-icons/study', 'study'),
    ('tabbar-icons/quality', 'quality'),
    ('tabbar-icons/me', 'mine'),
]

DRY = '--dry' in sys.argv
written = []


def save_jpg(src, dst, w, h, q):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = Image.open(src).convert('RGB')
    im = im.resize((w, h), Image.LANCZOS)
    if not DRY:
        im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True)
    written.append(dst)
    return dst


def tabbar_icon(src, dst, color):
    """白底线稿 → 透明底单色图标：alpha 取反亮度，RGB 统一染色"""
    im = Image.open(src).convert('L').resize((81, 81), Image.LANCZOS)
    px = im.load()
    out = Image.new('RGBA', (81, 81), (0, 0, 0, 0))
    opx = out.load()
    for y in range(81):
        for x in range(81):
            lum = px[x, y]
            a = int(max(0, min(255, (255 - lum) * 1.15)))  # 白→透明，线条→不透明
            if a:
                opx[x, y] = (color[0], color[1], color[2], a)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not DRY:
        out.save(dst, 'PNG', optimize=True)
    written.append(dst)


def circular_png(src, dst, size):
    """圆形 alpha 裁切（用于徽章、Logo）"""
    im = Image.open(src).convert('RGBA')
    s = min(im.size)
    left = (im.width - s) // 2
    top = (im.height - s) // 2
    im = im.crop((left, top, left + s, top + s)).resize((size, size), Image.LANCZOS)

    ss = 4  # 超采样遮罩，边缘更干净
    mask = Image.new('L', (size * ss, size * ss), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(mask).ellipse((0, 0, size * ss - 1, size * ss - 1), fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    im.putalpha(mask)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not DRY:
        im.save(dst, 'PNG', optimize=True)
    written.append(dst)


def main():
    print('源目录:', SRC)
    print('输出  :', DST)
    if not os.path.isdir(SRC):
        sys.exit('源目录不存在: %s' % SRC)

    def src_of(rel):
        return os.path.join(SRC, rel + '.png')  # 扩展名实为 .png（内容 JPEG）

    for rel, out in JOBS_4_3:
        save_jpg(src_of(rel), os.path.join(DST, out + '.jpg'), W4K, H4K, Q4K)
    for rel, out in JOBS_16_9:
        save_jpg(src_of(rel), os.path.join(DST, out + '.jpg'), W16K, H16K, Q16K)
    for rel, out in JOBS_1_1:
        save_jpg(src_of(rel), os.path.join(DST, out + '.jpg'), W11, W11, Q11)
    for rel, out in JOBS_EMPTY:
        save_jpg(src_of(rel), os.path.join(DST, out + '.jpg'), WEMPTY, WEMPTY, QEMPTY)
    for rel, out in JOBS_AVATAR:
        save_jpg(src_of(rel), os.path.join(DST, out + '.jpg'), WAV, WAV, QAV)
    for rel, out in JOBS_PORTRAIT:
        save_jpg(src_of(rel), os.path.join(DST, out + '.jpg'), WPOR, HPOR, QPOR)

    for rel, name in TABBAR:
        tabbar_icon(src_of(rel), os.path.join(TABBAR_DST, name + '.png'), GREY)
        tabbar_icon(src_of(rel), os.path.join(TABBAR_DST, name + '-active.png'), GREEN)

    circular_png(src_of('states/03-jieshu-badge'), os.path.join(DST, 'states/badge.png'), 160)
    circular_png(src_of('brand/logo'), os.path.join(DST, 'brand/logo.png'), 160)

    print()
    if DRY:
        print('DRY RUN，共 %d 个任务' % len(written))
        return

    total = 0
    rows = []
    for root, _, files in os.walk(DST):
        for f in files:
            p = os.path.join(root, f)
            sz = os.path.getsize(p)
            total += sz
            rows.append((sz, os.path.relpath(p, DST).replace('\\', '/')))
    print('共写出 %d 个文件，合计 %.2f MB（%d KB）' % (len(written), total / 1024 / 1024, total / 1024))
    rows.sort(reverse=True)
    print('\n最大的 8 个：')
    for sz, rel in rows[:8]:
        print('  %6.1fKB  %s' % (sz / 1024, rel))


if __name__ == '__main__':
    main()
