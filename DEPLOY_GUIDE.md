# 🚀 免费云托管部署指南

**项目:** 赛博方块 2077  
**GitHub:** https://github.com/HongyiLU/cyber-tetris-2077

---

## 🏆 推荐方案

### 方案 1: Vercel（最简单）⭐⭐⭐⭐⭐

**优点:**
- ✅ 一键部署
- ✅ 自动构建
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 100GB 带宽/月

**部署步骤:**

1. **访问 Vercel** (已在浏览器打开)
   - https://vercel.com/new/clone?repository-url=https://github.com/HongyiLU/cyber-tetris-2077

2. **登录/注册**
   - 使用 GitHub 账号登录

3. **导入项目**
   - 选择 `cyber-tetris-2077` 仓库
   - 点击 **Import**

4. **部署完成**
   - 获得域名：`cyber-tetris-2077.vercel.app`
   - 每次 push 自动部署

**命令行方式:**
```bash
npm i -g vercel
cd tetris-project
vercel
vercel --prod
```

---

### 方案 2: Netlify（同样优秀）⭐⭐⭐⭐⭐

**优点:**
- ✅ 拖拽部署
- ✅ 自动构建
- ✅ 表单处理
- ✅ 100GB 带宽/月

**部署步骤:**

1. **访问 Netlify**
   - https://app.netlify.com

2. **导入 GitHub 仓库**
   - 选择 `cyber-tetris-2077`
   - 点击 **Deploy site**

3. **构建配置**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **部署完成**
   - 获得域名：`cyber-tetris-2077.netlify.app`

**命令行方式:**
```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

---

### 方案 3: GitHub Pages（已配置）⭐⭐⭐⭐

**优点:**
- ✅ 完全集成 GitHub
- ✅ 免费
- ✅ 自动部署（已配置 Actions）

**启用步骤:**

1. **在 GitHub 仓库设置**
   - 访问：https://github.com/HongyiLU/cyber-tetris-2077/settings/pages

2. **选择 Branch**
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`

3. **等待部署**
   - 访问 Actions 查看进度
   - 完成后访问：`https://HongyiLU.github.io/cyber-tetris-2077`

**手动部署:**
```bash
npm i -D gh-pages
npm run deploy
```

---

### 方案 4: Cloudflare Pages（无限带宽）⭐⭐⭐⭐

**优点:**
- ✅ 无限带宽
- ✅ 全球 CDN
- ✅ 自动 HTTPS

**部署步骤:**

1. **访问 Cloudflare**
   - https://pages.cloudflare.com

2. **连接 GitHub**
   - 选择 `cyber-tetris-2077`
   - 点击 **Begin setup**

3. **构建配置**
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`

4. **部署完成**
   - 获得域名：`cyber-tetris-2077.pages.dev`

---

## 📊 对比表格

| 服务 | 带宽 | 构建时间 | 自定义域名 | 推荐度 |
|------|------|---------|-----------|--------|
| **Vercel** | 100GB/月 | 自动 | ✅ | 🏆 最佳 |
| **Netlify** | 100GB/月 | 自动 | ✅ | 🏆 最佳 |
| **GitHub Pages** | 100GB/月 | Actions | ✅ | ✅ 推荐 |
| **Cloudflare Pages** | 无限 | 自动 | ✅ | ✅ 推荐 |

---

## 🎯 我的推荐

**首选 Vercel**，因为：
1. 对 React/Vite 项目支持最好
2. 配置最简单（一键部署）
3. 性能优秀（全球 CDN）
4. 自动预览部署（每个 PR）

**备选 Netlify**，功能类似，也是优秀选择。

---

## 📝 部署后

部署成功后，你可以：

1. **分享链接**给朋友
2. **自定义域名**（可选）
3. **设置环境变量**（如需要）
4. **查看访问统计**

---

**选择你喜欢的平台开始部署吧！** 🚀
