# 图片压缩工具 (Image Compressor)

一个简单、高效的在线图片压缩工具，支持单张和批量压缩，提供暗黑模式等现代化功能。

## 功能特点

### 1. 图片压缩
- 支持单张图片压缩
- 支持批量图片压缩
- 支持 JPG、PNG、WebP 等常见格式
- 可自定义压缩质量和输出尺寸

### 2. 上传方式
- 本地文件上传（支持拖拽）
- 网络图片链接导入
- 支持多图片批量处理

### 3. 压缩设置
- 压缩质量调节（0-100%）
- 自定义输出尺寸
- 保持宽高比例选项
- 最大文件大小限制
- 智能联动控制（质量与尺寸自动调整）

### 4. 界面特性
- 响应式设计，适配各种设备
- 支持浅色/深色主题切换
- 实时压缩效果预览
- 压缩率显示
- 批量处理进度展示
- 拖放上传支持

## 技术栈

- HTML5
- CSS3 (Flexbox/Grid)
- JavaScript (ES6+)
- 第三方库：
  - browser-image-compression (图片压缩)
  - JSZip (批量下载打包)

## 项目结构 

## 部署方式

### Vercel 部署
1. 使用 GitHub 账号登录 [Vercel](https://vercel.com)
2. 点击 "Add New..." -> "Project"
3. 导入 GitHub 仓库
4. 配置部署选项：
   - Framework: Other
   - Root Directory: ./
5. 点击 "Deploy"

访问地址：[图片压缩工具](https://tupianyasuo-git-main-ideabrewers-projects.vercel.app)

### 本地开发
1. 克隆项目