# 🧹 项目冗余文件清理计划

**分析日期**: 2026-03-08  
**当前版本**: v1.5.0

---

## 📊 冗余文件分类

### 1️⃣ 重复/过时的测试报告

**可以合并或删除的文件**:

| 文件 | 建议 | 理由 |
|------|------|------|
| `TEST_REPORT_2026-03-05.md` | 🗑️ 删除 | 已被后续报告替代 |
| `TEST_REPORT_DECK_SYSTEM_2026-03-06.md` | 🗑️ 删除 | 已被 `TEST_REPORT_DECK_INTEGRATION.md` 替代 |
| `TEST_SUMMARY.md` | 🗑️ 删除 | 内容重复 |
| `TEST_SUMMARY_GARBAGE_FIX.md` | 🗑️ 删除 | 已整合到 `RELEASE_v1.3.2.md` |
| `TEST_REPORT_HARD_DROP_FIX_2026-03-06.md` | 🗑️ 删除 | 硬降修复已完成，报告过时 |
| `test-plan-harddrop.md` | 🗑️ 删除 | 测试计划，已完成 |
| `TEST_REPORT_DECK_PILE_MODE.md` | 🗑️ 删除 | 已整合到 `IMPLEMENTATION_REPORT.md` |
| `TEST_REPORT_DECK_CLEANUP_VERIFICATION.md` | 🗑️ 删除 | 已整合到 `TEST_REPORT_DECK_CLEANUP_FINAL.md` |

**保留**:
- ✅ `reports/TEST_REPORT_v1.5.0_final.md` - 最新完整测试报告
- ✅ `reports/CODE_REVIEW_v1.5.0_phase1.md` - 最新审查报告

---

### 2️⃣ 过时的实现报告

**可以删除的文件**:

| 文件 | 建议 | 理由 |
|------|------|------|
| `DECK_FIX_REPORT.md` | 🗑️ 删除 | 已整合到最终版本 |
| `DECK_IMPLEMENTATION_SUMMARY.md` | 🗑️ 删除 | 已被 `IMPLEMENTATION_REPORT.md` 替代 |
| `SIMPLIFICATION_REPORT.md` | 🗑️ 删除 | v1.3.0 报告，已过时 |
| `CODE_REVIEW_DECK_CLEANUP.md` | 🗑️ 删除 | 已被新审查报告替代 |

**保留**:
- ✅ `IMPLEMENTATION_REPORT.md` - 牌堆模式完整实现报告
- ✅ `docs/v1.5.0-enemy-types-implementation.md` - 最新实现报告
- ✅ `docs/v1.5.0-battle-ui-enhancement.md` - 最新实现报告

---

### 3️⃣ 流程图和参考文档

**可以删除的文件**:

| 文件 | 建议 | 理由 |
|------|------|------|
| `DECK_MODE_FLOW.md` | 🗑️ 删除 | 流程图，非必需 |
| `DECK_PILE_FLOW.md` | 🗑️ 删除 | 流程图，非必需 |
| `DECK_QUICK_REFERENCE.md` | 🗑️ 删除 | 快速参考，非必需 |
| `DECK_SYSTEM.md` | 🗑️ 删除 | 卡组系统文档，已整合 |

---

### 4️⃣ 过时的版本发布报告

**可以删除的文件**:

| 文件 | 建议 | 理由 |
|------|------|------|
| `RELEASE_v1.0.1.md` | 🗑️ 删除 | 早期版本，已过时 |
| `RELEASE_v1.3.0.md` | 🗑️ 删除 | 已整合到 `RELEASE_STATUS.md` |
| `RELEASE_v1.3.1.md` | 🗑️ 删除 | 已整合到 `RELEASE_STATUS.md` |
| `RELEASE_v1.3.2.md` | 🗑️ 删除 | 已整合到 `RELEASE_STATUS.md` |
| `RELEASE_v1.4.0.md` | 🗑️ 删除 | 已整合到 `RELEASE_STATUS.md` |

