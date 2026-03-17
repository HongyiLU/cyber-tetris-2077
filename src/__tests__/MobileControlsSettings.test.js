import { jsx as _jsx } from "react/jsx-runtime";
// ==================== MobileControlsSettings 组件测试 ====================
import { render, screen, fireEvent } from '@testing-library/react';
import MobileControlsSettingsPanel from '../components/ui/MobileControlsSettings';
describe('MobileControlsSettingsPanel', () => {
    const mockOnClose = jest.fn();
    const mockOnSettingsChange = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });
    it('渲染标题', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        expect(screen.getByText('📱 虚拟按键设置')).toBeInTheDocument();
    });
    it('渲染启用/禁用切换按钮', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        expect(screen.getByText('启用虚拟按键')).toBeInTheDocument();
        expect(screen.getByText('已启用')).toBeInTheDocument();
    });
    it('点击切换按钮改变启用状态', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const toggleButton = screen.getByText('已启用');
        fireEvent.click(toggleButton);
        expect(screen.getByText('已禁用')).toBeInTheDocument();
    });
    it('渲染尺寸选择按钮', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        expect(screen.getByText('小')).toBeInTheDocument();
        expect(screen.getByText('中')).toBeInTheDocument();
        expect(screen.getByText('大')).toBeInTheDocument();
    });
    it('默认选中中尺寸', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const mediumButton = screen.getByText('中');
        expect(mediumButton).toHaveStyle('border-color: #00ffff');
        expect(mediumButton).toHaveStyle('color: #00ffff');
    });
    it('点击尺寸按钮改变尺寸', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const smallButton = screen.getByText('小');
        fireEvent.click(smallButton);
        expect(smallButton).toHaveStyle('border-color: #00ffff');
        expect(smallButton).toHaveStyle('color: #00ffff');
    });
    it('渲染透明度滑块', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const slider = screen.getByRole('slider');
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveValue('90'); // 默认 90%
    });
    it('改变透明度滑块', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '70' } });
        expect(screen.getByText('透明度：70%')).toBeInTheDocument();
    });
    it('渲染透明度预览', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        expect(screen.getByText('预览')).toBeInTheDocument();
    });
    it('渲染重置按钮', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        expect(screen.getByText('🔄 重置为默认值')).toBeInTheDocument();
    });
    it('点击重置按钮恢复默认设置', () => {
        // 先修改设置
        localStorage.setItem('mobileControlsSettings', JSON.stringify({
            enabled: false,
            size: 'small',
            opacity: 0.5,
        }));
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const resetButton = screen.getByText('🔄 重置为默认值');
        fireEvent.click(resetButton);
        // 重新渲染查看默认值
        expect(screen.getByText('已启用')).toBeInTheDocument();
        expect(screen.getByText('中')).toHaveStyle('color: #00ffff');
    });
    it('渲染关闭按钮', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        expect(screen.getByText('关闭')).toBeInTheDocument();
    });
    it('点击关闭按钮调用 onClose', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const closeButton = screen.getByText('关闭');
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });
    it('从 localStorage 加载设置', () => {
        localStorage.setItem('mobileControlsSettings', JSON.stringify({
            enabled: false,
            size: 'large',
            opacity: 0.6,
        }));
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        expect(screen.getByText('已禁用')).toBeInTheDocument();
        expect(screen.getByText('大')).toHaveStyle('color: #00ffff');
        expect(screen.getByText('透明度：60%')).toBeInTheDocument();
    });
    it('保存设置到 localStorage', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose, onSettingsChange: mockOnSettingsChange }));
        // 改变尺寸
        const smallButton = screen.getByText('小');
        fireEvent.click(smallButton);
        // 验证设置被保存
        const saved = localStorage.getItem('mobileControlsSettings');
        expect(saved).toBeTruthy();
        const parsed = JSON.parse(saved);
        expect(parsed.size).toBe('small');
    });
    it('显示正确的尺寸提示', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        expect(screen.getByText('中尺寸 (50px) - 默认推荐')).toBeInTheDocument();
    });
    it('显示小尺寸提示', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const smallButton = screen.getByText('小');
        fireEvent.click(smallButton);
        expect(screen.getByText('小尺寸 (40px) - 适合小屏幕')).toBeInTheDocument();
    });
    it('显示大尺寸提示', () => {
        render(_jsx(MobileControlsSettingsPanel, { onClose: mockOnClose }));
        const largeButton = screen.getByText('大');
        fireEvent.click(largeButton);
        expect(screen.getByText('大尺寸 (60px) - 适合大屏幕')).toBeInTheDocument();
    });
});
