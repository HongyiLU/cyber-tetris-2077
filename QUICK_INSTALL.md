# ⚡ 快速安装指南 - Windows 定时任务

## 🎯 目标
配置 Windows 任务计划程序，每 2 小时自动检查 tetris-project 开发进度，即使系统睡眠也能唤醒执行。

---

## 📦 已创建的文件

```
workspace/
├── heartbeat-check.ps1          # 检查脚本（已测试通过）
├── install-heartbeat-task.bat   # 安装脚本（需管理员运行）
├── configure-wake-option.ps1    # 唤醒配置（需管理员运行）
└── QUICK_INSTALL.md             # 本文档
```

---

## 🚀 3 步安装

### 步骤 1️⃣：运行安装脚本（管理员）

1. 打开文件夹：`C:\Users\hongyi lu\.openclaw\workspace\`
2. **右键点击** `install-heartbeat-task.bat`
3. 选择 **「以管理员身份运行」**
4. 按提示确认

**预期输出：**
```
============================================
OpenClaw 定时任务安装脚本
============================================

[1/4] 管理员权限已确认
[2/4] 创建任务计划...
[3/4] ✓ 任务创建成功！
[4/4] 配置唤醒选项...
✓ 安装完成！
```

---

### 步骤 2️⃣：配置唤醒选项（管理员）

1. **右键点击** `configure-wake-option.ps1`
2. 选择 **「以管理员身份运行」**

**预期输出：**
```
============================================
OpenClaw 定时任务 - 唤醒配置
============================================

[1/3] 获取任务...
✓ 任务已找到
[2/3] 配置唤醒选项...
✓ 唤醒选项已配置
[3/3] 保存配置...
✓ 配置已保存
```

---

### 步骤 3️⃣：测试运行

打开 PowerShell，运行：
```powershell
schtasks /Run /TN "OpenClaw-Heartbeat-Check"
```

检查日志：
```powershell
Get-Content "C:\Users\hongyi lu\.openclaw\workspace\logs\heartbeat-$(Get-Date -Format 'yyyy-MM-dd').log"
```

---

## ✅ 验证清单

- [ ] 任务创建成功（无错误提示）
- [ ] 唤醒配置完成（无错误提示）
- [ ] 手动运行测试成功
- [ ] 日志文件已生成
- [ ] 等待 2 小时后自动执行

---

## 📊 管理命令

### 查看任务状态
```powershell
schtasks /Query /TN "OpenClaw-Heartbeat-Check" /V /FO LIST
```

### 查看下次运行时间
```powershell
Get-ScheduledTask -TaskName "OpenClaw-Heartbeat-Check" | Select-Object TaskName, State, NextRunTime
```

### 立即运行
```powershell
schtasks /Run /TN "OpenClaw-Heartbeat-Check"
```

### 暂停任务
```powershell
schtasks /Change /TN "OpenClaw-Heartbeat-Check" /Disable
```

### 恢复任务
```powershell
schtasks /Change /TN "OpenClaw-Heartbeat-Check" /Enable
```

### 删除任务
```powershell
schtasks /Delete /TN "OpenClaw-Heartbeat-Check" /F
```

---

## 🔧 故障排除

### 问题：权限错误
**解决：** 确保右键选择「以管理员身份运行」

### 问题：任务不执行
**检查：**
1. 任务计划程序 → 找到任务 → 查看「历史记录」
2. 检查日志文件：`logs\heartbeat-YYYY-MM-DD.log`

### 问题：系统不唤醒
**检查电源设置：**
1. 控制面板 → 电源选项
2. 更改计划设置 → 更改高级电源设置
3. 睡眠 → 允许使用唤醒定时器 → **启用**

---

## 📝 测试日志示例

```
[2026-03-03 09:43:36] Check complete - Gateway:running - Project:tetris-project
[2026-03-03 11:43:36] Check complete - Gateway:running - Project:tetris-project
[2026-03-03 13:43:36] Check complete - Gateway:running - Project:tetris-project
```

---

## 🎯 安装完成后的行为

- ✅ **每 2 小时** 自动执行一次检查
- ✅ **系统睡眠时** 会唤醒执行（如果配置了唤醒定时器）
- ✅ **记录日志** 到 `logs/heartbeat-YYYY-MM-DD.log`
- ✅ **检查 Gateway** 状态，未运行会尝试启动
- ✅ **检查项目** 版本进度

---

## 📞 需要帮助？

查看完整文档：`SCHEDULED_TASK_SETUP.md`

---

*创建时间：2026-03-03 09:43*  
*脚本测试：✅ 通过*
