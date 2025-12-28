#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建灵定位APK...\n');

// 检查环境
function checkEnvironment() {
  console.log('🔍 检查构建环境...');
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  console.log(`✅ Node.js版本: ${nodeVersion}`);
  
  // 检查npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm版本: ${npmVersion}`);
  } catch (error) {
    console.error('❌ npm未安装');
    process.exit(1);
  }
  
  // 检查Expo CLI
  try {
    const expoVersion = execSync('expo --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Expo CLI版本: ${expoVersion}`);
  } catch (error) {
    console.log('📦 正在安装Expo CLI...');
    try {
      execSync('npm install -g @expo/cli', { stdio: 'inherit' });
      console.log('✅ Expo CLI安装完成');
    } catch (installError) {
      console.error('❌ Expo CLI安装失败');
      process.exit(1);
    }
  }
  
  // 检查EAS CLI
  try {
    const easVersion = execSync('eas --version', { encoding: 'utf8' }).trim();
    console.log(`✅ EAS CLI版本: ${easVersion}`);
  } catch (error) {
    console.log('📦 正在安装EAS CLI...');
    try {
      execSync('npm install -g @expo/eas-cli', { stdio: 'inherit' });
      console.log('✅ EAS CLI安装完成');
    } catch (installError) {
      console.error('❌ EAS CLI安装失败');
      process.exit(1);
    }
  }
}

// 安装依赖
function installDependencies() {
  console.log('\n📦 安装项目依赖...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成');
  } catch (error) {
    console.error('❌ 依赖安装失败');
    process.exit(1);
  }
}

// 检查配置文件
function checkConfiguration() {
  console.log('\n⚙️ 检查配置文件...');
  
  // 检查app.json
  if (!fs.existsSync('app.json')) {
    console.error('❌ app.json文件不存在');
    process.exit(1);
  }
  console.log('✅ app.json配置正常');
  
  // 检查eas.json
  if (!fs.existsSync('eas.json')) {
    console.error('❌ eas.json文件不存在');
    process.exit(1);
  }
  console.log('✅ eas.json配置正常');
  
  // 检查图标文件
  const requiredAssets = ['icon.png', 'adaptive-icon.png', 'splash.png'];
  const assetsDir = path.join(__dirname, 'assets');
  
  for (const asset of requiredAssets) {
    const assetPath = path.join(assetsDir, asset);
    if (!fs.existsSync(assetPath)) {
      console.warn(`⚠️ 缺少图标文件: ${asset}`);
    } else {
      console.log(`✅ 图标文件存在: ${asset}`);
    }
  }
}

// 登录Expo账号
function loginExpo() {
  console.log('\n🔐 检查Expo登录状态...');
  try {
    const whoami = execSync('expo whoami', { encoding: 'utf8' }).trim();
    if (whoami.includes('Not logged in')) {
      console.log('📝 请登录Expo账号...');
      execSync('expo login', { stdio: 'inherit' });
    } else {
      console.log(`✅ 已登录Expo账号: ${whoami}`);
    }
  } catch (error) {
    console.log('📝 请登录Expo账号...');
    execSync('expo login', { stdio: 'inherit' });
  }
}

// 配置EAS构建
function configureEAS() {
  console.log('\n🔧 配置EAS构建...');
  try {
    // 检查是否已经配置过
    if (!fs.existsSync('eas.json')) {
      execSync('eas build:configure', { stdio: 'inherit' });
    }
    console.log('✅ EAS构建配置完成');
  } catch (error) {
    console.error('❌ EAS构建配置失败');
    process.exit(1);
  }
}

// 开始构建APK
function buildAPK() {
  console.log('\n🏗️ 开始构建APK...');
  console.log('📝 这可能需要几分钟时间，请耐心等待...\n');
  
  try {
    execSync('eas build --platform android --profile preview', { stdio: 'inherit' });
    console.log('\n🎉 APK构建完成！');
    console.log('📱 你可以在Expo开发者控制台下载APK文件');
    console.log('🌐 访问: https://expo.dev/accounts/[your-username]/projects/soul-companion/builds');
  } catch (error) {
    console.error('\n❌ APK构建失败');
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查网络连接');
    console.log('2. 确认Expo账号权限');
    console.log('3. 检查app.json配置');
    console.log('4. 重新运行: npm run build:preview');
    process.exit(1);
  }
}

// 主函数
async function main() {
  try {
    checkEnvironment();
    installDependencies();
    checkConfiguration();
    loginExpo();
    configureEAS();
    buildAPK();
  } catch (error) {
    console.error('\n❌ 构建过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行构建
main();