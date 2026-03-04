# 赛博方块 2077 - 项目结构说明

## 📁 项目结构

```
tetris-project/
├── src/                        # 源代码目录
│   ├── components/             # React 组件
│   │   ├── common/             # 通用组件（按钮、输入框等）
│   │   ├── game/               # 游戏相关组件
│   │   │   ├── GameCanvas.tsx  # 游戏画布组件
│   │   │   ├── GameInfo.tsx    # 游戏信息面板组件
│   │   │   └── index.ts        # 组件导出
│   │   ├── ui/                 # UI 展示组件
│   │   └── index.ts            # 组件统一导出
│   │
│   ├── hooks/                  # 自定义 React Hooks
│   │   ├── useGameLoop.ts      # 游戏循环 Hook
│   │   ├── useKeyboardControl.ts # 键盘控制 Hook
│   │   └── index.ts            # Hooks 统一导出
│   │
│   ├── engine/                 # 游戏核心引擎
│   │   └── GameEngine.ts       # 游戏逻辑引擎类
│   │
│   ├── config/                 # 配置文件
│   │   └── game-config.ts      # 游戏配置（方块形状、颜色、分数等）
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts            # 所有类型定义
│   │
│   ├── utils/                  # 工具函数
│   │   └── game-utils.ts       # 游戏相关工具函数
│   │
│   ├── assets/                 # 静态资源
│   │   ├── index.css           # 全局样式
│   │   └── README.md           # 资源说明
│   │
│   ├── App.tsx                 # 主应用组件
│   └── main.tsx                # 应用入口
│
├── index.html                  # HTML 模板
├── package.json                # 项目依赖
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 构建配置
└── README.md                   # 项目说明
```

## 🏗️ 架构设计

### 核心模块

1. **GameEngine** (`src/engine/GameEngine.ts`)
   - 游戏核心逻辑
   - 方块移动、旋转、碰撞检测
   - 分数计算、等级系统
   - 纯 TypeScript 类，无 React 依赖

2. **React Components** (`src/components/`)
   - **game/**: 游戏特定组件
     - `GameCanvas`: 使用 Canvas API 渲染游戏画面
     - `GameInfo`: 显示分数、等级、消除行数等信息
   - **common/**: 可复用的通用组件
   - **ui/**: 纯 UI 展示组件

3. **Custom Hooks** (`src/hooks/`)
   - `useGameLoop`: 管理游戏循环（方块自动下落）
   - `useKeyboardControl`: 处理键盘输入

4. **TypeScript Types** (`src/types/index.ts`)
   - 统一的类型定义
   - 包括：`GameState`, `Piece`, `Position` 等

5. **Utilities** (`src/utils/game-utils.ts`)
   - 纯函数工具集
   - 包括：形状旋转、碰撞检测、棋盘创建等

6. **Configuration** (`src/config/game-config.ts`)
   - 游戏配置常量
   - 方块形状、颜色、分数规则等

## 🎯 设计原则

### 1. 关注点分离
- **引擎层**: 纯游戏逻辑，无 UI 依赖
- **组件层**: React 组件，负责渲染和交互
- **工具层**: 纯函数，可测试、可复用

### 2. 类型安全
- 所有类型统一定义在 `types/` 目录
- 使用 TypeScript 严格模式
- 避免 `any` 类型

### 3. 可测试性
- 游戏引擎是纯类，易于单元测试
- 工具函数是纯函数，易于测试
- Hooks 可以单独测试

### 4. 可维护性
- 组件按功能分组（game/common/ui）
- 清晰的导入路径
- 统一的导出文件（index.ts）

## 🚀 开发指南

### 添加新组件

1. 根据组件类型选择目录：
   - 游戏相关 → `components/game/`
   - 通用组件 → `components/common/`
   - UI 展示 → `components/ui/`

2. 创建组件文件并导出

3. 在对应的 `index.ts` 中添加导出

### 添加新 Hook

1. 在 `hooks/` 目录创建文件，如 `useXXX.ts`

2. 在 `hooks/index.ts` 中导出

### 添加新类型

1. 在 `types/index.ts` 中添加类型定义

2. 确保类型命名清晰、有意义

### 修改游戏逻辑

1. 优先在 `GameEngine.ts` 中修改

2. 如需工具函数，添加到 `utils/game-utils.ts`

3. 更新相关类型定义

## 📦 构建与运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🎮 游戏控制

- **← →**: 左右移动
- **↑**: 旋转方块
- **↓**: 加速下落
- **空格**: 硬降落（直接到底）
- **P**: 暂停/继续

## 📝 版本历史

- **v2.0.0** - 重构版
  - 重新组织项目结构
  - 提取自定义 Hooks
  - 统一类型定义
  - 添加工具函数模块

- **v1.3.0** - React + Canvas 版
  - 使用 Canvas API 渲染
  - 基础游戏功能

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

**开发者**: 赛博方块团队  
**许可证**: MIT
