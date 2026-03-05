# 🚀 OpenClaw Gateway 托盘程序

一个简单的Windows系统托盘应用，方便管理OpenClaw Gateway！

## ✨ 功能特点

- 🎯 **系统托盘图标** - 隐藏在右下角任务栏
- 🖱️ **右键菜单** - 完整的Gateway管理功能
- 🔄 **双击直达** - 双击图标直接打开Dashboard
- 💬 **气球通知** - 操作反馈提示
- 🚫 **无控制台窗口** - 完全后台运行

## 📦 文件说明

```
gateway-tray/
├── Gateway-Tray.ps1          # PowerShell主程序（显示控制台）
├── 启动-Gateway托盘.vbs      # 隐藏启动（推荐）
└── README.md                  # 说明文档
```

## 🚀 如何使用

### 方法1：隐藏启动（推荐）
双击 `启动-Gateway托盘.vbs`，程序会在后台运行，没有控制台窗口。

### 方法2：显示控制台
右键 `Gateway-Tray.ps1` → "使用PowerShell运行"，会显示控制台窗口。

## 🎮 使用说明

### 托盘图标
- 🟢 **绿色圆形图标** - 在系统托盘右下角
- **双击图标** → 打开Dashboard (http://127.0.0.1:18789/)
- **右键图标** → 显示完整菜单

### 菜单选项
1. 🎯 **Open Dashboard** - 打开管理面板
2. ▶️ **Start Gateway** - 启动Gateway服务
3. ⏹️ **Stop Gateway** - 停止Gateway服务
4. 🔄 **Restart Gateway** - 重启Gateway服务
5. 📊 **Check Status** - 检查运行状态
6. ❌ **Quit** - 退出托盘程序

## ⚙️ 系统要求

- Windows 10/11
- PowerShell 5.1 或更高版本
- OpenClaw已安装（通过npm）

## 🔧 故障排除

### 如果找不到openclaw.cmd
确保OpenClaw已全局安装：
```bash
npm install -g openclaw
```

### 如果PowerShell无法运行
以管理员身份运行PowerShell，执行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 💡 提示

- 把 `启动-Gateway托盘.vbs` 放到启动文件夹，可以开机自动运行！
  启动文件夹路径：`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`

---

*创建时间: 2026-03-01* ✨
