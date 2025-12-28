#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📦 准备构建包...\n');

// 创建构建说明文档
const buildInstructions = `# 灵动陪伴 - APK构建指南

## 环境要求

### 必需软件
1. **Node.js** (版本 16+)
2. **Android Studio** (最新版本)
3. **Java JDK** (版本 11+)

### Android SDK配置
1. 安装Android Studio
2. 打开SDK Manager，安装以下组件：
   - Android SDK Platform 33
   - Android SDK Build-Tools 33.0.0
   - Android SDK Platform-Tools
   - Android SDK Tools
3. 设置环境变量：
   - ANDROID_HOME = Android SDK路径
   - 将 %ANDROID_HOME%\\platform-tools 添加到PATH

## 构建步骤

### 1. 安装依赖
\`\`\`bash
npm install
\`\`\`

### 2. 初始化React Native项目
\`\`\`bash
npx react-native init TempProject
cp -r TempProject/android .
cp -r TempProject/ios .
rm -rf TempProject
\`\`\`

### 3. 链接原生依赖
\`\`\`bash
npx react-native link
\`\`\`

### 4. 构建APK
\`\`\`bash
cd android
./gradlew assembleRelease
\`\`\`

### 5. 获取APK文件
构建完成后，APK文件位于：
\`android/app/build/outputs/apk/release/app-release.apk\`

## 故障排除

### 常见问题
1. **ANDROID_HOME未设置**
   - 确保环境变量正确设置
   - 重启命令行工具

2. **Gradle构建失败**
   - 检查网络连接
   - 清理项目：\`./gradlew clean\`
   - 重新构建

3. **依赖冲突**
   - 删除node_modules：\`rm -rf node_modules\`
   - 重新安装：\`npm install\`

### Windows用户
- 使用 \`gradlew.bat\` 而不是 \`./gradlew\`
- 确保启用开发者模式

### 构建优化
- 使用 \`--release\` 标志构建生产版本
- 启用代码混淆以减小APK大小
- 使用App Bundle格式发布到Google Play

## 应用信息
- **应用名称**: 灵动陪伴
- **包名**: com.aicompanion.app
- **版本**: 1.0.0
- **最小SDK**: 21 (Android 5.0)
- **目标SDK**: 33 (Android 13)

## 功能特性
- AI智能对话
- 语音交互
- 日记记录
- 心情分析
- 社交分享

---
构建完成后，您将获得一个可以直接安装到Android设备的APK文件。
`;

// 创建package.json的生产版本
const productionPackageJson = {
  "name": "ai-companion-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "build": "cd android && ./gradlew assembleRelease",
    "build:windows": "cd android && gradlew.bat assembleRelease",
    "clean": "cd android && ./gradlew clean",
    "link": "react-native link"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.19.0",
    "@react-native-voice/voice": "^3.2.4",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "axios": "^1.6.0",
    "react": "18.2.0",
    "react-native": "0.72.6",
    "react-native-gesture-handler": "^2.12.0",
    "react-native-linear-gradient": "^2.8.3",
    "react-native-paper": "^5.10.6",
    "react-native-reanimated": "^3.5.0",
    "react-native-safe-area-context": "^4.7.0",
    "react-native-screens": "^3.25.0",
    "react-native-svg": "^13.14.0",
    "react-native-tts": "^4.1.0",
    "react-native-vector-icons": "^10.0.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@react-native/eslint-config": "^0.72.0",
    "@react-native/metro-config": "^0.72.0",
    "babel-jest": "^29.2.1",
    "eslint": "^8.19.0",
    "jest": "^29.2.1",
    "metro-react-native-babel-preset": "0.76.8",
    "prettier": "^2.4.1",
    "react-test-renderer": "18.2.0"
  },
  "jest": {
    "preset": "react-native"
  },
  "private": true
};

