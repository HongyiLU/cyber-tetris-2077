// 工具函数库

/**
 * 生成随机数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 生成随机整数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机整数
 */
function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

/**
 * 从数组中随机选择一个元素
 * @param {Array} array - 数组
 * @returns {*} 随机元素
 */
function randomChoice(array) {
    return array[randomInt(0, array.length - 1)];
}

/**
 * 基于权重的随机选择
 * @param {Array} items - 选项数组
 * @param {Array} weights - 权重数组
 * @returns {*} 选中的元素
 */
function weightedRandomChoice(items, weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomValue = random(0, totalWeight);
    
    for (let i = 0; i < items.length; i++) {
        randomValue -= weights[i];
        if (randomValue <= 0) {
            return items[i];
        }
    }
    
    return items[items.length - 1];
}

/**
 * 限制数值在范围内
 * @param {number} value - 数值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的数值
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * 线性插值
 * @param {number} start - 起始值
 * @param {number} end - 结束值
 * @param {number} t - 插值参数 (0-1)
 * @returns {number} 插值结果
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

/**
 * 格式化重量
 * @param {number} weight - 重量 (克)
 * @returns {string} 格式化的重量字符串
 */
function formatWeight(weight) {
    if (weight >= 1000) {
        return (weight / 1000).toFixed(2) + ' kg';
    }
    return weight.toFixed(0) + ' g';
}

/**
 * 格式化货币
 * @param {number} amount - 金额
 * @returns {string} 格式化的货币字符串
 */
function formatCoins(amount) {
    return amount.toLocaleString();
}

/**
 * 获取稀有度名称
 * @param {string} rarity - 稀有度标识
 * @returns {string} 稀有度名称
 */
function getRarityName(rarity) {
    const rarityNames = {
        'common': '普通',
        'uncommon': ' uncommon',
        'rare': '稀有',
        'epic': '史诗',
        'legendary': '传说'
    };
    return rarityNames[rarity] || rarity;
}

/**
 * 保存数据到localStorage
 * @param {string} key - 键名
 * @param {*} data - 数据
 */
function saveData(key, data) {
    try {
        localStorage.setItem('fishing_' + key, JSON.stringify(data));
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

/**
 * 从localStorage加载数据
 * @param {string} key - 键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 加载的数据
 */
function loadData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem('fishing_' + key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('加载数据失败:', e);
        return defaultValue;
    }
}

/**
 * 防抖函数
 * @param {Function} func - 函数
 * @param {number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 函数
 * @param {number} limit - 限制时间
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
