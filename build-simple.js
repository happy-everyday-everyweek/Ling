#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 开始构建灵定位APK...\n');

// 检查EAS CLI
try {
  const easVersion = execSync('eas --version', { encoding: 'utf8' }).trim();
  console.log(`✅ EAS CLI版本: ${easVersion}`);
} catch (error) {
  console.error('❌ EAS CLI未安装，请运行: npm install -g eas-cli');
  process.exit(1);
}

// 检查配置文件
if (!fs.existsSync('eas.json')) {
  console.error('❌ eas.json配置文件不存在');
  process.exit(1);
}

if (!fs.existsSync('app.json')) {
  console.error('❌ app.json配置文件不存在');
  process.exit(1);
}

console.log('✅ 配置文件检查完成');

// 检查图标文件
const assetsDir = './assets';
if (!fs.existsSync(assetsDir)) {
  console.error('❌ assets目录不存在');
  process.exit(1);
}

const requiredAssets = ['icon.png', 'adaptive-icon.png', 'splash.png'];
for (const asset of requiredAssets) {
  if (!fs.existsSync(`${assetsDir}/${asset}`)) {
    console.warn(`⚠️ 缺少图标文件: ${asset}`);
  }
}

console.log('\n📝 开始构建流程...');
console.log('1. 如果是首次构建，需要登录Expo账号');
console.log('2. 构建过程可能需要几分钟时间');
console.log('3. 构建完成后可在Expo控制台下载APK\n');

try {
  // 开始构建
  console.log('🏗️ 正在构建APK...');
  execSync('eas build --platform android --profile preview', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n🎉 APK构建完成！');
  console.log('📱 请访问Expo控制台下载APK文件');
  console.log('🌐 https://expo.dev/');
  
} catch (error) {
  console.error('\n❌ 构建失败');
  console.log('\n🔧 可能的解决方案:');
  console.log('1. 确保已登录Expo账号: eas login');
  console.log('2. 检查网络连接');
  console.log('3. 验证app.json配置');
  console.log('4. 重新运行构建命令');
  process.exit(1);
}