# 使用 gh-pages 部署到 GitHub Pages

$distPath = "dist"
$repoUrl = "https://github.com/HongyiLU/cyber-tetris-2077.git"

Write-Host "🚀 开始部署到 GitHub Pages..." -ForegroundColor Cyan

# 1. 构建项目
Write-Host "`n📦 步骤 1: 构建项目..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 构建完成！" -ForegroundColor Green

# 2. 部署到 gh-pages 分支
Write-Host "`n📤 步骤 2: 部署到 GitHub Pages..." -ForegroundColor Yellow
npx gh-pages -d $distPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 部署失败！" -ForegroundColor Red
    Write-Host "`n请手动执行以下命令：" -ForegroundColor Yellow
    Write-Host "  npm install -D gh-pages" -ForegroundColor White
    Write-Host "  npm run deploy" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ 部署成功！" -ForegroundColor Green
Write-Host "`n🌐 访问地址：" -ForegroundColor Cyan
Write-Host "  https://HongyiLU.github.io/cyber-tetris-2077" -ForegroundColor White
Write-Host "`n⏱️  部署可能需要几分钟才能生效..." -ForegroundColor Yellow