**保留**:
- ✅ `RELEASE_v1.5.0.md` - 最新版本发布报告
- ✅ `RELEASE_STATUS.md` - 包含所有版本历史

---

### 5️⃣ 计划和规划文档

**可以删除的文件**:

| 文件 | 建议 | 理由 |
|------|------|------|
| `PLAN_v1.5.0.md` | 🗑️ 删除 | v1.5.0 已完成，计划过时 |
| `PERFORMANCE_REPORT.md` | 🗑️ 删除 | 性能报告，已过时 |
| `CODE_QUALITY_REPORT.md` | 🗑️ 删除 | 质量报告，已过时 |

**保留**:
- ✅ `TASK_TRACKER.md` - 当前任务跟踪
- ✅ `MEMORY.md` - 长期记忆和流程文档

---

### 6️⃣ 旧项目文件夹（已废弃）

**可以删除的文件夹**:

| 文件夹 | 建议 | 理由 |
|--------|------|------|
| `cyber-shopkeeper/` | 🗑️ 删除 | 已废弃的旧项目 |
| `fishing-game/` | 🗑️ 删除 | 已废弃的旧项目 |
| `garden-world/` | 🗑️ 删除 | 已废弃的旧项目 |
| `multi-agent-chatroom/` | 🗑️ 删除 | 已废弃的旧项目 |
| `openclaw-plugin-agent-mention/` | 🗑️ 删除 | 已废弃的插件项目 |
| `gateway-tray/` | 🗑️ 删除 | 已废弃的工具 |

---

### 7️⃣ 临时和构建文件

**可以删除的文件/文件夹**:

| 文件/文件夹 | 建议 | 理由 |
|------------|------|------|
| `dist/` | 🗑️ 删除 | 构建产物，应加入.gitignore |
| `logs/` | 🗑️ 删除 | 日志文件，应加入.gitignore |
| `test-reports/` | 🗑️ 删除 | 临时测试报告 |
| `scripts/fix-tests.js` | 🗑️ 删除 | 临时脚本（保留.cjs） |
| `scripts/fix-tests.cjs` | ✅ 保留 | 可能还有用 |

---

### 8️⃣ OpenClaw 配置文件

**可以删除的文件**:

| 文件 | 建议 | 理由 |
|------|------|------|
| `AGENT_TEAM_CONFIG.md` | 🗑️ 删除 | 多助手配置，已不使用 |
| `AGENT_TEAM_INTERFACE.md` | 🗑️ 删除 | 多助手接口，已不使用 |
| `AGENT_COLLABORATION_GUIDE.md` | 🗑️ 删除 | 多助手指南，已不使用 |
| `MULTI_AGENT_GUIDE.md` | 🗑️ 删除 | 多助手指南，已不使用 |
| `MULTI_AGENT_CHATROOM.md` | 🗑️ 删除 | 多助手聊天室，已不使用 |
| `TEAM_ROLES.md` | 🗑️ 删除 | 团队角色，已整合 |
| `TEAM_STATUS.md` | 🗑️ 删除 | 团队状态，已过时 |
| `SCHEDULED_TASK_SETUP.md` | 🗑️ 删除 | 计划任务设置，已不使用 |
| `SCHEDULED_TASK_SUMMARY.md` | 🗑️ 删除 | 计划任务总结，已不使用 |
| `QUICK_INSTALL.md` | 🗑️ 删除 | 快速安装，已过时 |
| `GATEWAY_SETUP.md` | 🗑️ 删除 | 网关设置，已不使用 |

**保留**:
- ✅ `AGENTS.md` - 工作区说明
- ✅ `SOUL.md` - 助手身份
- ✅ `USER.md` - 用户信息
- ✅ `TOOLS.md` - 工具笔记
- ✅ `IDENTITY.md` - 助手身份
- ✅ `HEARTBEAT.md` - 心跳配置

---

### 9️⃣ 其他冗余文件

