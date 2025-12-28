#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始安装灵定位AI情感陪伴应用...\n');

// 检查Node.js版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ 需要Node.js 16或更高版本，当前版本:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js版本检查通过:', nodeVersion);

// 检查是否安装了Expo CLI
try {
  execSync('expo --version', { stdio: 'ignore' });
  console.log('✅ Expo CLI已安装');
} catch (error) {
  console.log('📦 正在安装Expo CLI...');
  try {
    execSync('npm install -g @expo/cli', { stdio: 'inherit' });
    console.log('✅ Expo CLI安装完成');
  } catch (installError) {
    console.error('❌ Expo CLI安装失败，请手动安装: npm install -g @expo/cli');
    process.exit(1);
  }
}

// 安装项目依赖
console.log('\n📦 正在安装项目依赖...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 依赖安装完成');
} catch (error) {
  console.error('❌ 依赖安装失败');
  process.exit(1);
}

// 创建assets目录和占位文件
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
  console.log('✅ 创建assets目录');
}

// 创建简单的占位图标
const createPlaceholderImage = (filename, size) => {
  const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6C63FF;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#FF6B9D;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2-10}" fill="url(#grad)" />
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="${size/4}" font-family="Arial">灵</text>
  </svg>`;
  
  fs.writeFileSync(path.join(assetsDir, filename), svgContent);
};

// 创建占位图标文件
const iconFiles = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
  { name: 'splash.png', size: 1242 }
];

iconFiles.forEach(({ name, size }) => {
  const filePath = path.join(assetsDir, name);
  if (!fs.existsSync(filePath)) {
    // 创建SVG占位文件
    const svgName = name.replace('.png', '.svg');
    createPlaceholderImage(svgName, size);
    console.log(`✅ 创建占位图标: ${svgName}`);
  }
});

console.log('\n🎉 安装完成！');
console.log('\n📱 启动应用:');
console.log('   npm start        # 启动开发服务器');
console.log('   npm run android  # 在Android模拟器中运行');
console.log('   npm run ios      # 在iOS模拟器中运行');

console.log('\n📝 使用说明:');
console.log('1. 首次启动需要输入DeepSeek API密钥');
console.log('2. 按住球体进行语音对话');
console.log('3. 上滑查看帖子，左滑写日记，右滑看心情统计');

console.log('\n🔗 获取API密钥: https://platform.deepseek.com/');
console.log('\n💡 如有问题，请查看README.md文件');