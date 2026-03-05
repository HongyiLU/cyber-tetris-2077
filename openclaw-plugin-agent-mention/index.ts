// OpenClaw Agent Mention Plugin
// 多助手@功能插件 - 完整版（带@指令列表功能）

// 助手信息
const AGENTS = {
  main: {
    id: "main",
    name: "千束",
    role: "首席游戏设计师",
    emoji: "🎮",
    description: "主助手，负责游戏设计和项目整合",
    workspace: "~/.openclaw/workspace"
  },
  artist: {
    id: "artist",
    name: "彩虹",
    role: "首席艺术设计师",
    emoji: "🎨",
    description: "艺术设计师，负责美术、UI、视觉效果",
    workspace: "~/.openclaw/workspace-artist"
  },
  coder: {
    id: "coder",
    name: "代码",
    role: "高级程序员",
    emoji: "💻",
    description: "程序员，负责代码实现和技术架构",
    workspace: "~/.openclaw/workspace-coder"
  },
  manager: {
    id: "manager",
    name: "管家",
    role: "项目经理",
    emoji: "📊",
    description: "项目经理，负责项目管理和协调",
    workspace: "~/.openclaw/workspace-manager"
  }
};

export default function register(api) {
  console.log("🔌 Agent Mention Plugin loaded!");

  // 0. 注册@指令列表工具
  api.registerTool({
    name: "list_mentions",
    label: "列出@指令",
    description: "查看所有可用的@指令和助手信息。当你想知道可以@谁时，用这个工具！",
    parameters: {
      type: "object",
      properties: {},
      required: []
    },
    async execute(_id, params) {
      let helpText = "📋 可用的@指令列表：\n\n";
      
      Object.values(AGENTS).forEach(agent => {
        helpText += `${agent.emoji} **@${agent.id}** - ${agent.name} (${agent.role})\n`;
        helpText += `   ${agent.description}\n\n`;
      });
      
      helpText += "💡 使用方式：\n";
      helpText += "1. 使用 `list_mentions` 查看所有可用指令\n";
      helpText += "2. 使用 `mention_agent` 召唤任意助手\n";
      helpText += "3. 使用 `at_artist`、`at_coder`、`at_manager` 快捷召唤\n";
      
      return {
        content: [{
          type: "text",
          text: helpText
        }]
      };
    }
  }, { optional: false });

  // 1. 注册通用召唤工具
  api.registerTool({
    name: "mention_agent",
    label: "召唤助手",
    description: "召唤特定助手来处理任务 - 使用 @artist、@coder、@manager 等。注意：这会生成一个sessions_spawn命令供你使用。",
    parameters: {
      type: "object",
      properties: {
        agent: {
          type: "string",
          description: "要召唤的助手",
          enum: ["main", "artist", "coder", "manager"]
        },
        task: {
          type: "string",
          description: "给该助手的任务描述"
        }
      },
      required: ["agent", "task"]
    },
    async execute(_id, params) {
      const agentId = params.agent;
      const task = params.task;
      const agent = AGENTS[agentId];

      if (!agent) {
        return {
          content: [{
            type: "text",
            text: `❌ 未知的助手: ${agentId}\n\n💡 用 \`list_mentions\` 查看所有可用的@指令！`
          }]
        };
      }

      console.log(`👥 召唤助手: ${agentId}`);
      console.log(`📋 任务: ${task}`);

      // 生成sessions_spawn命令提示
      const sessionsSpawnCommand = `sessions_spawn(task="${task}", label="${agent.name}-task", runtime="subagent", mode="session")`;

      return {
        content: [{
          type: "text",
          text: `${agent.emoji} ${agent.name} (${agent.role}) 准备处理任务！\n\n📋 任务: ${task}\n\n💡 提示: 使用以下命令来创建一个子代理会话让${agent.name}处理：\n\n\`\`\`\n${sessionsSpawnCommand}\n\`\`\`\n\n或者，你可以直接说"让${agent.name}来..."，我会帮你协调！`
        }]
      };
    }
  }, { optional: false });

  // 2. 注册快捷工具 - @artist
  api.registerTool({
    name: "at_artist",
    label: "@artist 彩虹",
    description: "召唤艺术设计师助手 - @artist。这会生成一个命令让你用sessions_spawn创建子代理。",
    parameters: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "给艺术设计师的任务"
        }
      },
      required: ["task"]
    },
    async execute(_id, params) {
      const task = params.task;
      const agent = AGENTS.artist;
      
      const sessionsSpawnCommand = `sessions_spawn(task="${task}", label="artist-task", runtime="subagent", mode="session")`;
      
      return {
        content: [{
          type: "text",
          text: `${agent.emoji} ${agent.name} (${agent.role}) 准备处理美术任务！\n\n📋 任务: ${task}\n\n💡 提示: 用这个命令创建子代理：\n\n\`\`\`\n${sessionsSpawnCommand}\n\`\`\`\n\n或者，把你的需求告诉我，我来帮你协调！`
        }]
      };
    }
  }, { optional: false });

  // 3. 注册快捷工具 - @coder
  api.registerTool({
    name: "at_coder",
    label: "@coder 代码",
    description: "召唤程序员助手 - @coder。这会生成一个命令让你用sessions_spawn创建子代理。",
    parameters: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "给程序员的任务"
        }
      },
      required: ["task"]
    },
    async execute(_id, params) {
      const task = params.task;
      const agent = AGENTS.coder;
      
      const sessionsSpawnCommand = `sessions_spawn(task="${task}", label="coder-task", runtime="subagent", mode="session")`;
      
      return {
        content: [{
          type: "text",
          text: `${agent.emoji} ${agent.name} (${agent.role}) 准备处理技术任务！\n\n📋 任务: ${task}\n\n💡 提示: 用这个命令创建子代理：\n\n\`\`\`\n${sessionsSpawnCommand}\n\`\`\`\n\n或者，把你的需求告诉我，我来帮你协调！`
        }]
      };
    }
  }, { optional: false });

  // 4. 注册快捷工具 - @manager
  api.registerTool({
    name: "at_manager",
    label: "@manager 管家",
    description: "召唤项目经理助手 - @manager。这会生成一个命令让你用sessions_spawn创建子代理。",
    parameters: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "给项目经理的任务"
        }
      },
      required: ["task"]
    },
    async execute(_id, params) {
      const task = params.task;
      const agent = AGENTS.manager;
      
      const sessionsSpawnCommand = `sessions_spawn(task="${task}", label="manager-task", runtime="subagent", mode="session")`;
      
      return {
        content: [{
          type: "text",
          text: `${agent.emoji} ${agent.name} (${agent.role}) 准备处理管理任务！\n\n📋 任务: ${task}\n\n💡 提示: 用这个命令创建子代理：\n\n\`\`\`\n${sessionsSpawnCommand}\n\`\`\`\n\n或者，把你的需求告诉我，我来帮你协调！`
        }]
      };
    }
  }, { optional: false });

  console.log("✅ Agent Mention Plugin tools registered!");
  console.log("📝 可用工具: list_mentions, mention_agent, at_artist, at_coder, at_manager");
}