| 文件 | 建议 | 理由 |
|------|------|------|
| `.gitignore_README.md` | 🗑️ 删除 | .gitignore 说明，非必需 |

---

## 📋 清理清单

### 根目录删除清单（24 个文件）

```
TEST_REPORT_2026-03-05.md
TEST_SUMMARY.md
TEST_SUMMARY_GARBAGE_FIX.md
TEST_REPORT_HARD_DROP_FIX_2026-03-06.md
test-plan-harddrop.md
TEST_REPORT_DECK_PILE_MODE.md
TEST_REPORT_DECK_CLEANUP_VERIFICATION.md
DECK_FIX_REPORT.md
DECK_IMPLEMENTATION_SUMMARY.md
SIMPLIFICATION_REPORT.md
CODE_REVIEW_DECK_CLEANUP.md
DECK_MODE_FLOW.md
DECK_PILE_FLOW.md
DECK_QUICK_REFERENCE.md
DECK_SYSTEM.md
RELEASE_v1.0.1.md
RELEASE_v1.3.0.md
RELEASE_v1.3.1.md
RELEASE_v1.3.2.md
RELEASE_v1.4.0.md
PLAN_v1.5.0.md
PERFORMANCE_REPORT.md
CODE_QUALITY_REPORT.md
.gitignore_README.md
```

### 文件夹删除清单（6 个文件夹）

```
cyber-shopkeeper/
fishing-game/
garden-world/
multi-agent-chatroom/
openclaw-plugin-agent-mention/
gateway-tray/
```

### docs/ 目录清理

```
# 保留
v1.5.0-enemy-types-implementation.md ✅
v1.5.0-battle-ui-enhancement.md ✅

# 删除（如果有旧文档）
```

### reports/ 目录清理

```
# 保留
TEST_REPORT_v1.5.0_final.md ✅
CODE_REVIEW_v1.5.0_phase1.md ✅

# 删除（如果有旧报告）
```

---

## 🎯 清理后文件结构

### 保留的核心文档

**根目录**:
```
README.md              - 项目说明
RELEASE_v1.5.0.md      - 最新版本发布
RELEASE_STATUS.md      - 版本历史
TASK_TRACKER.md        - 任务跟踪
MEMORY.md              - 长期记忆和流程
```

**配置文件**:
```
AGENTS.md              - 工作区说明
SOUL.md                - 助手身份
USER.md                - 用户信息
TOOLS.md               - 工具笔记
IDENTITY.md            - 助手身份
HEARTBEAT.md           - 心跳配置
```

**docs/**:
```
v1.5.0-enemy-types-implementation.md
v1.5.0-battle-ui-enhancement.md
```

**reports/**:
```
TEST_REPORT_v1.5.0_final.md
CODE_REVIEW_v1.5.0_phase1.md
```

---

## 📊 预计清理效果

| 类别 | 删除数量 | 释放空间（估计） |
|------|---------|-----------------|
| 根目录文件 | 24 个 | ~100 KB |
| 废弃文件夹 | 6 个 | ~500 KB |
| 临时文件 | 若干 | ~50 KB |
| **总计** | **30+ 个** | **~650 KB** |

---

## ⚠️ 注意事项

1. **备份重要数据** - 清理前确认无重要数据
2. **检查.gitignore** - 确保 `dist/`, `logs/` 已加入
3. **保留核心文档** - 确保最新报告已保存
4. **提交前验证** - 清理后运行测试确保无影响

---

## 🔧 清理命令

```bash
# 删除根目录冗余文件
git rm TEST_REPORT_2026-03-05.md
git rm TEST_SUMMARY.md
# ... (其他文件)

# 删除废弃文件夹
git rm -r cyber-shopkeeper/
git rm -r fishing-game/
# ... (其他文件夹)

# 提交清理
git commit -m "chore: 清理冗余文件和废弃项目"
git push origin main
```

---

**创建者**: 千束 (首席游戏设计师)  
**日期**: 2026-03-08  
**状态**: 📋 待执行
