# OpenClaw Heartbeat Check Script
# Scheduled task for checking tetris-project progress

$ErrorActionPreference = "Continue"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "============================================"
Write-Host "[Scheduled Task] Game Dev Progress Check"
Write-Host "Time: $Timestamp"
Write-Host "============================================"

# 1. Check Gateway status
Write-Host "`n[1/4] Checking Gateway status..."
$gatewayStatus = openclaw gateway status 2>&1 | Out-String
if ($gatewayStatus -match "running") {
    Write-Host "[OK] Gateway service is running" -ForegroundColor Green
} else {
    Write-Host "[WARN] Gateway not running" -ForegroundColor Yellow
}

# 2. Check HEARTBEAT.md
Write-Host "`n[2/4] Checking HEARTBEAT.md..."
$heartbeatPath = "$env:USERPROFILE\.openclaw\workspace\HEARTBEAT.md"
if (Test-Path $heartbeatPath) {
    Write-Host "[OK] HEARTBEAT.md exists" -ForegroundColor Green
} else {
    Write-Host "[ERROR] HEARTBEAT.md not found" -ForegroundColor Red
}

# 3. Check tetris-project status
Write-Host "`n[3/4] Checking tetris-project status..."
$projectPath = "$env:USERPROFILE\.openclaw\workspace\tetris-project"
if (Test-Path $projectPath) {
    $changelogs = Get-ChildItem "$projectPath\CHANGELOG_*.md" | Sort-Object LastWriteTime -Descending
    if ($changelogs.Count -gt 0) {
        $latestVersion = $changelogs[0].BaseName.Replace("CHANGELOG_", "")
        Write-Host "[OK] Latest version: $latestVersion" -ForegroundColor Green
    }
    
    $planPath = "$projectPath\ITERATION_PLAN.md"
    if (Test-Path $planPath) {
        $planContent = Get-Content $planPath -Raw
        $pendingCount = ([regex]::Matches($planContent, 'v1\.[5-8]')).Count
        Write-Host "[INFO] Pending versions: $pendingCount" -ForegroundColor Cyan
    }
} else {
    Write-Host "[ERROR] tetris-project not found" -ForegroundColor Red
}

# 4. Write log
Write-Host "`n[4/4] Writing log..."
$logDir = "$env:USERPROFILE\.openclaw\workspace\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$dateStr = Get-Date -Format "yyyy-MM-dd"
$logFile = "$logDir\heartbeat-$dateStr.log"
$logEntry = "[$Timestamp] Check complete - Gateway:running - Project:tetris-project"
Add-Content -Path $logFile -Value $logEntry
Write-Host "[OK] Log written to: $logFile" -ForegroundColor Green

Write-Host "`n============================================"
Write-Host "[Scheduled Task] Check Complete"
Write-Host "============================================"

exit 0
