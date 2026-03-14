# v1.9.9 卡组创建功能优化计划

**版本号**: v1.9.9  
**创建日期**: 2026-03-13  
**状态**: 📋 初始化完成  
**优先级**: P1 - 高优先级

---

## 🎯 项目目标

优化卡组创建流程，提升用户体验，降低新手门槛，使卡组创建更加直观、快速、智能。

---

## 📊 当前问题分析

### 现有流程（v1.9.8）

```
1. 点击"新建卡组"按钮
2. 输入卡组名称
3. 输入卡组描述（可选）
4. 手动选择方块（逐个点击添加）
5. 验证卡组（3-7 张）
6. 保存卡组
```

### 痛点识别

| 问题 ID | 问题描述 | 影响程度 | 用户反馈 |
|---------|----------|----------|----------|
| P-001 | 手动添加方块繁琐 | 高 | "要点很多次才能凑齐卡组" |
| P-002 | 没有预设模板快速应用 | 中 | "希望能一键套用经典配置" |
| P-003 | 创建时无法预览卡组效果 | 中 | "不知道这个卡组好不好用" |
| P-004 | 新手不知道如何搭配 | 高 | "不知道该选哪些方块" |
| P-005 | 批量操作不支持 | 低 | "想一次添加多个同种方块" |

---

## ✨ v1.9.9 功能规划

### F-001: 快速创建模板
**优先级**: P0  
**预计工时**: 2h

**功能描述**:
- 提供 3-5 个预设卡组模板（经典、进攻、防守、平衡、随机）
- 一键应用模板创建新卡组
- 模板可自定义修改后保存

**预设模板**:
| 模板名称 | 方块配置 | 适用场景 |
|----------|----------|----------|
| 经典平衡 | I,O,T,S,Z,L,J 各 1 个 | 新手练习 |
| 进攻型 | T,L,J 各 2 个，I 1 个 | 快速攻击 |
| 防守型 | O,I 各 2 个，T 1 个 | 稳定生存 |
| 消行专家 | I,T 各 3 个 | 追求消行 |
| 幸运随机 | 随机 5-7 种方块 | 娱乐模式 |

**验收标准**:
- 模板加载时间 <100ms
- 一键创建成功率 100%
- 模板可预览

---

### F-002: 智能推荐系统
**优先级**: P0  
**预计工时**: 3h

**功能描述**:
- 根据玩家历史游戏数据推荐卡组配置
- 新手引导推荐（基于游戏场次）
- 显示推荐原因和适用场景

**推荐算法**:
```typescript
interface Recommendation {
  deckConfig: DeckConfigData;
  reason: string;
  matchScore: number;  // 匹配度 0-100
  suitableFor: string; // 适用场景
}
```

**验收标准**:
- 推荐响应时间 <200ms
- 推荐理由清晰易懂
- 支持手动刷新推荐

---

### F-003: 卡组预览功能
**优先级**: P1  
**预计工时**: 2h

**功能描述**:
- 创建时实时预览卡组构成
- 显示卡组统计信息（总卡牌数、稀有度分布）
- 模拟抽卡预览（随机展示可能抽到的顺序）

**预览面板**:
- 卡牌列表（图标 + 名称 + 数量）
- 统计图表（稀有度饼图）
- 卡组强度评估（1-5 星）

**验收标准**:
- 预览实时更新（延迟 <50ms）
- 统计信息准确
- UI 清晰美观

---

### F-004: 批量添加/移除
**优先级**: P1  
**预计工时**: 1.5h

**功能描述**:
- 支持 +/- 按钮快速调整数量
- 滑动条控制数量（0-3）
- 快捷键支持（Shift+ 点击添加多个）

**UI 改进**:
```
方块图标 [ - 1 + ]  ← 数量控制
方块图标 [ =====●=== ] 3  ← 滑动条
```

**验收标准**:
- 数量调整流畅
- 边界值正确处理（0 和 3）
- 支持键盘操作

---

### F-005: 创建向导模式
**优先级**: P2  
**预计工时**: 2.5h

**功能描述**:
- 分步引导新手创建卡组
- 步骤 1: 选择卡组风格（进攻/防守/平衡）
- 步骤 2: 选择核心方块（2-3 种）
- 步骤 3: 补充辅助方块
- 步骤 4: 确认并命名

**向导 UI**:
- 进度指示器（步骤 1/4）
- 上一步/下一步按钮
- 随时退出保存

**验收标准**:
- 向导流程完整
- 每步说明清晰
- 支持中途退出

---

## 📋 技术改动

### 修改文件

| 文件路径 | 改动类型 | 说明 |
|----------|----------|------|
| `src/engine/DeckManager.ts` | 修改 | 新增模板系统、推荐算法 |
| `src/components/ui/CardDeck.tsx` | 修改 | 新增快速创建、预览面板 |
| `src/components/ui/DeckCreatorModal.tsx` | 新增 | 卡组创建弹窗（重构） |
| `src/components/ui/DeckPreviewPanel.tsx` | 新增 | 卡组预览面板 |
| `src/components/ui/DeckTemplateSelector.tsx` | 新增 | 模板选择器 |
| `src/utils/deck-recommender.ts` | 新增 | 推荐算法工具 |
| `src/__tests__/DeckManager.test.ts` | 修改 | 新增模板和推荐测试 |
| `src/__tests__/DeckRecommender.test.ts` | 新增 | 推荐算法测试 |

