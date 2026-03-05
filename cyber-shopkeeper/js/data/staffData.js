// 员工数据

const STAFF_DATA = [
    {
        id: 'android_basic',
        name: '基础仿生人',
        emoji: '🤖',
        description: '最基础的仿生人员工',
        cost: 2000,
        salary: 100,
        efficiency: 1.0,
        charisma: 1.0
    },
    {
        id: 'android_advanced',
        name: '高级仿生人',
        emoji: '⚡',
        description: '升级后的仿生人，效率更高',
        cost: 8000,
        salary: 300,
        efficiency: 1.3,
        charisma: 1.1
    },
    {
        id: 'netrunner',
        name: '网络跑手',
        emoji: '💻',
        description: '擅长市场和数据分析',
        cost: 15000,
        salary: 500,
        efficiency: 1.1,
        charisma: 1.5
    },
    {
        id: 'solo',
        name: '独行者',
        emoji: '🔫',
        description: '能处理各种麻烦事',
        cost: 20000,
        salary: 600,
        efficiency: 1.5,
        charisma: 1.0
    },
    {
        id: 'fixer',
        name: '中间人',
        emoji: '🕶️',
        description: '人脉广，能搞到稀缺资源',
        cost: 35000,
        salary: 800,
        efficiency: 1.2,
        charisma: 2.0
    },
    {
        id: 'ai_manager',
        name: 'AI经理',
        emoji: '🧠',
        description: '超级AI管理，全方位提升',
        cost: 100000,
        salary: 2000,
        efficiency: 2.0,
        charisma: 1.8
    }
];

function getStaffById(id) {
    return STAFF_DATA.find(staff => staff.id === id);
}
