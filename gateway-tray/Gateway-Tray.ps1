# OpenClaw Gateway Tray Application
# Requires: PowerShell 5.1+

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$openclawPath = Join-Path $env:APPDATA "npm\openclaw.cmd"

# Create notify icon
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Text = "OpenClaw Gateway"

# Create icon
$iconBitmap = New-Object System.Drawing.Bitmap(64, 64)
$graphics = [System.Drawing.Graphics]::FromImage($iconBitmap)
$graphics.Clear([System.Drawing.Color]::FromArgb(45, 52, 54))

$greenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(46, 204, 113))
$graphics.FillEllipse($greenBrush, 16, 16, 32, 32)

$lightGreenBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(52, 231, 128))
$graphics.FillEllipse($lightGreenBrush, 22, 10, 20, 20)

$blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(41, 128, 185))
$graphics.FillRectangle($blueBrush, 28, 35, 8, 15)

$iconHandle = $iconBitmap.GetHicon()
$notifyIcon.Icon = [System.Drawing.Icon]::FromHandle($iconHandle)

# Create context menu
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

# Menu items
$dashboardItem = New-Object System.Windows.Forms.ToolStripMenuItem
$dashboardItem.Text = "🎯 Open Dashboard"
$dashboardItem.Add_Click({
    Start-Process "http://127.0.0.1:18789/"
})
$contextMenu.Items.Add($dashboardItem)

$separator1 = New-Object System.Windows.Forms.ToolStripSeparator
$contextMenu.Items.Add($separator1)

$startItem = New-Object System.Windows.Forms.ToolStripMenuItem
$startItem.Text = "▶️ Start Gateway"
$startItem.Add_Click({
    if (Test-Path $openclawPath) {
        & $openclawPath daemon start
        Show-Balloon "Gateway Start" "Start command sent"
    }
})
$contextMenu.Items.Add($startItem)

$stopItem = New-Object System.Windows.Forms.ToolStripMenuItem
$stopItem.Text = "⏹️ Stop Gateway"
$stopItem.Add_Click({
    if (Test-Path $openclawPath) {
        & $openclawPath daemon stop
        Show-Balloon "Gateway Stop" "Stop command sent"
    }
})
$contextMenu.Items.Add($stopItem)

$restartItem = New-Object System.Windows.Forms.ToolStripMenuItem
$restartItem.Text = "🔄 Restart Gateway"
$restartItem.Add_Click({
    if (Test-Path $openclawPath) {
        & $openclawPath daemon restart
        Show-Balloon "Gateway Restart" "Restart command sent"
    }
})
$contextMenu.Items.Add($restartItem)

$separator2 = New-Object System.Windows.Forms.ToolStripSeparator
$contextMenu.Items.Add($separator2)

$statusItem = New-Object System.Windows.Forms.ToolStripMenuItem
$statusItem.Text = "📊 Check Status"
$statusItem.Add_Click({
    if (Test-Path $openclawPath) {
        $result = & $openclawPath daemon status
        Show-Balloon "Status Check" "Status checked - see console"
        Write-Host $result
    }
})
$contextMenu.Items.Add($statusItem)

$separator3 = New-Object System.Windows.Forms.ToolStripSeparator
$contextMenu.Items.Add($separator3)

$exitItem = New-Object System.Windows.Forms.ToolStripMenuItem
$exitItem.Text = "❌ Quit"
$exitItem.Add_Click({
    $notifyIcon.Visible = $false
    [System.Windows.Forms.Application]::Exit()
})
$contextMenu.Items.Add($exitItem)

$notifyIcon.ContextMenuStrip = $contextMenu

$notifyIcon.Add_DoubleClick({
    Start-Process "http://127.0.0.1:18789/"
})

function Show-Balloon($title, $message) {
    $notifyIcon.BalloonTipTitle = $title
    $notifyIcon.BalloonTipText = $message
    $notifyIcon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Info
    $notifyIcon.ShowBalloonTip(3000)
}

$notifyIcon.Visible = $true

Write-Host "========================================"
Write-Host "  OpenClaw Gateway Tray Running!"
Write-Host "========================================"
Write-Host ""
Write-Host "Check your system tray for the green icon!"
Write-Host ""
Write-Host "Double-click: Open Dashboard"
Write-Host "Right-click: Show menu"
Write-Host ""

[System.Windows.Forms.Application]::Run()
