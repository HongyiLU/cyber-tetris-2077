# 🔌 OpenClaw Agent Mention Plugin

多助手@功能插件 - 让你可以通过@artist、@coder等方式直接召唤对应的助手！

## ✨ 功能

- 🎯 **@main** - 召唤主助手千束
- 🎨 **@artist** - 召唤艺术设计师彩虹
- 💻 **@coder** - 召唤程序员代码
- 📊 **@manager** - 召唤项目经理管家
- 🔧 **mention_agent** - 通用召唤工具

---

## 📦 安装

```bash
# 进入插件目录
cd openclaw-plugin-agent-mention

# 安装依赖（如果需要）
npm install

# 安装插件到OpenClaw
openclaw plugins install .
```

---

## 🚀 使用

### 在对话中使用
当你说 `@artist 帮我设计...`，插件会自动识别并召唤对应的助手！

### 可用的@命令
- `@artist` - 艺术设计师
- `@coder` - 程序员
- `@manager` - 项目经理
- `@main` - 主助手

---

## 📁 文件结构

```
openclaw-plugin-agent-mention/
├── openclaw.plugin.json    # 插件清单（必需）
├── index.ts                # 插件主文件
└── README.md               # 说明文档
```

---

## 🔧 开发说明

### 插件清单 (openclaw.plugin.json)
- `id`: 插件唯一ID
- `name`: 插件名称
- `description`: 插件描述
- `version`: 版本号
- `configSchema`: 配置验证的JSON Schema

### 主文件 (index.ts)
- 使用 `api.registerTool()` 注册工具
- 可以注册多个工具
- 工具可以是必需的或可选的

---

## 📝 注意事项

这是一个**开发中的插件原型**！要真正使用，还需要：
1. 完善TypeScript代码
2. 测试和调试
3. 与OpenClaw的agents系统集成
4. 实际的@功能解析逻辑

---

*插件创建时间: 2026-03-01* 🔌✨
