# CLAUDE.md

Hexo 静态博客，主题 hexo-theme-argon，从 WordPress 迁移而来。部署到 Netlify（GitHub: langbyyi/hilang）。

## 从写文章到发布的完整流程

当用户要求发新文章或给你文章内容时，按以下步骤执行：

### 1. 写文章

在 `source/_posts/` 下创建 `.md` 文件，文件名即文章标题，front matter 格式：

```yaml
---
title: 文章标题
date: 2026-06-01
categories: 文章/分类名
tags:
  - 标签1
  - 标签2
---
```

### 2. 处理图片

- 把用户提供的图片复制到 `source/wp-content/uploads/<当前年份>/`
- 文章中用 `<img src="/wp-content/uploads/<当前年份>/文件名.png">` 引用
- 运行 `node tools/normalize-upload-image-names.js` — 自动将图片重命名为 `img-<hash>.png` 并更新文章中的引用路径

### 3. 验证

```bash
npx hexo clean && npx hexo g
```

确认生成无报错。如需本地预览：`npx hexo s`（localhost:4000）

### 4. 推送到 GitHub

```bash
git add -A
git commit -m "feat: 新文章 <标题>"
git push origin main
```

推送后 Netlify 自动部署。

## 关键配置

- 主题配置覆盖文件：`source/_data/argon.yml`（优先级高于 `themes/argon/_config.yml`）
- 自定义 CSS：`source/assets/css/hilang-argon.css`
- 自定义 JS：`source/assets/js/hilang-footer.js`
- 图片统一在 `source/wp-content/uploads/` 下，按年份分目录

## 注意事项

- 不要用 Hexo 的 `post_asset_folder`，图片统一走 `wp-content/uploads/` 路径
- Pjax 已开启，JS 中的初始化逻辑需同时绑定 `DOMContentLoaded` 和 `pjax:complete` 事件
- 推送前不需要手动改图片名，跑一次 normalize 脚本即可
