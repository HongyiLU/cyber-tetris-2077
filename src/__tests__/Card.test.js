import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card, { createCard } from '../components/ui/Card';
describe('Card Component', () => {
    // 测试用卡牌数据
    const testCard = {
        pieceType: 'I',
        name: '直线冲击',
        description: '消除整行，造成穿透伤害',
        rarity: 'epic',
        color: '#00ffff',
    };
    const commonCard = {
        pieceType: 'O',
        name: '坚固壁垒',
        description: '稳定下落，不易被打断',
        rarity: 'common',
        color: '#ffff00',
    };
    const legendaryCard = {
        pieceType: 'T',
        name: '旋转突击',
        description: '可旋转，灵活应对',
        rarity: 'legendary',
        color: '#da70d6',
    };
    describe('基础渲染', () => {
        it('应该渲染卡牌组件', () => {
            render(_jsx(Card, { card: testCard }));
            const cardElement = screen.getByLabelText('直线冲击 - 史诗');
            expect(cardElement).toBeInTheDocument();
        });
        it('应该显示卡名', () => {
            render(_jsx(Card, { card: testCard }));
            expect(screen.getByText('直线冲击')).toBeInTheDocument();
        });
        it('应该显示效果描述', () => {
            render(_jsx(Card, { card: testCard }));
            expect(screen.getByText('消除整行，造成穿透伤害')).toBeInTheDocument();
        });
        it('应该显示稀有度名称', () => {
            render(_jsx(Card, { card: testCard }));
            expect(screen.getByText('史诗')).toBeInTheDocument();
        });
        it('应该显示稀有度图标', () => {
            render(_jsx(Card, { card: testCard }));
            const rarityIcon = screen.getByText('🟣');
            expect(rarityIcon).toBeInTheDocument();
        });
    });
    describe('稀有度显示', () => {
        it('应该正确显示普通稀有度', () => {
            render(_jsx(Card, { card: commonCard }));
            expect(screen.getByText('普通')).toBeInTheDocument();
            expect(screen.getByText('⚪')).toBeInTheDocument();
        });
        it('应该正确显示史诗稀有度', () => {
            render(_jsx(Card, { card: testCard }));
            expect(screen.getByText('史诗')).toBeInTheDocument();
            expect(screen.getByText('🟣')).toBeInTheDocument();
        });
        it('应该正确显示传说稀有度', () => {
            render(_jsx(Card, { card: legendaryCard }));
            expect(screen.getByText('传说')).toBeInTheDocument();
            expect(screen.getByText('🟠')).toBeInTheDocument();
        });
        it('应该应用正确的稀有度类名', () => {
            const { container } = render(_jsx(Card, { card: testCard }));
            const cardElement = container.querySelector('.cyber-card-epic');
            expect(cardElement).toBeInTheDocument();
        });
        it('传说卡牌应该有发光动画类名', () => {
            const { container } = render(_jsx(Card, { card: legendaryCard }));
            const cardElement = container.querySelector('.cyber-card-legendary');
            expect(cardElement).toBeInTheDocument();
        });
    });
    describe('尺寸变体', () => {
        it('应该渲染 small 尺寸', () => {
            const { container } = render(_jsx(Card, { card: testCard, size: "small" }));
            const cardElement = container.querySelector('.cyber-card--small');
            expect(cardElement).toBeInTheDocument();
        });
        it('应该渲染 medium 尺寸', () => {
            const { container } = render(_jsx(Card, { card: testCard, size: "medium" }));
            const cardElement = container.querySelector('.cyber-card--medium');
            expect(cardElement).toBeInTheDocument();
        });
        it('应该渲染 large 尺寸', () => {
            const { container } = render(_jsx(Card, { card: testCard, size: "large" }));
            const cardElement = container.querySelector('.cyber-card--large');
            expect(cardElement).toBeInTheDocument();
        });
        it('应该默认使用 medium 尺寸', () => {
            const { container } = render(_jsx(Card, { card: testCard }));
            const cardElement = container.querySelector('.cyber-card--medium');
            expect(cardElement).toBeInTheDocument();
        });
    });
    describe('方块形状显示', () => {
        it('应该显示方块形状', () => {
            render(_jsx(Card, { card: testCard }));
            const blockVisual = document.querySelector('.block-visual');
            expect(blockVisual).toBeInTheDocument();
        });
        it('应该为 I 方块显示正确的形状', () => {
            render(_jsx(Card, { card: testCard }));
            const blockVisual = document.querySelector('.block-visual');
            expect(blockVisual).toBeInTheDocument();
        });
        it('应该为 O 方块显示正确的形状', () => {
            render(_jsx(Card, { card: commonCard }));
            const blockVisual = document.querySelector('.block-visual');
            expect(blockVisual).toBeInTheDocument();
        });
    });
    describe('可点击功能', () => {
        it('clickable=false 时不应该有 button 角色', () => {
            render(_jsx(Card, { card: testCard, clickable: false }));
            const cardElement = screen.getByLabelText('直线冲击 - 史诗');
            expect(cardElement).not.toHaveAttribute('role', 'button');
        });
        it('clickable=true 时应该有 button 角色', () => {
            render(_jsx(Card, { card: testCard, clickable: true }));
            const cardElement = screen.getByRole('button');
            expect(cardElement).toBeInTheDocument();
        });
        it('clickable=true 时点击应该触发回调', () => {
            const handleClick = jest.fn();
            render(_jsx(Card, { card: testCard, clickable: true, onClick: handleClick }));
            const cardElement = screen.getByRole('button');
            fireEvent.click(cardElement);
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
        it('clickable=true 时应该有指针样式', () => {
            const { container } = render(_jsx(Card, { card: testCard, clickable: true }));
            const cardElement = container.querySelector('.cyber-card');
            expect(cardElement).toHaveStyle('cursor: pointer');
        });
    });
    describe('自定义样式', () => {
        it('应该应用自定义 className', () => {
            const { container } = render(_jsx(Card, { card: testCard, className: "custom-class" }));
            const cardElement = container.querySelector('.custom-class');
            expect(cardElement).toBeInTheDocument();
        });
        it('应该应用自定义 style', () => {
            const customStyle = { backgroundColor: 'red' };
            const { container } = render(_jsx(Card, { card: testCard, style: customStyle }));
            const cardElement = container.querySelector('.cyber-card');
            expect(cardElement).toHaveStyle('background-color: rgb(255, 0, 0)');
        });
        it('应该同时保留基础类名和自定义类名', () => {
            const { container } = render(_jsx(Card, { card: testCard, className: "custom-class" }));
            const cardElement = container.querySelector('.cyber-card.custom-class');
            expect(cardElement).toBeInTheDocument();
        });
    });
    describe('边框和阴影', () => {
        it('默认应该显示边框', () => {
            const { container } = render(_jsx(Card, { card: testCard }));
            const cardElement = container.querySelector('.cyber-card');
            expect(cardElement).toHaveStyle('border-color: rgb(126, 34, 206)');
        });
        it('showBorder=false 时应该隐藏边框', () => {
            const { container } = render(_jsx(Card, { card: testCard, showBorder: false }));
            const cardElement = container.querySelector('.cyber-card');
            expect(cardElement).toHaveStyle('border-color: transparent');
        });
        it('默认应该显示阴影', () => {
            const { container } = render(_jsx(Card, { card: testCard }));
            const cardElement = container.querySelector('.cyber-card');
            expect(cardElement).toHaveStyle('box-shadow: 0 0 20px rgba(168, 85, 247, 0.6)');
        });
        it('showShadow=false 时应该隐藏阴影', () => {
            const { container } = render(_jsx(Card, { card: testCard, showShadow: false }));
            const cardElement = container.querySelector('.cyber-card');
            expect(cardElement).toHaveStyle('box-shadow: none');
        });
    });
    describe('无障碍支持', () => {
        it('应该添加 aria-label', () => {
            render(_jsx(Card, { card: testCard }));
            const cardElement = screen.getByLabelText('直线冲击 - 史诗');
            expect(cardElement).toBeInTheDocument();
        });
        it('可点击时应该添加正确的 aria-label', () => {
            render(_jsx(Card, { card: testCard, clickable: true }));
            const cardElement = screen.getByLabelText('直线冲击 - 史诗');
            expect(cardElement).toBeInTheDocument();
        });
        it('可点击时应该有 tabIndex', () => {
            render(_jsx(Card, { card: testCard, clickable: true }));
            const cardElement = screen.getByLabelText('直线冲击 - 史诗');
            expect(cardElement).toHaveAttribute('tabindex', '0');
        });
        it('不可点击时应该有 tabIndex=-1', () => {
            render(_jsx(Card, { card: testCard, clickable: false }));
            const cardElement = screen.getByLabelText('直线冲击 - 史诗');
            expect(cardElement).toHaveAttribute('tabindex', '-1');
        });
    });
    describe('createCard 辅助函数', () => {
        it('应该创建正确的卡牌对象', () => {
            const card = createCard('I', '测试卡牌', '测试效果', 'rare', '#ff0000');
            expect(card.pieceType).toBe('I');
            expect(card.name).toBe('测试卡牌');
            expect(card.description).toBe('测试效果');
            expect(card.rarity).toBe('rare');
            expect(card.color).toBe('#ff0000');
        });
    });
    describe('性能', () => {
        it('应该快速渲染所有稀有度的卡牌', () => {
            const rarities = [
                'common',
                'uncommon',
                'rare',
                'epic',
                'legendary',
            ];
            const startTime = performance.now();
            rarities.forEach((rarity) => {
                render(_jsx(Card, { card: createCard('I', '测试', '测试', rarity, '#fff') }, rarity));
            });
            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(100); // 100ms 内完成渲染
        });
    });
});
