# 👥 多助手协作指南

## 🎯 如何让多个助手一起工作

---

## 方法1: 使用子代理 (Subagents) - 推荐

### 生成子代理会话
```
使用 sessions_spawn 工具可以创建一个独立的子代理会话！
```

### 参数说明
- **task**: 给子代理的任务描述
- **label**: 子代理的标签/名称
- **runtime**: 运行时类型（"subagent" 或 "acp"）
- **mode**: 运行模式（"run" 一次性或 "session" 持久会话）

### 示例
让 artist 助手设计某个美术风格：
```
使用 sessions_spawn 创建一个子代理，task="设计一个赛博朋克风格的UI界面", label="artist-design", runtime="subagent", mode="session"
```

---

## 方法2: 使用 agents bind 绑定

### 绑定特定对话到特定助手
```bash
openclaw agents bind --agent <助手名称> --bind <频道>
```

### 示例
绑定某个聊天到 artist 助手：
```bash
openclaw agents bind --agent artist --bind webchat
```

---

## 方法3: 通过主助手协调（当前方式）

### 主助手作为协调者
- main 助手（千束）作为项目经理
- 当需要专业技能时，描述需求给对应的专业助手
- 通过文档和文件来传递工作成果

### 工作流程示例
1. **main 助手** - 设计游戏概念和玩法
2. **main 助手** - 创建美术需求文档到 workspace-artist
3. 你手动切换到 artist 助手工作区让 artist 完成美术
4. **main 助手** - 创建技术需求文档到 workspace-coder
5. 你手动切换到 coder 助手工作区让 coder 完成代码
6. **main 助手** - 整合和测试最终产品

---

## 📋 当前可用的工具

### 1. sessions_spawn
- 功能: 生成独立的子代理会话
- 用途: 让特定助手执行特定任务

### 2. subagents
- 功能: 列出、管理子代理
- 用途: 查看和控制正在运行的子代理

### 3. agents bind/unbind
- 功能: 绑定/解绑特定对话到特定助手
- 用途: 将特定频道的对话路由给特定助手

---

## 💡 推荐的协作模式

### 对于当前的助手团队

| 助手 | 角色 | 擅长任务 |
|------|------|----------|
| 🎮 main | 主设计师 | 创意设计、玩法设计、项目整合 |
| 🎨 artist | 艺术设计师 | 美术、UI、视觉效果、像素风格 |
| 💻 coder | 程序员 | 代码实现、架构设计、技术优化 |
| 📊 manager | 项目经理 | 项目管理、进度规划、协调 |

---

## 🚀 快速开始

想试试看协作吗？可以：
1. 让我用 sessions_spawn 创建一个子代理试试！
2. 或者告诉我你想要哪个助手做什么任务！

---

*创建时间: 2026-03-01* 👥✨
