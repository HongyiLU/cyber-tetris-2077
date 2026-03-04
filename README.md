# 🎮 赛博方块 2077 | Cyber Tetris 2077

赛博朋克风格的俄罗斯方块游戏，使用 React + Canvas 构建。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

游戏将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

## 🎯 游戏特性

### 基础方块 (23 种)
- **经典 4 块**: I, O, T, S, Z, L, J
- **2 块**: DOM (多米诺)
- **3 块**: V3 (直线 3), COR (直角)
- **5 块**: X5 (十字), U5 (U 形), W5 (W 形), I5 (长条 5), P5 (方块 5)
- **特殊方块**: BOMB, ROW, COL, GRAVITY, RAINBOW, SLOWMO, STAR, VORTEX

### 游戏控制
- **← →** - 左右移动
- **↑** - 旋转
- **↓** - 加速下落
- **空格** - 直接落下
- **P** - 暂停/继续

### 分数系统
- 方块大小影响分数倍率
  - 2 块：0.5x
  - 3 块：0.8x
  - 4 块：1.0x
  - 5 块：1.5x

## 📁 项目结构

```
tetris-project/
├── src/
│   ├── components/       # React 组件
│   │   ├── GameCanvas.tsx
│   │   └── GameInfo.tsx
│   ├── config/           # 游戏配置
│   │   └── game-config.ts
│   ├── engine/           # 游戏引擎
│   │   └── GameEngine.ts
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Canvas API** - 游戏渲染
- **Vite** - 构建工具

## 📝 开发日志

### v1.3.0 (当前版本)
- ✅ 重构为 React + Canvas 架构
- ✅ 添加 8 种新方块（2 块、3 块、5 块）
- ✅ 分数倍率系统
- ✅ TypeScript 支持

### v1.2.0
- ✅ 8 种预设卡组
- ✅ 卡组保存/加载
- ✅ 卡牌升级系统
- ✅ 卡组推荐系统

### v1.1.0
- ✅ 新手教程
- ✅ 卡牌效果提示
- ✅ 音效系统

### v1.0.0
- ✅ 基准版本
- ✅ 10 个挑战关卡

## 📄 许可证

MIT License

## 👨‍💻 作者

月刊重巡派拉斯

---

**享受游戏！** 🎮✨
