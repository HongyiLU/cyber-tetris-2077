# ============================================
# 配置 OpenClaw 定时任务的唤醒选项
# 需要管理员权限
# ============================================

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "✗ 错误：需要管理员权限！" -ForegroundColor Red
    Write-Host ""
    Write-Host "请右键点击此脚本，选择「以管理员身份运行」" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "============================================"
Write-Host "OpenClaw 定时任务 - 唤醒配置"
Write-Host "============================================"
Write-Host ""

$taskName = "OpenClaw-Heartbeat-Check"

try {
    # 获取任务
    Write-Host "[1/3] 获取任务：$taskName..."
    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
    Write-Host "✓ 任务已找到" -ForegroundColor Green
    Write-Host ""
    
    # 配置唤醒选项
    Write-Host "[2/3] 配置唤醒选项..."
    $task.Settings.WakeToRun = $true
    $task.Settings.AllowStartIfOnBatteries = $true
    $task.Settings.DontStopIfGoingOnBatteries = $true
    $task.Settings.StartWhenAvailable = $true
    $task.Settings.RunOnlyIfNetworkAvailable = $true
    Write-Host "✓ 唤醒选项已配置" -ForegroundColor Green
    Write-Host ""
    
    # 保存配置
    Write-Host "[3/3] 保存配置..."
    Register-ScheduledTask -Task $task -Force | Out-Null
    Write-Host "✓ 配置已保存" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "============================================"
    Write-Host "✓ 配置完成！"
    Write-Host "============================================"
    Write-Host ""
    Write-Host "任务配置详情:"
    Write-Host "- 唤醒计算机运行：是"
    Write-Host "- 使用电池时启动：是"
    Write-Host "- 使用电池时不停止：是"
    Write-Host "- 网络可用时运行：是"
    Write-Host ""
    Write-Host "测试命令：schtasks /Run /TN \"$taskName\""
    Write-Host ""
    
} catch {
    Write-Host "✗ 错误：$_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请确认任务已创建：" -ForegroundColor Yellow
    Write-Host "1. 先运行 install-heartbeat-task.bat（管理员）"
    Write-Host "2. 然后再次运行此脚本"
    Write-Host ""
    pause
    exit 1
}
