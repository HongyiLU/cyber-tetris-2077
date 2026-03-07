# v1.5.0 更新计划 - 战斗系统完善

**版本**: v1.5.0  
**类型**: 功能更新  
**优先级**: 高  
**计划发布日期**: 2026-03-XX  
**迭代**: v2.2.0

---

## 📋 更新目标

完善 v1.4.0 引入的战斗原型系统，添加敌人多样性、玩家技能、战斗 UI 增强和音效系统，使战斗系统更加完整和有趣。

---

## 🎯 核心功能

### 1. 敌人类型多样化 🔴 高优先级

**需求描述**:
当前只有一个默认敌人（史莱姆，200 HP，10 秒攻击间隔）。需要添加多种敌人类型，每种有独特的属性。

**技术方案**:
```typescript
// src/types/enemy.ts
export interface EnemyType {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  attackInterval: number;  // 毫秒
  attackDamage: number;
  garbageRows: number;     // 攻击时生成的垃圾行数
  description: string;
}

// src/config/enemy-config.ts
export const ENEMY_TYPES: EnemyType[] = [
  {
    id: 'slime',
    name: '史莱姆',
    emoji: '🦠',
    hp: 200,
    attackInterval: 10000,
    attackDamage: 10,
    garbageRows: 1,
    description: '最基础的敌人，行动缓慢',
  },
  {
    id: 'goblin',
    name: '哥布林',
    emoji: '👺',
    hp: 150,
    attackInterval: 8000,
    attackDamage: 15,
    garbageRows: 2,
    description: '敏捷但脆弱的敌人',
  },
  {
    id: 'orc',
    name: '兽人',
    emoji: '👹',
    hp: 300,
    attackInterval: 12000,
    attackDamage: 20,
    garbageRows: 2,
    description: '强大但缓慢的敌人',
  },
  {
    id: 'dragon',
    name: '巨龙',
    emoji: '🐉',
    hp: 500,
    attackInterval: 15000,
    attackDamage: 25,
    garbageRows: 3,
    description: '强大的 Boss 级敌人',
  },
  {
    id: 'ghost',
    name: '幽灵',
    emoji: '👻',
    hp: 180,
    attackInterval: 6000,
    attackDamage: 8,
    garbageRows: 1,
    description: '快速攻击的幽灵',
  },
];
```

**验收标准**:
- [ ] 至少 5 种敌人类型
- [ ] 每种敌人有独特的血量、攻击间隔、伤害
- [ ] 敌人选择界面（战斗开始前选择敌人）
- [ ] 敌人信息显示（名称、血量、攻击间隔）

---

### 2. 玩家技能系统 🟡 中优先级

**需求描述**:
玩家在战斗中可以使用技能来增强自己或对敌人造成伤害。

**技术方案**:
```typescript
// src/types/skill.ts
export interface Skill {
  id: string;
  name: string;
  emoji: string;
  cooldown: number;      // 冷却时间（秒）
  cost?: number;         // 消耗（可选，如能量点）
  description: string;
  effect: (game: GameEngine) => void;
}

// src/config/skill-config.ts
export const SKILLS: Skill[] = [
  {
    id: 'heal',
    name: '治疗',
    emoji: '💖',
    cooldown: 30,
    description: '恢复 30 点生命值',
    effect: (game) => {
      game.playerHeal(30);
    },
  },
  {
    id: 'burst',
    name: '爆发',
    emoji: '💥',
    cooldown: 20,
    description: '对敌人造成 50 点伤害',
    effect: (game) => {
      game.enemyTakeDamage(50);
    },
  },
  {
    id: 'shield',
    name: '护盾',
    emoji: '🛡️',
    cooldown: 40,
    description: '5 秒内免疫伤害',
    effect: (game) => {
      game.activateShield(5000);
    },
  },
  {
    id: 'clear',
    name: '清理',
    emoji: '🧹',
    cooldown: 60,
    description: '消除底部 3 行垃圾行',
    effect: (game) => {
      game.clearGarbageRows(3);
    },
  },
];
```

