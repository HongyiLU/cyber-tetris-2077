// ==================== 渲染工具函数 ====================
/**
 * 绘制单个方块
 * @param ctx - Canvas 上下文
 * @param x - X 坐标（网格单位）
 * @param y - Y 坐标（网格单位）
 * @param size - 方块大小（像素）
 * @param color - 方块颜色
 */
export function drawBlock(ctx, x, y, size, color) {
    // 填充
    ctx.fillStyle = color;
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    // 高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, 3);
    ctx.fillRect(x * size + 1, y * size + 1, 3, size - 2);
    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * size + size - 4, y * size + 1, 3, size - 2);
    ctx.fillRect(x * size + 1, y * size + size - 4, size - 2, 3);
    // 发光效果
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x * size + 2, y * size + 2, size - 4, size - 4);
    ctx.shadowBlur = 0;
}
/**
 * 绘制网格
 * @param ctx - Canvas 上下文
 * @param cols - 列数
 * @param rows - 行数
 * @param blockSize - 方块大小
 * @param color - 网格颜色
 */
export function drawGrid(ctx, cols, rows, blockSize, color = 'rgba(0, 255, 255, 0.1)') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    // 绘制垂直线
    for (let i = 0; i <= cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * blockSize, 0);
        ctx.lineTo(i * blockSize, rows * blockSize);
        ctx.stroke();
    }
    // 绘制水平线
    for (let i = 0; i <= rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * blockSize);
        ctx.lineTo(cols * blockSize, i * blockSize);
        ctx.stroke();
    }
}
/**
 * 清空画布
 * @param ctx - Canvas 上下文
 * @param width - 画布宽度
 * @param height - 画布高度
 * @param color - 背景颜色
 */
export function clearCanvas(ctx, width, height, color = '#0a0a0f') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
}
/**
 * 绘制虚影方块（用于显示下落位置预测）
 * @param ctx - Canvas 上下文
 * @param x - X 坐标（网格单位）
 * @param y - Y 坐标（网格单位）
 * @param size - 方块大小（像素）
 * @param color - 方块颜色
 */
export function drawGhostBlock(ctx, x, y, size, color) {
    // 虚影填充（半透明）
    ctx.fillStyle = hexToRgba(color, 0.2);
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    // 虚影边框
    ctx.strokeStyle = hexToRgba(color, 0.5);
    ctx.lineWidth = 2;
    ctx.strokeRect(x * size + 2, y * size + 2, size - 4, size - 4);
    // 虚影网格效果
    ctx.fillStyle = hexToRgba(color, 0.1);
    ctx.fillRect(x * size + 5, y * size + 5, size - 10, size - 10);
}
/**
 * 十六进制颜色转 RGBA
 * @param hex - 十六进制颜色
 * @param alpha - 透明度
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
