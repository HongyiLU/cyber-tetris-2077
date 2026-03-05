// ==================== 渲染工具函数 ====================

/**
 * 绘制单个方块
 * @param ctx - Canvas 上下文
 * @param x - X 坐标（网格单位）
 * @param y - Y 坐标（网格单位）
 * @param size - 方块大小（像素）
 * @param color - 方块颜色
 */
export function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
): void {
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
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  blockSize: number,
  color: string = 'rgba(0, 255, 255, 0.1)'
): void {
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
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string = '#0a0a0f'
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}
