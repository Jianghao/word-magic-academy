# CLAUDE.md — 单词魔法学院

Rainbow（9岁女孩，四年级）专属英语单词记忆系统。

## 项目概述

多页面英语单词记忆网站，每个词库配有 AI 生成的学习海报。支持浏览、闪卡、测验、拼写四种学习模式。

## 技术栈

- 纯 HTML/CSS/JS，零依赖，多页面架构
- `shared.js` 共享状态管理（localStorage 跨页面同步学习进度）
- CSS 3D Transform 翻转卡片
- Web Speech API 发音
- **gpt-image-2 skill（Zenmux API）** — 主力 AI 海报工具
- HiAPI MCP — 备选 AI 图像通道
- Google Fonts: ZCOOL KuaiLe（标题）+ Noto Sans SC（正文）

## 文件结构

```
english/
├── index.html           # 仪表盘主页
├── months.html          # 📅 月份单词学习页（示例词库）
├── vocabulary.html      # 📋 完整词汇表索引
├── shared.js            # 共享状态管理模块
├── words.json           # 词汇主数据库（独立JSON）
├── images/
│   └── posters/         # AI 生成的词库单词海报
│       └── months.png
└── CLAUDE.md            # 本文件
```

## 页面说明

### index.html — 仪表盘
- `Hi, Rainbow!` 个性化欢迎语（彩虹渐变色名字）
- 学习统计概览：词库数、单词数、已掌握、连续天数、XP
- 词库卡片网格（进度条 + 掌握数 + 开始学习按钮）
- 📋 查看完整词汇表 → vocabulary.html
- 学习进度通过 `shared.js` 跨页面自动同步

### months.html — 月份学习页
- **左侧栏**：12 个单词卡片，按冬/春/夏/秋四季分组，支持搜索
- **主内容区**：四种学习模式
- **浏览模式**：55% 单词详情 + 45% AI 海报，按比例动态适配
- **自动朗读**：切换单词 → 自动发音（Web Speech API），顶栏 `🔊/🔇` 按钮开关，状态存 localStorage `word_academy_autoread`
- 返回主页 + URL hash 定位：`months.html#december`
- 支持 4K 大屏（字号 + 容器按断点自动放大）
- **EXTRA 查找表**：常用搭配/相关词汇/易错提醒通过独立 `const EXTRA = {}` 对象注入，避免修改 WORDS 数组导致数据损坏

### vocabulary.html — 词汇表
- 所有单词的完整索引：状态 + emoji + 单词 + 音标 + 中文 + 来源词库
- 三种排序：🔤 A-Z（按首字母分组）/ 📅 按时间 / 🏷️ 按主题
- 点击单词 → 跳转到学习页并定位（URL hash）

### shared.js — 共享模块
- `loadState()`, `saveState()` — localStorage 读写
- `getWordStatus()`, `addXP()`, `markMastered()` — 学习状态管理
- `updateStreak()`, `checkAchievements()` — 连续天数和成就
- `pronounce()` — Web Speech API 发音
- `showToast()` — 消息提示
- 常量：`STORAGE_KEY`, `ACHIEVEMENTS`, `COLLECTIONS_META`

## 浏览模式布局规范

### 宽屏（≥1200px）：55:45 横向两栏，海报在右

```
┌──────────────────────────────────────────────┐
│  ┌──────────────────────┐  ┌──────────────┐ │
│  │ ❄️ January           │  │              │ │
│  │ 名词 · 一月           │  │   AI 海报    │ │
│  │ Jan·u·ar·y  /dʒæn/ 🔊│  │   (3:4 竖版) │ │
│  │                      │  │              │ │
│  │ 📝 例句 ×2           │  │              │ │
│  │ 📖 Story             │  │              │ │
│  │ ✨ Magic (🔤+🔊)     │  │              │ │
│  │ [⬅][✅][🃏][➡]      │  │              │ │
│  └──────────────────────┘  └──────────────┘ │
│       ← 55% →                  ← 45% →      │
└──────────────────────────────────────────────┘
```

