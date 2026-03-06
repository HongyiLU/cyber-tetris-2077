// ==================== Jest 测试环境配置 ====================

import '@testing-library/jest-dom';

// 模拟 Canvas API
class MockCanvasElement {
  getContext() {
    return {
      fillStyle: '',
      fillRect: () => {},
      strokeStyle: '',
      lineWidth: 0,
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      shadowColor: '',
      shadowBlur: 0,
      strokeRect: () => {},
    };
  }
}

// 模拟 HTMLCanvasElement
global.HTMLCanvasElement = MockCanvasElement as any;
