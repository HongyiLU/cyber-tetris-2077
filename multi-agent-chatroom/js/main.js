// 多助手聊天室 - 主入口文件

document.addEventListener('DOMContentLoaded', function() {
    // 初始化各个模块
    Chat.init();

    // 获取DOM元素
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const mentionSelect = document.getElementById('mentionSelect');
    const settingsBtn = document.getElementById('settingsBtn');

    // 发送按钮点击
    sendBtn.addEventListener('click', sendMessage);

    // 输入框回车发送
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 设置按钮点击
    settingsBtn.addEventListener('click', function() {
        if (confirm('设置面板开发中...\n\n是否要清空所有聊天记录？')) {
            Chat.clearAll();
        }
    });

    /**
     * 发送消息
     */
    function sendMessage() {
        const text = messageInput.value.trim();
        const mentionAgentId = mentionSelect.value;

        if (text) {
            Chat.sendMessage(text, mentionAgentId);
            messageInput.value = '';
            mentionSelect.value = '';
            messageInput.focus();
        }
    }

    // 输入框自动聚焦
    messageInput.focus();

    console.log('🏠 多助手聊天室已加载！');
    console.log('👥 可用助手: 千束、彩虹、代码、管家');
});