**UI 设计**:
```
┌─────────────────────────────────────┐
│  技能栏 (底部)                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 💖  │ │ 💥  │ │ 🛡️  │ │ 🧹  │  │
│  │治疗 │ │爆发 │ │护盾 │ │清理 │  │
│  │ 30s │ │ 20s │ │ 40s │ │ 60s │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
└─────────────────────────────────────┘
```

**验收标准**:
- [ ] 至少 4 种玩家技能
- [ ] 技能冷却系统
- [ ] 技能 UI 显示（图标、名称、冷却时间）
- [ ] 技能快捷键（数字键 1-4）
- [ ] 技能效果实现

---

### 3. 战斗 UI 增强 🟡 中优先级

**需求描述**:
增强战斗 UI，添加伤害数字弹出、连击计数器、技能冷却显示等。

**技术方案**:

#### 3.1 伤害数字弹出
```typescript
// src/components/ui/DamageNumber.tsx
interface DamageNumberProps {
  value: number;
  type: 'damage' | 'heal' | 'critical';
  position: { x: number; y: number };
}

// 动画效果：数字向上飘动并渐隐
```

#### 3.2 连击计数器
```typescript
// src/components/ui/ComboCounter.tsx
interface ComboCounterProps {
  combo: number;
  maxCombo: number;
}

// 连击规则：
// - 连续消行（5 秒内）增加连击数
// - 连击奖励：伤害 × (1 + 连击数 × 0.1)
```

#### 3.3 技能冷却显示
```typescript
// src/components/ui/SkillBar.tsx
interface SkillBarProps {
  skills: Skill[];
  cooldowns: Map<string, number>;  // 技能 ID → 剩余冷却时间
  onUseSkill: (skillId: string) => void;
}

// 显示：
// - 可用技能：彩色图标
// - 冷却中：灰色图标 + 倒计时
```

**UI 布局**:
```
┌─────────────────────────────────────────────────────┐
│  👤 玩家          VS          🐉 巨龙               │
│  ████████ 100/100              ████████ 500/500    │
│  连击：x5 🔥                                     │
└─────────────────────────────────────────────────────┘

         💥 -45  (伤害数字弹出)

┌─────────────────────────────────────────────────────┐
│  技能栏                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │ 💖  │ │ 💥  │ │ 🛡️  │ │ 🧹  │                   │
│  │     │ │ 15s │ │     │ │     │                   │
│  └─────┘ └─────┘ └─────┘ └─────┘                   │
└─────────────────────────────────────────────────────┘
```

**验收标准**:
- [ ] 伤害数字弹出动画
- [ ] 连击计数器（显示连击数和最大连击）
- [ ] 技能冷却可视化（进度条或数字倒计时）
- [ ] 暴击伤害显示（特殊颜色/动画）

---

### 4. 战斗音效系统 🟢 低优先级

**需求描述**:
添加战斗相关的音效，增强战斗体验。

**音效列表**:
- [ ] **攻击音效** - 消行时对敌人造成伤害
- [ ] **受击音效** - 玩家被敌人攻击
- [ ] **技能音效** - 使用技能时
- [ ] **胜利音效** - 击败敌人
- [ ] **失败音效** - 被敌人击败
- [ ] **连击音效** - 达成连击
- [ ] **暴击音效** - 造成暴击伤害
- [ ] **背景音乐** - 战斗 BGM（循环）

**技术方案**:
```typescript
// src/hooks/useBattleSound.ts
export const useBattleSound = () => {
  const sounds = {
    attack: new Audio('/sounds/battle/attack.mp3'),
    hit: new Audio('/sounds/battle/hit.mp3'),
    skill: new Audio('/sounds/battle/skill.mp3'),
    victory: new Audio('/sounds/battle/victory.mp3'),
    defeat: new Audio('/sounds/battle/defeat.mp3'),
    combo: new Audio('/sounds/battle/combo.mp3'),
    critical: new Audio('/sounds/battle/critical.mp3'),
    bgm: new Audio('/sounds/battle/bgm.mp3'),
  };

  const play = (name: string) => {
    sounds[name].currentTime = 0;
    sounds[name].play();
  };

  return { play };
};
```

