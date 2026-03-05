@echo off
echo ============================================
echo OpenClaw 定时任务安装脚本
echo 需要管理员权限
echo ============================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 需要管理员权限！
    echo.
    echo 请右键点击此文件，选择"以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo [1/4] 管理员权限已确认
echo.

:: 设置变量
set TASK_NAME=OpenClaw-Heartbeat-Check
set SCRIPT_PATH=%USERPROFILE%\.openclaw\workspace\heartbeat-check.ps1
set POWERSHELL_EXE=PowerShell.exe

echo [2/4] 创建任务计划...
echo 任务名称：%TASK_NAME%
echo 脚本路径：%SCRIPT_PATH%
echo 触发器：每 2 小时执行一次
echo.

:: 创建任务计划程序任务
schtasks /Create /TN "%TASK_NAME%" /TR "%POWERSHELL_EXE% -NoProfile -ExecutionPolicy Bypass -File \"%SCRIPT_PATH%\"" /SC HOURLY /MO 2 /RU "%USERNAME%" /RL HIGHEST /F /ST 00:00

if %errorLevel% equ 0 (
    echo.
    echo [3/4] ✓ 任务创建成功！
    echo.
    echo [4/4] 配置唤醒选项...
    
    :: 注意：schtasks 无法直接设置 WakeToRun，需要使用 PowerShell
    powershell -Command "$task = Get-ScheduledTask -TaskName '%TASK_NAME%'; $task.Settings.WakeToRun = $true; $task.Settings.AllowStartIfOnBatteries = $true; $task.Settings.DontStopIfGoingOnBatteries = $true; Register-ScheduledTask -Task $task -Force"
    
    echo.
    echo ============================================
    echo ✓ 安装完成！
    echo ============================================
    echo.
    echo 任务详情:
    echo - 名称：%TASK_NAME%
    echo - 频率：每 2 小时执行一次
    echo - 唤醒：系统睡眠时会唤醒执行
    echo - 权限：最高权限运行
    echo.
    echo 管理命令:
    echo - 查看状态：schtasks /Query /TN "%TASK_NAME%"
    echo - 手动运行：schtasks /Run /TN "%TASK_NAME%"
    echo - 删除任务：schtasks /Delete /TN "%TASK_NAME%" /F
    echo.
    pause
) else (
    echo.
    echo [错误] 任务创建失败！
    echo 错误代码：%errorLevel%
    echo.
    pause
    exit /b 1
)
