// 多助手聊天室 - 助手管理模块

const Agents = {
    // 所有助手的信息
    list: {
        main: {
            id: 'main',
            name: '千束',
            role: '首席游戏设计师',
            emoji: '🎮',
            color: '#FF6B35',
            description: '主协调、游戏设计',
            welcomeMessage: '大家好！我是千束，首席游戏设计师。今天我们要做什么项目呢？'
        },
        artist: {
            id: 'artist',
            name: '彩虹',
            role: '首席艺术设计师',
            emoji: '🎨',
            color: '#FF69B4',
            description: '美术、UI、视觉效果',
            welcomeMessage: '我是彩虹！艺术设计师！需要什么风格的美术设计？像素风、手绘、还是赛博朋克？'
        },
        coder: {
            id: 'coder',
            name: '代码',
            role: '高级程序员',
            emoji: '💻',
            color: '#4A90E2',
            description: '代码实现、技术架构',
            welcomeMessage: '代码来报道！技术方案我来搞定！用什么技术栈？HTML/CSS/JS还是其他？'
        },
        manager: {
            id: 'manager',
            name: '管家',
            role: '项目经理',
            emoji: '📊',
            color: '#7ED321',
            description: '项目管理、协调',
            welcomeMessage: '管家在此！我来做项目规划和进度追踪！大家准备好开始了吗？'
        },
        user: {
            id: 'user',
            name: '用户',
            role: '项目发起人',
            emoji: '👤',
            color: '#9013FE',
            description: '提出需求、反馈'
        }
    },

    /**
     * 获取助手信息
     */
    get(agentId) {
        return this.list[agentId];
    },

    /**
     * 获取所有助手列表（除了用户）
     */
    getAllAgents() {
        return Object.values(this.list).filter(a => a.id !== 'user');
    },

    /**
     * 生成欢迎消息
     */
    getWelcomeMessages() {
        return this.getAllAgents().map(agent => ({
            id: agent.id,
            name: agent.name,
            message: agent.welcomeMessage
        }));
    }
};
