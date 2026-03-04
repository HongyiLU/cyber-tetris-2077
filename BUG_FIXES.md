# Bug 修复报告 - 高优先级

## 修复日期
2026-03-05

## 修复内容

### 1. 修复游戏循环内存泄漏 ✅

**问题位置**: `src/hooks/useGameLoop.ts`

**问题描述**: 
- 之前的实现没有正确清理 interval，导致组件卸载或状态变化时 interval 继续运行
- 每次依赖项变化时都会创建新的 interval，但没有清理旧的

**解决方案**:
- 使用 `useRef<number | null>(null)` 存储 interval ID
- 在 useEffect 清理函数中正确清除 interval
- 在创建新 interval 前先清理旧的 interval

**修复代码**:
```typescript
const intervalRef = useRef<number | null>(null);

useEffect(() => {
  if (!gameStarted || !gameState || gameState.gameOver || paused) {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return;
  }

  if (intervalRef.current !== null) {
    clearInterval(intervalRef.current);
  }

  intervalRef.current = window.setInterval(dropPiece, dropInterval);

  return () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, [gameStarted, gameState?.level, gameState?.gameOver, paused, dropPiece]);
```

---

### 2. 修复键盘事件监听器泄漏 ✅

**问题位置**: `src/hooks/useKeyboardControl.ts`

**问题描述**:
- 键盘事件监听器在每次状态变化时重新绑定
- handleKeyDown 回调依赖 gameState，导致每次状态变化都创建新函数
- 虽然 useEffect 有清理，但频繁的绑定/解绑影响性能

**解决方案**:
- 使用 `useRef<GameState | null>(null)` 存储最新的游戏状态
- 使用 `useRef<boolean>` 存储游戏开始状态
- handleKeyDown 通过 ref 访问最新状态，而不是直接依赖 state
- handleKeyDown 只依赖 gameEngine 和 onGameStateChange，减少重新创建

**修复代码**:
```typescript
const gameStateRef = useRef<GameState | null>(null);
const gameStartedRef = useRef(false);

// 同步 ref 和 state
useEffect(() => {
  gameStateRef.current = gameState;
  gameStartedRef.current = gameStarted;
}, [gameState, gameStarted]);

const handleKeyDown = useCallback((e: KeyboardEvent) => {
  const currentState = gameStateRef.current;
  const isStarted = gameStartedRef.current;
  
  if (!isStarted || !currentState || currentState.gameOver || currentState.paused) return;
  // ... 处理按键
}, [gameEngine, onGameStateChange]); // 不再依赖 gameState 和 gameStarted

// 只绑定一次键盘事件监听器
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [handleKeyDown]);
```

---

### 3. 完善碰撞检测边界 ✅

**问题位置**: `src/utils/game-utils.ts` - `checkCollision` 函数

**问题描述**:
- 原代码在 `newY < 0` 时的处理不够清晰
- 当方块在棋盘上方时（刚生成或旋转时），应该允许存在
- 原代码逻辑 `(newY >= 0 && board[newY][newX])` 可能导致边界情况处理不当

**解决方案**:
- 明确处理 `newY < 0` 的情况，允许方块在棋盘上方
- 分离边界检查和棋盘碰撞检查
- 添加类型安全检查，确保 board 访问安全

**修复代码**:
```typescript
export const checkCollision = (
  shape: PieceShape,
  position: Position,
  board: number[][],
  cols: number,
  rows: number
): boolean => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      const cell = shape[row][col];
      if (cell !== 0 && cell !== undefined) {
        const newX = position.x + col;
        const newY = position.y + row;

        // 检查左右边界
        if (newX < 0 || newX >= cols) {
          return true;
        }
        
        // 检查底部边界
        if (newY >= rows) {
          return true;
        }
        
        // 完善碰撞检测边界：处理 newY < 0 的情况
        if (newY < 0) {
          continue; // 跳过检查，允许方块在棋盘上方
        }
        
        // 检查是否与已固定的方块碰撞
        if (board[newY] && board[newY][newX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
};
```

---

### 4. 实现基础墙踢机制 ✅

**问题位置**: `src/engine/GameEngine.ts` - `rotatePiece` 方法

**问题描述**:
- 原代码只尝试在原位置旋转
- 当方块靠近墙壁或其他方块时，旋转会被阻止
- 缺乏墙踢（Wall Kick）机制，导致游戏体验不佳

**解决方案**:
- 实现基础墙踢机制，旋转时尝试多个位置
- 尝试顺序：原位置 → 右 1 → 左 1 → 右 2 → 左 2
- 如果任何一个位置可行，则执行旋转并更新位置

