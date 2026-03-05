# 🔌 Agent Mention Plugin - 完整设计文档

## 🎯 插件愿景

让用户可以通过 `@artist`、`@coder`、`@manager` 等方式，直接在聊天中召唤对应的专业助手！

---

## 📋 功能规划

### 阶段1: 基础工具 (MVP)
- [ ] `mention_agent` - 通用召唤工具
- [ ] `@artist` - 快捷召唤艺术设计师
- [ ] `@coder` - 快捷召唤程序员
- [ ] `@manager` - 快捷召唤项目经理
- [ ] `@main` - 快捷召唤主助手

### 阶段2: 深度集成
- [ ] 自动解析消息中的@mention
- [ ] 与OpenClaw agents系统集成
- [ ] 自动创建子代理会话
- [ ] 结果自动返回

### 阶段3: 高级功能
- [ ] 多助手同时协作
- [ ] 助手间对话
- [ ] 任务分配和追踪
- [ ] 结果整合

---

## 💻 技术实现

### 插件结构
```
openclaw-plugin-agent-mention/
├── openclaw.plugin.json    # 插件清单
├── package.json            # npm包配置
├── tsconfig.json           # TypeScript配置
├── src/
│   ├── index.ts           # 插件入口
│   ├── mention-tool.ts    # @工具实现
│   ├── agent-router.ts    # 助手路由
│   └── types.ts          # 类型定义
└── README.md
```

### 核心API使用
```typescript
// 注册工具
api.registerTool(toolDefinition, { optional: false });

// 访问插件配置
const config = api.pluginConfig;

// 访问OpenClaw配置
const config = api.config;
```

---

## 🚀 使用示例

### 用户对话
```
用户: @artist 帮我设计一个像素风角色
插件: [自动识别@artist，创建artist子代理，执行任务]
```

### 工具使用
```typescript
// 调用mention_agent工具
{
  agent: "artist",
  task: "设计一个像素风角色"
}
```

---

## 📝 开发状态

- ✅ 插件清单创建
- ✅ 基础工具框架
- ✅ 设计文档完成
- ⏳ TypeScript实现 (需要开发环境)
- ⏳ 测试和调试
- ⏳ 发布和部署

---

*设计文档完成时间: 2026-03-01* 🔌✨