// 创建简化的构建脚本
const simpleBuildScript = `#!/bin/bash

echo "🚀 开始构建灵动陪伴APK..."

# 检查环境
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME环境变量未设置"
    echo "请设置Android SDK路径到ANDROID_HOME"
    exit 1
fi

echo "✅ Android SDK: $ANDROID_HOME"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 如果android目录不存在，初始化项目
if [ ! -d "android" ]; then
    echo "🏗️ 初始化React Native项目..."
    npx react-native init TempProject --skip-install
    cp -r TempProject/android .
    cp -r TempProject/ios .
    rm -rf TempProject
fi

# 链接原生依赖
echo "🔗 链接原生依赖..."
npx react-native link

# 构建APK
echo "🏗️ 构建APK..."
cd android

# 清理项目
./gradlew clean

# 构建Release APK
./gradlew assembleRelease

# 检查APK是否生成
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "🎉 APK构建成功！"
    
    # 复制APK到根目录
    cp "$APK_PATH" "../灵动陪伴-v1.0.0.apk"
    echo "📱 APK已复制到: 灵动陪伴-v1.0.0.apk"
    
    # 显示文件大小
    SIZE=$(du -h "../灵动陪伴-v1.0.0.apk" | cut -f1)
    echo "📊 APK大小: $SIZE"
    
    echo "✅ 构建完成！"
else
    echo "❌ APK构建失败"
    exit 1
fi
`;

// Windows构建脚本
const windowsBuildScript = `@echo off
echo 🚀 开始构建灵动陪伴APK...

REM 检查环境
if "%ANDROID_HOME%"=="" (
    echo ❌ ANDROID_HOME环境变量未设置
    echo 请设置Android SDK路径到ANDROID_HOME
    exit /b 1
)

echo ✅ Android SDK: %ANDROID_HOME%

REM 安装依赖
echo 📦 安装依赖...
npm install

REM 如果android目录不存在，初始化项目
if not exist "android" (
    echo 🏗️ 初始化React Native项目...
    npx react-native init TempProject --skip-install
    xcopy TempProject\\android android\\ /E /I
    xcopy TempProject\\ios ios\\ /E /I
    rmdir /s /q TempProject
)

REM 链接原生依赖
echo 🔗 链接原生依赖...
npx react-native link

REM 构建APK
echo 🏗️ 构建APK...
cd android

REM 清理项目
gradlew.bat clean

REM 构建Release APK
gradlew.bat assembleRelease

REM 检查APK是否生成
if exist "app\\build\\outputs\\apk\\release\\app-release.apk" (
    echo 🎉 APK构建成功！
    
    REM 复制APK到根目录
    copy "app\\build\\outputs\\apk\\release\\app-release.apk" "..\\灵动陪伴-v1.0.0.apk"
    echo 📱 APK已复制到: 灵动陪伴-v1.0.0.apk
    
    echo ✅ 构建完成！
) else (
    echo ❌ APK构建失败
    exit /b 1
)
`;

// 写入文件
fs.writeFileSync('BUILD_INSTRUCTIONS.md', buildInstructions);
fs.writeFileSync('package-production.json', JSON.stringify(productionPackageJson, null, 2));
fs.writeFileSync('build.sh', simpleBuildScript);
fs.writeFileSync('build.bat', windowsBuildScript);

// 设置执行权限（Unix系统）
try {
  fs.chmodSync('build.sh', '755');
} catch (error) {
  // Windows系统忽略权限设置
}

console.log('✅ 构建包准备完成！');
console.log('\n📋 生成的文件:');
console.log('- BUILD_INSTRUCTIONS.md (详细构建说明)');
console.log('- package-production.json (生产环境依赖)');
console.log('- build.sh (Linux/Mac构建脚本)');
console.log('- build.bat (Windows构建脚本)');

console.log('\n🚀 使用方法:');
console.log('1. 在有Android开发环境的机器上');
console.log('2. 复制整个项目文件夹');
console.log('3. 运行构建脚本:');
console.log('   - Linux/Mac: ./build.sh');
console.log('   - Windows: build.bat');
console.log('4. 获取生成的APK文件');

console.log('\n💡 提示: 详细说明请查看 BUILD_INSTRUCTIONS.md');