- 左 55%：单词详情（flex: 0 0 55%），无固定宽度
- 右 45%：AI 海报缩略图（flex: 0 0 45%），无固定宽度
- 比例动态适配任何屏幕分辨率

### 中屏（900-1199px）：上下堆叠，海报在顶部

### 窄屏（<900px）：海报隐藏，纯文字模式 + 汉堡菜单

## 单词详情内容层次

```
❄️ January                          ← emoji + 英文 (大号)
名词 · 一月                          ← 词性 · 中文
Jan · u · ar · y  /dʒæn/ 🔊        ← 彩色音节拆分 + 音标 + 发音图标
───────────────────────────────────
📝 例句 ×2                          ← 英文例句 (目标词高亮) + 中文翻译
───────────────────────────────────
📖 Story                             ← 词源故事 (单列)
✨ Magic                             ← 🔤 拆解拼写 + 🔊 发音诀窍 (单列)
───────────────────────────────────
常用搭配 | in January  |  January 1st
相关词汇 | month, year, winter
易错提醒 | January - 不要漏掉 u
[⬅ 上一个] [✅ 学会了] [🃏 闪卡] [下一个 ➡]
```

- 各区块间距紧凑：browse-left gap 10-16px，例句间 6px，Story/Magic 间 8px
- 段落间距通过 clamp() 动态缩放，随视口等比例变化

## 单词数据结构

```javascript
{
  id: 'january',
  word: 'January',
  phonetic: "/'dʒæn.ju.er.i/",
  chinese: '一月',
  emoji: '❄️',
  pos: '名词',
  season: 'winter',              // winter | spring | summer | autumn
  heroGradient: ['#C9E4F7','#E8F2FA'],
  syllables: [                    // 彩色音节拆解
    { text: 'Jan', hint: 'Janus神' },
    { text: 'u', hint: '' },
    { text: 'ar', hint: '' },
    { text: 'y', hint: '' }
  ],
  sentences: [                    // 2条精选例句
    { en: "<span class='hl'>January</span> is...", zh: "一月是..." }
  ],
  memory: [                       // 3条记忆技巧
    { icon: '🔤', text: '...' },  // 拆解拼写 → 归入 ✨ Magic
    { icon: '🔊', text: '...' },  // 发音诀窍 → 归入 ✨ Magic
    { icon: '📖', text: '...' }   // 词源故事 → 归入 📖 Story
  ],
  // 以下字段待加入：
  collocations: ["in January","January 1st"],  // 常用搭配
  related: "month, year, winter, New Year",    // 相关词汇
  pitfall: "Jan<b>u</b>ary - 不要漏掉 u"       // 易错提醒
}
```

## 记忆体系

| 区块 | 图标 | 内容 | 说明 |
|------|------|------|------|
| 📖 Story | 📖 | 词源故事 | 罗马神/皇帝命名、数字前缀秘密、单词的"前世今生" |
| ✨ Magic | 🔤 | 拆解拼写 | 按音节/词根拆分，彩色标注，每段含词根提示 |
| ✨ Magic | 🔊 | 发音诀窍 | 重音位置、元音发音要点、类似音对比 |

- 单列展示，不分栏，行距 1.7
- Memory text 经过 `simplify()` 截取核心句（≤100 字）
- Story 和 Magic 各用一个独立区块，用小标题分隔

## AI 单词海报规范

| 参数 | 值 |
|------|-----|
| 工具 | **gpt-image-2 skill（Zenmux API）** |
| 备选 | HiAPI MCP |
| 模型 | `gpt-image-2/text-to-image` |
| 质量 | **high** |
| 比例 | **3:4** 竖版（≈ A4 210×297mm） |
| 分辨率 | **2K**（≈1728×2304px，~4MP） |
| 格式 | PNG |
| 预估大小 | 2-6 MB |
| A4 打印 | ≈208 DPI |
| 每张上限 | ≤16 个单词，超出分多页 |
| 存储 | `images/posters/[collection-id].png` |

### 选择 2K 而非 4K 的原因
- 生成快 ~2 倍，文件小一半（2-4 vs 5-8 MB）
- A4 打印 208 DPI 肉眼几乎看不出与 300 DPI 差异
- 4K（2448×3264/8MP）仅作备选

