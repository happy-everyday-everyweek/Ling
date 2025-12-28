#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 开始构建灵定位AI情感陪伴应用...\n');

// 检查是否在项目根目录
if (!fs.existsSync('package.json')) {
  console.error('❌ 请在项目根目录运行此脚本');
  process.exit(1);
}

// 读取package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`✅ 项目: ${packageJson.name} v${packageJson.version}`);

// 检查Expo CLI
try {
  execSync('expo --version', { stdio: 'ignore' });
  console.log('✅ Expo CLI已安装');
} catch (error) {
  console.error('❌ 请先安装Expo CLI: npm install -g @expo/cli');
  process.exit(1);
}

// 检查EAS CLI
try {
  execSync('eas --version', { stdio: 'ignore' });
  console.log('✅ EAS CLI已安装');
} catch (error) {
  console.log('📦 正在安装EAS CLI...');
  try {
    execSync('npm install -g @expo/eas-cli', { stdio: 'inherit' });
    console.log('✅ EAS CLI安装完成');
  } catch (installError) {
    console.error('❌ EAS CLI安装失败，请手动安装: npm install -g @expo/eas-cli');
    process.exit(1);
  }
}

// 创建构建配置
const easJson = {
  cli: {
    version: ">= 5.2.0"
  },
  build: {
    development: {
      developmentClient: true,
      distribution: "internal"
    },
    preview: {
      distribution: "internal",
      android: {
        buildType: "apk"
      }
    },
    production: {
      android: {
        buildType: "app-bundle"
      }
    }
  },
  submit: {
    production: {}
  }
};

if (!fs.existsSync('eas.json')) {
  fs.writeFileSync('eas.json', JSON.stringify(easJson, null, 2));
  console.log('✅ 创建EAS构建配置');
}

console.log('\n🔧 可用的构建命令:');
console.log('   npm run build:preview   # 构建预览版APK');
console.log('   npm run build:android   # 构建Android生产版');
console.log('   npm run build:ios       # 构建iOS生产版');

// 更新package.json脚本
const updatedPackageJson = {
  ...packageJson,
  scripts: {
    ...packageJson.scripts,
    "build:preview": "eas build --platform android --profile preview",
    "build:android": "eas build --platform android --profile production",
    "build:ios": "eas build --platform ios --profile production",
    "build:all": "eas build --platform all --profile production"
  }
};

fs.writeFileSync('package.json', JSON.stringify(updatedPackageJson, null, 2));
console.log('✅ 更新构建脚本');

console.log('\n📝 构建说明:');
console.log('1. 首次构建需要登录Expo账号: expo login');
console.log('2. 配置项目: eas build:configure');
console.log('3. 开始构建: npm run build:preview');
console.log('\n💡 更多信息请查看: https://docs.expo.dev/build/introduction/');

// 检查是否需要创建图标
const iconPath = path.join(__dirname, 'assets', 'icon.png');
if (!fs.existsSync(iconPath)) {
  console.log('\n⚠️  注意: 请确保在assets目录中有以下文件:');
  console.log('   - icon.png (1024x1024)');
  console.log('   - adaptive-icon.png (1024x1024)');
  console.log('   - splash.png (1242x2436)');
  console.log('   - favicon.png (48x48)');
}

console.log('\n🎉 构建配置完成！');