**修复代码**:
```typescript
public rotatePiece(): boolean {
  if (!this.currentPiece || this.gameOver || this.paused) return false;

  const rotated = rotateShape(this.currentPiece.shape);
  const originalPosition = { ...this.currentPiece.position };

  // 基础墙踢机制：尝试多个位置
  // 1. 原位置
  if (!checkCollision(rotated, originalPosition, this.board, this.cols, this.rows)) {
    this.currentPiece.shape = rotated;
    return true;
  }

  // 2. 向右移动 1 格
  const kickRight = { ...originalPosition, x: originalPosition.x + 1 };
  if (!checkCollision(rotated, kickRight, this.board, this.cols, this.rows)) {
    this.currentPiece.shape = rotated;
    this.currentPiece.position = kickRight;
    return true;
  }

  // 3. 向左移动 1 格
  const kickLeft = { ...originalPosition, x: originalPosition.x - 1 };
  if (!checkCollision(rotated, kickLeft, this.board, this.cols, this.rows)) {
    this.currentPiece.shape = rotated;
    this.currentPiece.position = kickLeft;
    return true;
  }

  // 4. 向右移动 2 格
  const kickRight2 = { ...originalPosition, x: originalPosition.x + 2 };
  if (!checkCollision(rotated, kickRight2, this.board, this.cols, this.rows)) {
    this.currentPiece.shape = rotated;
    this.currentPiece.position = kickRight2;
    return true;
  }

  // 5. 向左移动 2 格
  const kickLeft2 = { ...originalPosition, x: originalPosition.x - 2 };
  if (!checkCollision(rotated, kickLeft2, this.board, this.cols, this.rows)) {
    this.currentPiece.shape = rotated;
    this.currentPiece.position = kickLeft2;
    return true;
  }

  // 所有墙踢尝试都失败
  return false;
}
```

---

### 5. 修复类型安全问题 ✅

**问题位置**: 
- `src/utils/game-utils.ts` - `checkCollision` 和 `getPieceSize` 函数
- `src/engine/GameEngine.ts` - `lockPiece` 方法

**问题描述**:
- 原代码使用 `if (shape[row][col])` 检查方块，这在 cell 为 0 时可能不够明确
- `filter(cell => cell === 1)` 假设所有方块值都是 1，但实际可能使用不同的类型 ID
- 缺少对 undefined 的检查

**解决方案**:
- 使用显式的 `cell !== 0 && cell !== undefined` 检查
- 在 `getPieceSize` 中使用 `cell !== 0 && cell !== undefined` 替代 `cell === 1`
- 在 `lockPiece` 中添加棋盘边界检查

**修复代码**:
```typescript
// checkCollision 中的修复
const cell = shape[row][col];
if (cell !== 0 && cell !== undefined) {
  // ... 碰撞检测逻辑
}

// getPieceSize 中的修复
export const getPieceSize = (shape: PieceShape): number => {
  return shape.flat().filter(cell => cell !== 0 && cell !== undefined).length;
};

// lockPiece 中的修复
const cell = shape[row][col];
const boardY = position.y + row;
const boardX = position.x + col;

if (cell !== 0 && cell !== undefined && 
    boardY >= 0 && boardY < this.rows && 
    boardX >= 0 && boardX < this.cols) {
  this.board[boardY][boardX] = typeId;
}
```

---

## 测试建议

1. **内存泄漏测试**:
   - 开始游戏，运行几分钟后暂停/继续多次
   - 使用浏览器开发者工具检查内存使用
   - 确保没有 interval 泄漏

2. **键盘响应测试**:
   - 快速连续按键，确保响应流畅
   - 在游戏进行中快速切换方向
   - 确保没有按键延迟或丢失

3. **碰撞检测测试**:
   - 测试方块在棋盘顶部的行为
   - 测试方块生成时的碰撞检测
   - 测试方块在边界处的行为

4. **墙踢测试**:
   - 将方块移动到墙壁附近并尝试旋转
   - 测试在不同位置的旋转行为
   - 确保墙踢不会导致方块穿过墙壁

5. **类型安全测试**:
   - 测试所有类型的方块（I, O, T, S, Z, L, J 等）
   - 确保特殊方块也能正常工作
   - 测试方块锁定到棋盘的正确性

---

## 影响范围

- ✅ `src/hooks/useGameLoop.ts` - 游戏循环内存泄漏修复
- ✅ `src/hooks/useKeyboardControl.ts` - 键盘事件监听器优化
- ✅ `src/utils/game-utils.ts` - 碰撞检测和类型安全修复
- ✅ `src/engine/GameEngine.ts` - 墙踢机制和类型安全修复
- ✅ `src/App.tsx` - 更新以使用修复后的 hooks

---

## 版本更新

建议将版本号更新为 `v2.0.1` 以反映这些重要的 bug 修复。

---

## 备注

所有修复都添加了详细的注释说明问题原因和解决方案，便于未来维护。
