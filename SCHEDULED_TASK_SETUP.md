# 🔧 OpenClaw 定时任务安装指南

**目标：** 使用 Windows 任务计划程序实现定时检查，即使系统睡眠也能唤醒执行

---

## 📁 已创建的文件

| 文件 | 用途 |
|------|------|
| `heartbeat-check.ps1` | 定时检查脚本（核心逻辑） |
| `install-heartbeat-task.bat` | 安装脚本（创建任务计划） |
| `configure-wake-option.ps1` | 配置唤醒选项 |
| `SCHEDULED_TASK_SETUP.md` | 本文档 |

---

## 🚀 安装步骤

### 步骤 1：以管理员身份运行安装脚本

1. 打开文件资源管理器
2. 导航到：`C:\Users\hongyi lu\.openclaw\workspace\`
3. **右键点击** `install-heartbeat-task.bat`
4. 选择 **「以管理员身份运行」**

**预期输出：**
```
============================================
OpenClaw 定时任务安装脚本
需要管理员权限
============================================

[1/4] 管理员权限已确认

[2/4] 创建任务计划...
任务名称：OpenClaw-Heartbeat-Check
脚本路径：C:\Users\hongyi lu\.openclaw\workspace\heartbeat-check.ps1
触发器：每 2 小时执行一次

[3/4] ✓ 任务创建成功！

[4/4] 配置唤醒选项...

============================================
✓ 安装完成！
============================================
```

---

### 步骤 2：配置唤醒选项

1. **右键点击** `configure-wake-option.ps1`
2. 选择 **「以管理员身份运行」**

**预期输出：**
```
============================================
OpenClaw 定时任务 - 唤醒配置
============================================

[1/3] 获取任务：OpenClaw-Heartbeat-Check...
✓ 任务已找到

[2/3] 配置唤醒选项...
✓ 唤醒选项已配置

[3/3] 保存配置...
✓ 配置已保存

============================================
✓ 配置完成！
============================================
```

---

## ✅ 验证安装

### 方法 1：命令行查询
```powershell
schtasks /Query /TN "OpenClaw-Heartbeat-Check"
```

### 方法 2：任务计划程序 GUI
1. 按 `Win + R`，输入 `taskschd.msc`，回车
2. 左侧选择「任务计划程序库」
3. 在中间列表找到 `OpenClaw-Heartbeat-Check`
4. 双击查看属性

### 方法 3：手动触发测试
```powershell
schtasks /Run /TN "OpenClaw-Heartbeat-Check"
```

然后查看日志文件：
```
C:\Users\hongyi lu\.openclaw\workspace\logs\heartbeat-YYYY-MM-DD.log
```

---

## 📋 任务配置详情

| 配置项 | 值 |
|--------|-----|
| **任务名称** | OpenClaw-Heartbeat-Check |
| **触发器** | 每 2 小时执行一次 |
| **操作** | PowerShell 执行 heartbeat-check.ps1 |
| **权限** | 最高权限（Administrator） |
| **唤醒** | 睡眠时唤醒执行 |
| **电池** | 使用电池时也运行 |
| **网络** | 网络可用时运行 |

---

## 🔍 管理命令

### 查看任务状态
```powershell
schtasks /Query /TN "OpenClaw-Heartbeat-Check" /V /FO LIST
```

### 立即运行一次
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

## 📊 日志位置

定时任务每次执行都会记录日志：

```
C:\Users\hongyi lu\.openclaw\workspace\logs\heartbeat-YYYY-MM-DD.log
```

**日志内容示例：**
```
[2026-03-03 10:00:00] 定时检查完成 - Gateway:运行中 - 项目:tetris-project
[2026-03-03 12:00:00] 定时检查完成 - Gateway:运行中 - 项目:tetris-project
[2026-03-03 14:00:00] 定时检查完成 - Gateway:运行中 - 项目:tetris-project
```

---

## ⚠️ 注意事项

### 1. 系统睡眠设置
确保系统允许被任务唤醒：
- 控制面板 → 电源选项 → 更改计划设置
- 更改高级电源设置
- 睡眠 → 允许使用唤醒定时器 → **启用**

### 2. 笔记本电池模式
如果担心电池消耗，可以修改配置：
```powershell
# 编辑 configure-wake-option.ps1，修改：
$task.Settings.AllowStartIfOnBatteries = $false  # 电池时不运行
$task.Settings.DontStopIfGoingOnBatteries = $false
```

### 3. Gateway 服务
定时任务会检查 Gateway 状态，如果未运行会尝试启动。确保：
- OpenClaw 已正确安装
- `openclaw gateway` 命令可用

### 4. PowerShell 执行策略
脚本使用 `-ExecutionPolicy Bypass`，但如果遇到问题，可以运行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🐛 故障排除

### 问题 1：任务创建失败（权限错误）
**解决：** 确保以管理员身份运行安装脚本

### 问题 2：任务不执行
**检查：**
1. 任务计划程序中任务状态是否为「就绪」
2. 查看「历史记录」标签页
3. 检查日志文件是否有输出

### 问题 3：系统不唤醒
**检查：**
1. 电源选项中「允许使用唤醒定时器」已启用
2. BIOS/UEFI 中唤醒定时器已启用
3. 某些电脑有「深度睡眠」选项，需要禁用

### 问题 4：Gateway 未启动
**解决：** 手动运行一次脚本检查错误：
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\hongyi lu\.openclaw\workspace\heartbeat-check.ps1"
```

---

## 📝 卸载步骤

如需删除定时任务：

```powershell
schtasks /Delete /TN "OpenClaw-Heartbeat-Check" /F
```

然后删除文件：
- `heartbeat-check.ps1`
- `install-heartbeat-task.bat`
- `configure-wake-option.ps1`
- `SCHEDULED_TASK_SETUP.md`

---

## 🎯 下一步

安装完成后：
1. ✅ 手动运行一次测试：`schtasks /Run /TN "OpenClaw-Heartbeat-Check"`
2. ✅ 检查日志文件确认正常
3. ✅ 等待 2 小时后检查是否自动执行
4. ✅ 测试系统睡眠后是否能唤醒执行

---

*创建时间：2026-03-03 09:40*  
*版本：1.0*
