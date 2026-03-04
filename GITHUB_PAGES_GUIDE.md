# 📤 GitHub Pages 部署指南

**项目:** 赛博方块 2077  
**仓库:** https://github.com/HongyiLU/cyber-tetris-2077

---

## ✅ 已完成的配置

1. ✅ 创建 `.github/workflows/deploy.yml` - GitHub Actions 自动部署
2. ✅ 更新 `package.json` - 添加部署脚本
3. ✅ 创建 `deploy.ps1` - PowerShell 部署脚本

---

## 🚀 部署方法

### 方法 1: GitHub Actions 自动部署（推荐）

**步骤:**

1. **启用 GitHub Pages**
   - 访问：https://github.com/HongyiLU/cyber-tetris-2077/settings/pages
   - Source: 选择 **GitHub Actions**
   - 保存

2. **查看部署进度**
   - 访问：https://github.com/HongyiLU/cyber-tetris-2077/actions
   - 等待构建完成（约 2-3 分钟）

3. **访问网站**
   - 部署成功后访问：`https://HongyiLU.github.io/cyber-tetris-2077`

---

### 方法 2: 使用 gh-pages 分支

**步骤:**

1. **安装依赖**
   ```bash
   cd C:\Users\hongyi lu\.openclaw\workspace\tetris-project
   npm install
   npm install -D gh-pages
   ```

2. **构建并部署**
   ```bash
   npm run build
   npx gh-pages -d dist
   ```

   或者使用部署脚本：
   ```powershell
   .\deploy.ps1
   ```

3. **在 GitHub 启用 Pages**
   - 访问：https://github.com/HongyiLU/cyber-tetris-2077/settings/pages
   - Source: Deploy from a branch
   - Branch: 选择 `gh-pages`
   - Folder: `/ (root)`
   - 保存

4. **访问网站**
   - `https://HongyiLU.github.io/cyber-tetris-2077`

---

## 📋 手动部署步骤

### 1. 安装依赖

```bash
cd C:\Users\hongyi lu\.openclaw\workspace\tetris-project
npm install
```

### 2. 构建项目

```bash
npm run build
```

这会生成 `dist` 文件夹。

### 3. 部署到 GitHub Pages

```bash
# 安装 gh-pages
npm install -D gh-pages

# 部署
npx gh-pages -d dist
```

### 4. 启用 GitHub Pages

- 访问：https://github.com/HongyiLU/cyber-tetris-2077/settings/pages
- Source: **Deploy from a branch**
- Branch: **gh-pages**
- 点击 **Save**

### 5. 等待部署

- 访问：https://github.com/HongyiLU/cyber-tetris-2077/actions
- 等待部署完成
- 访问：`https://HongyiLU.github.io/cyber-tetris-2077`

---

## 🔧 故障排除

### 问题 1: 404 错误

**原因:** GitHub Pages 还未启用或部署未完成

**解决:**
1. 确认已在 Settings → Pages 启用
2. 等待 2-5 分钟
3. 检查 Actions 是否有错误

### 问题 2: 空白页面

**原因:** 路径配置错误

**解决:**
- 确认 `package.json` 中有 `"homepage": "https://HongyiLU.github.io/cyber-tetris-2077"`
- 在 `vite.config.ts` 中添加 `base: '/cyber-tetris-2077/'`

### 问题 3: 构建失败

**原因:** 依赖未安装

**解决:**
```bash
npm install
npm run build
```

---

## 📊 部署状态

| 步骤 | 状态 |
|------|------|
| GitHub Actions 配置 | ✅ 完成 |
| package.json 配置 | ✅ 完成 |
| 部署脚本 | ✅ 完成 |
| 启用 Pages | ⏳ 待手动启用 |
| 首次部署 | ⏳ 待执行 |

---

## 🎯 下一步

**立即启用 GitHub Pages:**

1. 访问：https://github.com/HongyiLU/cyber-tetris-2077/settings/pages
2. 选择 **GitHub Actions** 作为 Source
3. 保存后会自动触发部署

**或者使用 gh-pages 分支:**

1. 执行：`.\deploy.ps1`
2. 在 Pages 设置选择 `gh-pages` 分支
3. 保存

---

**部署完成后即可在线游戏！** 🎮