### 新增 API

```typescript
// DeckManager 新增方法
class DeckManager {
  // 模板系统
  getTemplates(): PresetDeck[]
  createFromTemplate(templateId: string, newName: string): Deck
  
  // 推荐系统
  getRecommendations(userId?: string): Recommendation[]
  
  // 批量操作
  bulkAddCards(cardIds: string[]): void
  bulkRemoveCards(cardIds: string[]): void
}
```

### 数据结构扩展

```typescript
// 新增模板接口
interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  config: DeckConfigData;
  suitableFor: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// 新增推荐接口
interface Recommendation {
  templateId: string;
  reason: string;
  matchScore: number;
  suitableFor: string;
  basedOn?: string;  // 推荐依据
}
```

---

## 🧪 测试计划

### 单元测试

| 测试模块 | 测试用例数 | 覆盖内容 |
|----------|------------|----------|
| DeckManager 模板 | 10 | 模板加载、应用、创建 |
| DeckRecommender | 15 | 推荐算法、匹配度计算 |
| DeckCreatorModal | 20 | UI 交互、表单验证 |
| DeckPreviewPanel | 10 | 预览更新、统计计算 |
| 批量操作 | 8 | 边界值、错误处理 |

**总计**: 63+ 个测试用例  
**目标覆盖率**: 90%+

### 集成测试

- 模板创建完整流程
- 推荐系统端到端测试
- 预览面板实时更新
- 批量操作性能测试

### 手动测试

- 新手创建向导体验
- 移动端兼容性
- 不同屏幕尺寸适配

---

## 📅 开发计划

### 阶段 1: 核心功能（2 天）
- [ ] F-001 快速创建模板
- [ ] F-003 卡组预览功能
- [ ] 基础单元测试

### 阶段 2: 智能功能（2 天）
- [ ] F-002 智能推荐系统
- [ ] F-004 批量添加/移除
- [ ] 集成测试

### 阶段 3: 用户体验（1 天）
- [ ] F-005 创建向导模式
- [ ] UI/UX 优化
- [ ] 文档编写

### 阶段 4: 测试发布（1 天）
- [ ] 全面测试
- [ ] Code Review
- [ ] Git 提交 + 标签
- [ ] GitHub Pages 部署

**总工时**: 约 11h  
**建议周期**: 5-6 天

---

## 🎯 验收标准

### 功能验收
- [ ] 所有 P0 功能完成并测试通过
- [ ] P1 功能完成 80% 以上
- [ ] 单元测试通过率 100%
- [ ] 无 P0/P1 级别 Bug

### 性能验收
- [ ] 模板加载 <100ms
- [ ] 推荐响应 <200ms
- [ ] 预览更新 <50ms
- [ ] 无内存泄漏

### 用户体验验收
- [ ] 新手能独立创建卡组
- [ ] 创建流程步骤减少 50%
- [ ] UI 清晰美观
- [ ] 移动端适配良好

---

## 📝 交付物

### 代码文件
- [ ] `src/engine/DeckManager.ts` (修改)
- [ ] `src/components/ui/CardDeck.tsx` (修改)
- [ ] `src/components/ui/DeckCreatorModal.tsx` (新增)
- [ ] `src/components/ui/DeckPreviewPanel.tsx` (新增)
- [ ] `src/components/ui/DeckTemplateSelector.tsx` (新增)
- [ ] `src/utils/deck-recommender.ts` (新增)
- [ ] `src/__tests__/*.test.ts` (新增/修改)

### 文档文件
- [ ] `reports/PLAN_v1.9.9.md` (本文档)
- [ ] `reports/IMPLEMENTATION_v1.9.9.md` (实现报告)
- [ ] `reports/CODE_REVIEW_v1.9.9.md` (审查报告)
- [ ] `reports/TEST_v1.9.9.md` (测试报告)
- [ ] `docs/DECK_CREATION_GUIDE_v1.9.9.md` (用户指南)

### 发布物
- [ ] Git 提交
- [ ] 版本标签 v1.9.9
- [ ] GitHub Pages 部署
- [ ] 更新日志

---

## 🔗 相关文档

- [卡组编辑系统优化完成总结](./DECK_EDITOR_OPTIMIZATION_COMPLETE.md)
- [卡组编辑改进任务清单](./DECK_EDITOR_ACTION_ITEMS.md)
- [DeckManager API 文档](./src/engine/DeckManager.ts)
- [标准开发流程](./MEMORY.md)

---

## 📞 反馈渠道

如有问题或建议，请通过以下方式反馈：
- GitHub Issues
- 用户反馈群
- 邮件联系

---

**创建时间**: 2026-03-13 10:19 GMT+8  
**创建人员**: 千束 (首席游戏设计师) 🎮  
**审核状态**: 待审核  
**下一步**: 调用 @coder 子代理开始功能实现
