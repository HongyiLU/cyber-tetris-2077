# 👥 OpenClaw 多助手使用指南

## 🚀 如何创建多个助手

OpenClaw支持创建多个独立的助手，每个助手有独立的工作区、身份和配置！

---

## 📋 可用的agents命令

### 1. 列出所有助手
```bash
openclaw agents list
```

### 2. 添加新助手
```bash
openclaw agents add <助手名称> --workspace <工作区路径>
```

### 3. 删除助手
```bash
openclaw agents delete <助手名称>
```

### 4. 设置助手身份
```bash
openclaw agents set-identity <助手名称>
```

### 5. 查看路由绑定
```bash
openclaw agents bindings
```

---

## 🎯 完整示例

### 创建一个艺术设计师助手

1. **创建工作区**
```bash
mkdir "C:\Users\hongyi lu\.openclaw\workspace-artist"
```

2. **添加助手**
```bash
openclaw agents add artist --workspace "C:\Users\hongyi lu\.openclaw\workspace-artist"
```

3. **查看助手列表**
```bash
openclaw agents list
```

4. **设置助手身份** (可选)
```bash
openclaw agents set-identity artist
```

---

## 🏗️ 建议的助手配置

### 方案1：按角色分工
- **main** - 主助手（千束）- 首席游戏设计师
- **artist** - 艺术设计师 - 负责美术、视觉设计
- **coder** - 程序员助手 - 负责代码、技术实现
- **manager** - 项目经理 - 负责项目管理

### 方案2：按项目分工
- **main** - 主助手
- **fishing** - 钓鱼游戏项目
- **garden** - 花园经营项目
- **cyber** - 赛博朋克掌柜项目

---

## 📌 注意事项

1. **每个助手有独立的工作区** - 互不干扰
2. **每个助手有独立的身份** - IDENTITY.md, SOUL.md等
3. **每个助手有独立的内存** - 不会共享记忆
4. **可以通过--profile切换** - 使用--profile参数

---

## 💡 使用技巧

### 快速查看当前助手
```bash
openclaw agents list
```

### 查看主文档
```bash
openclaw agents --help
```

---

*创建时间: 2026-03-01* 👥