**验收标准**:
- [ ] 所有音效文件准备就绪
- [ ] 音效播放逻辑实现
- [ ] 音量控制（设置中可以调节）
- [ ] 静音选项

---

### 5. 关卡系统 🟡 中优先级

**需求描述**:
添加关卡系统，玩家可以挑战不同难度的关卡。

**技术方案**:
```typescript
// src/types/level.ts
export interface Level {
  id: string;
  name: string;
  enemyId: string;
  enemyHpMultiplier: number;
  enemyDamageMultiplier: number;
  reward: {
    gold: number;
    exp: number;
    item?: string;
  };
  description: string;
}

// src/config/level-config.ts
export const LEVELS: Level[] = [
  {
    id: 'level-1',
    name: '新手训练',
    enemyId: 'slime',
    enemyHpMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
    reward: { gold: 100, exp: 50 },
    description: '击败一只史莱姆',
  },
  {
    id: 'level-2',
    name: '哥布林袭击',
    enemyId: 'goblin',
    enemyHpMultiplier: 1.2,
    enemyDamageMultiplier: 1.2,
    reward: { gold: 200, exp: 100 },
    description: '击败一只哥布林',
  },
  {
    id: 'level-3',
    name: '兽人营地',
    enemyId: 'orc',
    enemyHpMultiplier: 1.5,
    enemyDamageMultiplier: 1.5,
    reward: { gold: 300, exp: 150 },
    description: '击败一只兽人',
  },
  {
    id: 'level-4',
    name: '幽灵古堡',
    enemyId: 'ghost',
    enemyHpMultiplier: 1.3,
    enemyDamageMultiplier: 1.8,
    reward: { gold: 400, exp: 200 },
    description: '击败一只幽灵',
  },
  {
    id: 'level-5-boss',
    name: '巨龙巢穴',
    enemyId: 'dragon',
    enemyHpMultiplier: 2.0,
    enemyDamageMultiplier: 2.0,
    reward: { gold: 1000, exp: 500, item: '龙鳞' },
    description: '击败巨龙 Boss',
  },
];
```

**关卡选择 UI**:
```
┌─────────────────────────────────────────┐
│  关卡选择                               │
├─────────────────────────────────────────┤
│  ▶ Level 1: 新手训练      ⭐⭐☆☆☆      │
│    击败一只史莱姆                       │
│    奖励：100 金币，50 经验               │
├─────────────────────────────────────────┤
│  ▶ Level 2: 哥布林袭击    ⭐⭐⭐☆☆      │
│    击败一只哥布林                       │
│    奖励：200 金币，100 经验              │
├─────────────────────────────────────────┤
│  ▶ Level 3: 兽人营地      ⭐⭐⭐⭐☆      │
│    击败一只兽人                         │
│    奖励：300 金币，150 经验              │
├─────────────────────────────────────────┤
│  ▶ Level 4: 幽灵古堡      ⭐⭐⭐⭐⭐      │
│    击败一只幽灵                         │
│    奖励：400 金币，200 经验              │
├─────────────────────────────────────────┤
│  ▶ Level 5: 巨龙巢穴      ⭐⭐⭐⭐⭐      │
│    击败巨龙 Boss                        │
│    奖励：1000 金币，500 经验，龙鳞       │
└─────────────────────────────────────────┘
```

**验收标准**:
- [ ] 至少 5 个关卡（包含 1 个 Boss 关）
- [ ] 关卡选择界面
- [ ] 关卡难度递增
- [ ] 关卡奖励系统
- [ ] 关卡完成度追踪（星级评价）

---

## 📊 任务分解

### 第一阶段：敌人类型多样化（2-3 天）
- [ ] 创建 `src/types/enemy.ts`
- [ ] 创建 `src/config/enemy-config.ts`
- [ ] 修改 `GameEngine.initBattle()` 支持敌人类型参数
- [ ] 创建敌人选择界面组件
- [ ] 单元测试

