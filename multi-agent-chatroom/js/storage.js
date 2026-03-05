// 多助手聊天室 - 本地存储模块

const STORAGE_KEY = 'multi-agent-chatroom-messages';

const Storage = {
    /**
     * 获取所有消息
     */
    getMessages() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('读取消息失败:', error);
            return [];
        }
    },

    /**
     * 保存所有消息
     */
    saveMessages(messages) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error('保存消息失败:', error);
        }
    },

    /**
     * 添加一条消息
     */
    addMessage(message) {
        const messages = this.getMessages();
        messages.push(message);
        this.saveMessages(messages);
        return messages;
    },

    /**
     * 清空所有消息
     */
    clearMessages() {
        localStorage.removeItem(STORAGE_KEY);
    }
};