### 设计原则
1. **一张图包含全部单词**：AI 直接排版，图文并茂
2. **英文为主、中文为辅**：英文粗黑大字，中文灰色小字
3. **按主题分组**：月份按四季四格，每个词配小插画
4. **儿童绘本风**：暖色马卡龙、软萌画风、留白适当
5. **每张海报风格独特不重复**

## 配色系统

```css
/* 品牌色 */
--coral: #E8725A;   /* 主按钮、强调 */
--gold: #F4C542;    /* 记忆卡片、成就 */
--teal: #3DA5A5;    /* 发音播放中 */
--sky: #5B9EED;     /* quiz hover */

/* 季节色（卡片边框、分组标题） */
--cat-winter: #6B9AC4;   /* 冬蓝 */
--cat-spring: #7BAE7F;   /* 春绿 */
--cat-summer: #E8725A;   /* 夏橙 */
--cat-autumn: #D4914A;   /* 秋棕 */

/* 音节标签色 */
#E8725A, #5B9EED, #7BAE7F, #9B7EC4, #F4A542

/* 表面与文字 */
--bg: #FFF8F0; --card: #FFFDF7;
--text: #3D2C2C; --text-light: #7A6A6A; --text-muted: #B5A5A5;

/* 状态色 */
--mastered: #4ECB71; --learning-status: #F4C542; --new: #DDD;
```

## 4K 大屏适配

三级断点，递增基础字号 + 放宽容器宽度：

| 断点 | 字号 | 效果 |
|------|------|------|
| ≥1800px | 20px | 容器加宽 |
| ≥2500px | 23px | 卡片/按钮进一步放大 |
| ≥3500px | 26px | 全站等比例放大 |

- 侧栏宽度同步缩放（260 → 300 → 320 → 360px）
- 浏览模式 55:45 始终保持比例，无固定 px 宽度
- 所有字号使用 `clamp()` 平滑过渡

## 响应式断点

| 宽度 | 布局 |
|------|------|
| >1200px | 三栏 / 两栏 55:45 |
| 900-1199px | 两栏上下堆叠 / 海报缩小 |
| <900px | 单栏，侧栏变抽屉，海报隐藏 |
| <600px | 15px 字号，单列测验选项 |

## 状态持久化

localStorage key: `word_academy_v3`

```javascript
{
  words: { [id]: { status: 'new'|'learning'|'mastered', xp: 0 } },
  stats: { totalXP: 0, streak: 0, lastStudyDate: '' },
  achievements: ['first','three','six','all12','streak3','streak7','xp200']
}
```

额外 key: `word_academy_autoread` (`"true"`|`"false"`) — 自动朗读开关状态

## EXTRA 查找表模式

为防止直接修改 WORDS 数组导致数据损坏（括号/逗号错位），常用搭配、相关词汇、易错提醒等扩展字段放在独立的 `const EXTRA = {}` 对象中，按单词 id 索引：

```javascript
const EXTRA = {
  january: {
    collocations: ["in January","January 1st","last January"],
    related: "month, year, winter, New Year",
    pitfall: "Jan<b>u</b>ary - 不要漏掉中间的 u！四拍一个不能少"
  },
  // ...
};
```

`renderBrowse()` 中通过 `EXTRA[w.id]` 动态注入，有则显示、无则跳过。添加新词库时同样用此模式，不要直接编辑 WORDS 数组。

## 添加新词库

1. 在 `words.json` 的 `collections[]` 中添加新词库及其单词
2. 创建对应学习页（如 `animals.html`），参考 `months.html`：
   - 内联 WORDS 数组（含完整字段）
   - 标准 topbar + 侧栏 + 四种模式
   - 浏览模式嵌入 `images/posters/[id].png`
   - 支持 URL hash 定位
3. 在 `vocabulary.html` 的 `ALL_WORDS` 添加新单词索引
4. 在 `shared.js` 的 `COLLECTIONS_META` 注册新词库
5. **用 gpt-image-2 skill 生成海报**（2K, 3:4, high）
6. `index.html` 仪表盘自动显示新词库卡片
