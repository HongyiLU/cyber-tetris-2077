# 测试指南 - 赛博方块 2077

本文档说明如何运行、编写和维护项目测试。

## 📋 目录

- [快速开始](#快速开始)
- [测试框架](#测试框架)
- [运行测试](#运行测试)
- [测试覆盖率](#测试覆盖率)
- [编写测试](#编写测试)
- [测试结构](#测试结构)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

测试相关依赖已包含在 `package.json` 中：
- `jest` - 测试运行器
- `@testing-library/react` - React 组件测试工具
- `@testing-library/jest-dom` - DOM 匹配器
- `ts-jest` - TypeScript 支持
- `jsdom` - 浏览器环境模拟
- `identity-obj-proxy` - CSS 模块模拟

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监视模式（开发时使用）
npm run test:watch

# 详细输出模式
npm run test:verbose
```

## 🧪 测试框架

### Jest 配置

配置文件：`jest.config.js`

主要配置项：
- **preset**: `ts-jest/presets/default-esm` - TypeScript + ESM 支持
- **testEnvironment**: `jsdom` - 浏览器环境
- **setupFilesAfterEnv**: 测试前执行的设置文件
- **testMatch**: 测试文件匹配模式 `**/__tests__/**/*.test.ts`
- **collectCoverageFrom**: 覆盖率统计范围

### TypeScript 配置

测试专用配置：`tsconfig.test.json`

扩展了主 `tsconfig.json`，添加了：
- Jest 类型定义
- React JSX 支持
- ESM 模块配置

## 📊 运行测试

### 基本命令

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npx jest src/__tests__/GameEngine.test.ts

# 运行匹配文件名的测试
npx jest GameEngine

# 运行匹配测试名称的测试
npx jest -t "应该可以向左移动方块"
```

### 监视模式

开发时推荐使用监视模式，自动检测文件变化并重新运行测试：

```bash
npm run test:watch
```

监视模式下的快捷键：
- `a` - 运行所有测试
- `f` - 运行失败的测试
- `p` - 按文件名过滤
- `t` - 按测试名过滤
- `q` - 退出

### 调试测试

使用 `--verbose` 查看详细输出：

```bash
npm run test:verbose
```

在测试中添加 `console.log` 调试（不推荐用于生产测试）：

```typescript
test('调试示例', () => {
  const result = someFunction();
  console.log('Result:', result); // 仅在调试时使用
  expect(result).toBe(expected);
});
```

## 📈 测试覆盖率

### 生成覆盖率报告

```bash
npm run test:coverage
```

### 覆盖率阈值

项目配置了最低覆盖率要求（`jest.config.js`）：

```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

**目标：核心功能测试覆盖率达到 60%+**

### 查看覆盖率报告

运行 `test:coverage` 后，会在 `coverage` 目录生成报告：

```bash
# 在浏览器中打开 HTML 报告
start coverage/index.html  # Windows
open coverage/index.html   # macOS
xdg-open coverage/index.html  # Linux
```

报告包含：
- **Statements**: 语句覆盖率
- **Branches**: 分支覆盖率
- **Functions**: 函数覆盖率
- **Lines**: 行覆盖率

### 提高覆盖率

1. **添加更多测试用例** - 覆盖边界情况和错误处理
2. **测试分支逻辑** - 确保 if/else、switch 的所有分支都被测试
3. **测试异常处理** - 验证错误情况下的行为

## ✍️ 编写测试

### 测试文件结构

测试文件应放在 `src/__tests__/` 目录，命名格式：`*.test.ts` 或 `*.test.tsx`

```
src/
├── __tests__/
│   ├── GameEngine.test.ts      # 游戏引擎测试
│   ├── App.test.tsx            # 组件测试
│   ├── __mocks__/              # 模拟数据
│   │   └── game-mocks.ts
│   └── utils/                  # 测试工具
│       └── test-helpers.ts
├── engine/
│   └── GameEngine.ts
└── App.tsx
```

### 测试结构

使用 `describe` 组织测试，`test` 或 `it` 编写具体测试：

```typescript
describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  describe('初始化', () => {
    test('应该创建空的棋盘', () => {
      const state = engine.getGameState();
      expect(state.board).toHaveLength(20);
    });
  });

  describe('移动', () => {
    test('应该可以向左移动', () => {
      const moved = engine.movePiece(-1, 0);
      expect(moved).toBe(true);
    });
  });
});
```

### 常用匹配器

#### Jest 内置匹配器

```typescript
expect(value).toBe(expected);           // 严格相等
expect(value).toEqual(object);          // 深度相等
expect(value).toBeTruthy();             // 真值
expect(value).toBeFalsy();              // 假值
expect(value).toBeNull();               // null
expect(value).toBeUndefined();          // undefined
expect(value).toBeDefined();            // 已定义
expect(value).toContain(item);          // 包含
expect(value).toHaveLength(n);          // 长度
expect(value).toBeGreaterThan(n);       // 大于
expect(value).toBeLessThan(n);          // 小于
expect(fn).toThrow();                   // 抛出异常
```

#### @testing-library/jest-dom 匹配器

```typescript
expect(element).toBeInTheDocument();    // 存在于 DOM
expect(element).toBeVisible();          // 可见
expect(element).toHaveClass('name');    // 有 CSS 类
expect(element).toHaveTextContent('x'); // 有文本内容
expect(element).toHaveAttribute('x');   // 有属性
expect(element).toBeDisabled();         // 禁用
expect(element).toBeEnabled();          // 启用
```

### 测试工具函数

项目提供了测试辅助函数（`src/__tests__/utils/test-helpers.ts`）：

```typescript
import { createInitializedEngine, expectScore } from '../utils/test-helpers';

test('测试计分', () => {
  const engine = createInitializedEngine();
  // ... 执行操作
  const state = engine.getGameState();
  expectScore(state, 150);
});
```

### 模拟数据

使用 `src/__tests__/__mocks__/game-mocks.ts` 中的模拟数据：

```typescript
import { createMockPiece, createEmptyBoard } from '../__mocks__/game-mocks';

test('使用模拟方块', () => {
  const piece = createMockPiece('T', 3, 0);
  expect(piece.type).toBe('T');
});
```

### 测试异步代码

```typescript
test('异步操作', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

test('使用 waitFor', async () => {
  render(<Component />);
  const element = await waitFor(() => screen.getByText('Loaded'));
  expect(element).toBeInTheDocument();
});
```

### 测试 React 组件

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

test('点击按钮', () => {
  render(<App />);
  const button = screen.getByText('开始游戏');
  fireEvent.click(button);
  expect(screen.queryByText('开始游戏')).not.toBeInTheDocument();
});

test('键盘事件', () => {
  render(<App />);
  fireEvent.keyDown(window, { key: 'ArrowLeft' });
  // 验证效果
});
```

## 🏗️ 测试结构

### 单元测试 (GameEngine.test.ts)

测试游戏引擎的核心功能：

1. **初始化测试**
   - 棋盘创建
   - 游戏状态初始化
   - 方块生成

2. **移动测试**
   - 左右下移动
   - 边界检测
   - 游戏结束/暂停状态

3. **旋转测试**
   - 基本旋转
   - 碰撞检测
   - 边界情况

4. **碰撞检测**
   - 棋盘边界
   - 方块间碰撞

5. **锁定和消行**
   - 方块锁定
   - 行消除
   - 分数计算

6. **计分系统**
   - 初始分数
   - 升级逻辑
   - 分数倍率

7. **游戏状态**
   - 暂停切换
   - 游戏结束检测
   - 状态深拷贝

8. **边界情况**
   - 自定义棋盘大小
   - 空状态处理

### 组件测试 (App.test.tsx)

测试 React 组件：

1. **渲染测试**
   - 标题显示
   - 按钮显示
   - 说明文本

2. **交互测试**
   - 按钮点击
   - 键盘事件
   - 游戏流程

3. **样式测试**
   - CSS 类
   - 内联样式

4. **可访问性**
   - 焦点管理
   - 可见性

5. **边界情况**
   - 多次点击
   - 快速输入
   - 组件卸载

## 📖 最佳实践

### 1. 测试命名

使用描述性的测试名称，说明预期行为：

```typescript
// ✅ 好的命名
test('应该可以向左移动方块');
test('当方块到达边界时不能继续移动');
test('消除一行应该得 150 分');

// ❌ 避免的命名
test('移动测试');
test('边界');
test('分数');
```

### 2. AAA 模式

按照 Arrange-Act-Assert 组织测试：

```typescript
test('示例', () => {
  // Arrange - 准备数据
  const engine = new GameEngine();
  engine.init();
  
  // Act - 执行操作
  const moved = engine.movePiece(-1, 0);
  
  // Assert - 验证结果
  expect(moved).toBe(true);
});
```

### 3. 测试隔离

每个测试应该独立，不依赖其他测试的状态：

```typescript
describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    // 每个测试前重新创建
    engine = new GameEngine();
    engine.init();
  });

  test('测试 1', () => {
    // 使用 engine
  });

  test('测试 2', () => {
    // 独立的 engine 实例
  });
});
```

### 4. 测试边界情况

```typescript
test('边界：方块在最左边', () => {
  // 移动到最左边
  for (let i = 0; i < 10; i++) {
    engine.movePiece(-1, 0);
  }
  
  const moved = engine.movePiece(-1, 0);
  expect(moved).toBe(false);
});
```

### 5. 避免测试实现细节

测试行为，而不是实现：

```typescript
// ✅ 测试行为
test('方块不能移出边界', () => {
  const state = engine.getGameState();
  expect(state.currentPiece!.position.x).toBeGreaterThanOrEqual(0);
});

// ❌ 避免测试实现细节
test('私有方法 checkCollision 返回 true', () => {
  // 不应该测试私有方法
});
```

### 6. 保持测试简洁

每个测试只验证一个行为：

```typescript
// ✅ 好的测试
test('向左移动应该减少 x 坐标', () => {
  const state = engine.getGameState();
  const initialX = state.currentPiece!.position.x;
  engine.movePiece(-1, 0);
  expect(engine.getGameState().currentPiece!.position.x).toBe(initialX - 1);
});

// ❌ 避免在一个测试中验证太多
test('移动和旋转和分数', () => {
  // 做了太多事情
});
```

### 7. 使用描述性的错误信息

```typescript
test('自定义错误信息', () => {
  expect(score).toBe(150);
  // 失败时显示：Expected score to be 150, but got 0
});
```

## ❓ 常见问题

### Q: 如何跳过某个测试？

```typescript
test.skip('暂时跳过的测试', () => {
  // ...
});

// 或者只运行某个测试
test.only('只运行这个测试', () => {
  // ...
});
```

### Q: 如何测试私有方法？

不推荐测试私有方法。如果私有方法很重要，考虑：
1. 将其改为公共方法
2. 通过公共方法间接测试其行为

### Q: 如何处理随机性？

对于随机生成的方块，可以：
1. Mock `Math.random` 返回固定值
2. 测试统计特性（多次运行）
3. 注入随机种子

```typescript
test('随机方块生成', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
  engine.init();
  // 现在方块类型是可预测的
});
```

### Q: 测试运行很慢怎么办？

1. 使用 `test:watch` 只运行相关测试
2. 使用 `-t` 过滤测试名
3. 检查是否有不必要的异步操作
4. 考虑拆分大型测试套件

### Q: 覆盖率不达标怎么办？

1. 运行 `npm run test:coverage` 查看哪些文件覆盖率低
2. 打开 `coverage/index.html` 查看具体未覆盖的行
3. 添加测试用例覆盖这些分支和路径

### Q: 如何处理 CSS 模块导入？

已配置 `identity-obj-proxy` 自动处理 CSS 导入，无需额外配置。

### Q: TypeScript 类型错误？

确保：
1. 安装了 `@types/jest` 和 `@types/testing-library__jest-dom`
2. `tsconfig.test.json` 包含正确的类型定义
3. 使用 `as` 断言或 `any` 类型处理复杂情况（谨慎使用）

## 🔧 故障排除

### 测试文件未被识别

检查文件名是否匹配 `*.test.ts` 或 `*.test.tsx`

### 导入错误

确保路径正确，使用相对路径导入：
```typescript
import { GameEngine } from '../../engine/GameEngine';
```

### Jest 配置错误

检查 `jest.config.js` 语法，确保导出正确的配置对象。

### 类型定义缺失

安装缺失的类型包：
```bash
npm install --save-dev @types/node
```

## 📚 参考资源

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Library 官方文档](https://testing-library.com/docs/react-testing-library/intro/)
- [ts-jest 文档](https://kulshekhar.github.io/ts-jest/)
- [Jest 匹配器](https://jestjs.io/docs/using-matchers)

## 🎯 测试目标

- **核心功能覆盖率**: 60%+
- **关键路径测试**: 100%（移动、旋转、碰撞、消行、计分）
- **边界情况测试**: 覆盖所有已知的边界情况
- **组件测试**: 覆盖所有用户交互

---

**最后更新**: 2026-03-05  
**版本**: v1.3.0
