// 多助手聊天室 - 聊天管理模块

const Chat = {
    messages: [],
    messagesContainer: null,

    /**
     * 初始化聊天模块
     */
    init() {
        this.messagesContainer = document.getElementById('messages');
        this.loadMessages();
    },

    /**
     * 从本地存储加载消息
     */
    loadMessages() {
        this.messages = Storage.getMessages();
        
        // 如果没有消息，添加欢迎消息
        if (this.messages.length === 0) {
            this.addWelcomeMessages();
        }
        
        this.renderMessages();
    },

    /**
     * 添加欢迎消息
     */
    addWelcomeMessages() {
        const welcomes = Agents.getWelcomeMessages();
        const now = Date.now();
        
        welcomes.forEach((welcome, index) => {
            this.messages.push({
                id: `welcome-${welcome.id}`,
                agentId: welcome.id,
                text: welcome.message,
                timestamp: now + index * 1000
            });
        });
        
        Storage.saveMessages(this.messages);
    },

    /**
     * 发送消息
     */
    sendMessage(text, mentionAgentId = null) {
        if (!text.trim()) {
            return;
        }

        // 创建用户消息
        const userMessage = {
            id: `msg-${Date.now()}-user`,
            agentId: 'user',
            text: text,
            timestamp: Date.now()
        };

        this.messages.push(userMessage);
        Storage.addMessage(userMessage);
        this.renderMessages();

        // 如果@了特定助手，让该助手回复
        if (mentionAgentId && mentionAgentId !== '') {
            this.simulateAgentReply(mentionAgentId, text);
        } else {
            // 如果没有@，让千束（主助手）回复
            this.simulateAgentReply('main', text);
        }
    },

    /**
     * 模拟助手回复
     */
    simulateAgentReply(agentId, userText) {
        const agent = Agents.get(agentId);
        if (!agent) {
            return;
        }

        // 显示"正在输入"的提示
        this.showTypingIndicator(agentId);

        // 延迟一段时间后显示回复（模拟真实对话）
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const replyText = this.generateReply(agentId, userText);
            
            const agentMessage = {
                id: `msg-${Date.now()}-${agentId}`,
                agentId: agentId,
                text: replyText,
                timestamp: Date.now()
            };

            this.messages.push(agentMessage);
            Storage.addMessage(agentMessage);
            this.renderMessages();
        }, 1500 + Math.random() * 1500);
    },

    /**
     * 生成回复内容
     */
    generateReply(agentId, userText) {
        const agent = Agents.get(agentId);
        
        const replies = {
            main: [
                `好的！这个想法很棒！让我来协调大家处理这个需求。`,
                `收到！我来安排一下，看看谁来处理最合适。`,
                `好的，我理解了！让我们一步步来实现这个。`,
                `这个项目很有意思！我来做整体规划。`
            ],
            artist: [
                `美术设计交给我！需要什么风格？像素风、手绘、还是赛博朋克？`,
                `好的！我来负责视觉部分！配色方案和UI设计我来搞定！`,
                `收到！让我先构思几个概念草图给你看！`
            ],
            coder: [
                `技术实现我来！用HTML/CSS/JS没问题，或者你想用其他框架？`,
                `好的！代码架构我来设计，保证代码质量和性能！`,
                `收到！我先写个技术方案，然后开始实现！`
            ],
            manager: [
                `项目管理我来！我会做好进度追踪和协调工作！`,
                `好的！我来制定项目计划，分解任务，追踪进度！`,
                `收到！让我先做个项目规划文档！`
            ]
        };

        const agentReplies = replies[agentId] || replies.main;
        return agentReplies[Math.floor(Math.random() * agentReplies.length)];
    },

    /**
     * 显示正在输入提示
     */
    showTypingIndicator(agentId) {
        const agent = Agents.get(agentId);
        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = `message message-${agentId}`;
        indicator.innerHTML = `
            <div class="message-avatar">${agent.emoji}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-name">${agent.name}</span>
                </div>
                <div class="message-text">正在输入...</div>
            </div>
        `;
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    },

    /**
     * 隐藏正在输入提示
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    /**
     * 渲染所有消息
     */
    renderMessages() {
        this.messagesContainer.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageEl = this.createMessageElement(message);
            this.messagesContainer.appendChild(messageEl);
        });
        
        this.scrollToBottom();
    },

    /**
     * 创建消息元素
     */
    createMessageElement(message) {
        const agent = Agents.get(message.agentId);
        const time = new Date(message.timestamp);
        const timeStr = time.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const messageEl = document.createElement('div');
        messageEl.className = `message message-${message.agentId}`;
        messageEl.innerHTML = `
            <div class="message-avatar">${agent.emoji}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-name">${agent.name}</span>
                    <span class="message-time">${timeStr}</span>
                </div>
                <div class="message-text">${this.escapeHtml(message.text)}</div>
            </div>
        `;
        
        return messageEl;
    },

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    },

    /**
     * 清空所有消息
     */
    clearAll() {
        if (confirm('确定要清空所有聊天记录吗？')) {
            Storage.clearMessages();
            this.messages = [];
            this.addWelcomeMessages();
            this.renderMessages();
        }
    }
};