### 第二阶段：玩家技能系统（3-4 天）
- [ ] 创建 `src/types/skill.ts`
- [ ] 创建 `src/config/skill-config.ts`
- [ ] 修改 `GameEngine` 添加技能相关方法
- [ ] 创建 `SkillBar` 组件
- [ ] 实现技能快捷键
- [ ] 单元测试

### 第三阶段：战斗 UI 增强（2-3 天）
- [ ] 创建 `DamageNumber` 组件
- [ ] 创建 `ComboCounter` 组件
- [ ] 修改 `BattleUI` 添加连击显示
- [ ] 技能冷却可视化
- [ ] 样式优化

### 第四阶段：关卡系统（2-3 天）
- [ ] 创建 `src/types/level.ts`
- [ ] 创建 `src/config/level-config.ts`
- [ ] 创建关卡选择界面
- [ ] 关卡进度保存（localStorage）
- [ ] 单元测试

### 第五阶段：音效系统（1-2 天）
- [ ] 收集/制作音效文件
- [ ] 创建 `useBattleSound` hook
- [ ] 在战斗逻辑中集成音效
- [ ] 音量控制设置

### 第六阶段：测试和优化（2 天）
- [ ] 集成测试
- [ ] 性能优化
- [ ] 移动端适配测试
- [ ] Bug 修复

---

## 📈 验收标准

| 标准 | 目标 | 状态 |
|------|------|------|
| 敌人类型数量 | ≥ 5 种 | ⏳ 待完成 |
| 玩家技能数量 | ≥ 4 种 | ⏳ 待完成 |
| 关卡数量 | ≥ 5 个（含 Boss 关） | ⏳ 待完成 |
| 音效数量 | ≥ 8 种 | ⏳ 待完成 |
| 测试通过率 | 100% | ⏳ 待完成 |
| TypeScript 错误 | 0 | ⏳ 待完成 |
| 移动端适配 | 完全支持 | ⏳ 待完成 |

---

## 📁 新增文件清单

```
src/
├── types/
│   ├── enemy.ts           # 敌人类型定义
│   └── skill.ts           # 技能类型定义
├── config/
│   ├── enemy-config.ts    # 敌人配置
│   ├── skill-config.ts    # 技能配置
│   └── level-config.ts    # 关卡配置
├── components/ui/
│   ├── DamageNumber.tsx   # 伤害数字组件
│   ├── ComboCounter.tsx   # 连击计数器组件
│   ├── SkillBar.tsx       # 技能栏组件
│   └── LevelSelect.tsx    # 关卡选择组件
├── hooks/
│   └── useBattleSound.ts  # 战斗音效 hook
└── __tests__/
    ├── BattleSystem.test.ts (更新)
    ├── SkillSystem.test.ts (新增)
    └── LevelSystem.test.ts (新增)
```

---

## 🎯 技术亮点

### 1. 敌人多样性
- 不同敌人有不同属性和行为模式
- 为后续 Boss 战和特殊事件预留扩展性

### 2. 技能系统
- 策略性战斗（选择合适的技能）
- 冷却管理（合理使用技能）
- 为后续技能升级/进化预留空间

### 3. 连击系统
- 鼓励连续消行
- 增加战斗爽快感
- 连击奖励机制

### 4. 关卡系统
- 渐进式难度曲线
- 目标驱动（解锁新关卡）
- 奖励反馈（金币、经验、道具）

---

## 🔮 未来扩展（v1.6.0+）

- **装备系统** - 可装备道具增强能力
- **技能升级** - 技能可以升级增强效果
- **敌人 AI 改进** - 更智能的敌人行为
- **多人合作** - 2 人合作战斗
- **每日挑战** - 每日特殊挑战任务

---

**计划制定者**: 千束 (首席游戏设计师)  
**日期**: 2026-03-07  
**状态**: 📋 规划中
