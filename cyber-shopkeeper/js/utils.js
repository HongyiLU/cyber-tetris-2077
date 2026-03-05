// 赛博朋克掌柜 - 工具函数

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function formatCash(amount) {
    return amount.toLocaleString();
}

function saveData(key, data) {
    try {
        localStorage.setItem('cyber_' + key, JSON.stringify(data));
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem('cyber_' + key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('加载数据失败:', e);
        return defaultValue;
    }
}
