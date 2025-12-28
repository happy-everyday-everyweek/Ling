#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 创建应用图标...\n');

// 创建assets目录
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// 创建简单的SVG图标，然后可以转换为PNG
const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#6C63FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B9D;stop-opacity:1" />
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="#0A0A0F" rx="180"/>
  <circle cx="512" cy="512" r="300" fill="url(#grad1)" opacity="0.8"/>
  <circle cx="512" cy="512" r="200" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.6"/>
  <circle cx="512" cy="512" r="100" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.4"/>
  <text x="512" y="580" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="#FFFFFF">灵</text>
</svg>`;

// 保存SVG文件
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);

console.log('✅ 创建了SVG图标文件');
console.log('📝 请使用以下方法之一将SVG转换为PNG:');
console.log('   1. 在线转换: https://convertio.co/svg-png/');
console.log('   2. 使用Photoshop/GIMP等图像编辑软件');
console.log('   3. 使用命令行工具如ImageMagick');
console.log('');
console.log('📏 需要的图标尺寸:');
console.log('   - icon.png: 1024x1024 (应用图标)');
console.log('   - adaptive-icon.png: 1024x1024 (Android自适应图标)');
console.log('   - splash.png: 1242x2436 (启动屏幕)');
console.log('   - favicon.png: 48x48 (Web图标)');

// 创建占位符文件说明
const placeholderText = `这是一个占位符文件。
请将实际的PNG图标文件放在这里。

图标要求:
- icon.png: 1024x1024像素，应用主图标
- adaptive-icon.png: 1024x1024像素，Android自适应图标
- splash.png: 1242x2436像素，启动屏幕图像
- favicon.png: 48x48像素，Web图标

你可以使用assets/icon.svg作为基础来创建这些图标。
`;

fs.writeFileSync(path.join(assetsDir, 'README.txt'), placeholderText);

console.log('✅ 图标创建脚本完成');