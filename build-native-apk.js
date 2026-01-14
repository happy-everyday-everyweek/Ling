#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建纯React Native APK...\n');

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
  
  // 检查React Native CLI
  try {
    const rnVersion = execSync('npx react-native --version', { encoding: 'utf8' }).trim();
    console.log(`✅ React Native CLI: ${rnVersion}`);
  } catch (error) {
    console.log('📦 正在安装React Native CLI...');
    try {
      execSync('npm install -g @react-native-community/cli', { stdio: 'inherit' });
      console.log('✅ React Native CLI安装完成');
    } catch (installError) {
      console.error('❌ React Native CLI安装失败');
      process.exit(1);
    }
  }
  
  // 检查Java环境
  try {
    const javaVersion = execSync('java -version', { encoding: 'utf8', stderr: 'inherit' });
    console.log('✅ Java环境正常');
  } catch (error) {
    console.error('❌ Java环境未配置，请安装JDK');
    process.exit(1);
  }
  
  // 检查Android SDK
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome) {
    console.error('❌ ANDROID_HOME环境变量未设置');
    console.log('请设置Android SDK路径到ANDROID_HOME环境变量');
    process.exit(1);
  }
  console.log(`✅ Android SDK: ${androidHome}`);
}

// 转换项目结构
function convertToReactNative() {
  console.log('\n🔄 转换为纯React Native项目...');
  
  // 更新package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // 移除Expo相关依赖和脚本
  delete packageJson.dependencies.expo;
  delete packageJson.dependencies['expo-av'];
  delete packageJson.dependencies['expo-linear-gradient'];
  delete packageJson.dependencies['expo-speech'];
  
  // 添加React Native替代依赖
  packageJson.dependencies['react-native-linear-gradient'] = '^2.8.3';
  packageJson.dependencies['react-native-tts'] = '^4.1.0';
  packageJson.dependencies['react-native-sound'] = '^0.11.2';
  
  // 更新脚本
  packageJson.main = 'index.js';
  packageJson.scripts = {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "build:android": "cd android && ./gradlew assembleRelease",
    "build:apk": "node build-native-apk.js",
    "clean": "react-native clean"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json已更新');
  
  // 创建index.js入口文件
  const indexJsContent = `import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
`;
  
  fs.writeFileSync(path.join(__dirname, 'index.js'), indexJsContent);
  console.log('✅ index.js入口文件已创建');
}

// 更新导入语句
function updateImports() {
  console.log('\n📝 更新导入语句...');
  
  const filesToUpdate = [
    'src/screens/HomeScreen.js',
    'src/screens/ApiKeySetup.js',
    'src/screens/MainApp.js',
    'src/components/SoulBall.js'
  ];
  
  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 替换expo-linear-gradient为react-native-linear-gradient
      content = content.replace(
        /from 'expo-linear-gradient'/g,
        "from 'react-native-linear-gradient'"
      );
      
      // 替换expo-speech为react-native-tts
      content = content.replace(
        /from 'expo-speech'/g,
        "from 'react-native-tts'"
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ 已更新: ${filePath}`);
    }
  });
}

// 初始化React Native项目
function initReactNative() {
  console.log('\n🏗️ 初始化React Native项目...');
  
  try {
    // 如果android目录不存在，初始化项目
    if (!fs.existsSync('android')) {
      console.log('⚠️  Android目录不存在，请先运行 npx react-native init 或使用现有的android目录');
      console.log('提示：Android项目结构应该已经存在于项目中');
      process.exit(1);
    }
    
    // 更新Android配置
    updateAndroidConfig();
    
  } catch (error) {
    console.error('❌ React Native项目初始化失败:', error.message);
    process.exit(1);
  }
}

// 更新Android配置
function updateAndroidConfig() {
  console.log('\n⚙️ 更新Android配置...');
  
  // 更新app名称和包名
  const buildGradlePath = 'android/app/build.gradle';
  if (fs.existsSync(buildGradlePath)) {
    let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
    
    // 更新包名
    buildGradle = buildGradle.replace(
      /applicationId\s+".*"/,
      'applicationId "com.aicompanion.app"'
    );
    
    // 更新版本
    buildGradle = buildGradle.replace(
      /versionCode\s+\d+/,
      'versionCode 1'
    );
    buildGradle = buildGradle.replace(
      /versionName\s+".*"/,
      'versionName "1.0.0"'
    );
    
    fs.writeFileSync(buildGradlePath, buildGradle);
    console.log('✅ Android build.gradle已更新');
  }
  
  // 更新strings.xml
  const stringsXmlPath = 'android/app/src/main/res/values/strings.xml';
  if (fs.existsSync(stringsXmlPath)) {
    const stringsXml = `<resources>
    <string name="app_name">灵动陪伴</string>
</resources>`;
    fs.writeFileSync(stringsXmlPath, stringsXml);
    console.log('✅ strings.xml已更新');
  }
}

// 安装依赖
function installDependencies() {
  console.log('\n📦 安装项目依赖...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成');
    
    // 链接原生依赖
    console.log('🔗 链接原生依赖...');
    execSync('npx react-native link', { stdio: 'inherit' });
    console.log('✅ 原生依赖链接完成');
    
  } catch (error) {
    console.error('❌ 依赖安装失败');
    process.exit(1);
  }
}

// 构建APK
function buildAPK() {
  console.log('\n🏗️ 开始构建APK...');
  console.log('📝 这可能需要几分钟时间，请耐心等待...\n');
  
  try {
    // 清理项目
    execSync('cd android && ./gradlew clean', { stdio: 'inherit' });
    
    // 构建Release APK
    execSync('cd android && ./gradlew assembleRelease', { stdio: 'inherit' });
    
    // 检查APK文件
    const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    if (fs.existsSync(apkPath)) {
      console.log('\n🎉 APK构建完成！');
      console.log(`📱 APK文件位置: ${apkPath}`);
      
      // 复制APK到根目录
      const targetPath = '灵动陪伴-v1.0.0.apk';
      fs.copyFileSync(apkPath, targetPath);
      console.log(`📱 APK已复制到: ${targetPath}`);
      
      // 显示文件大小
      const stats = fs.statSync(targetPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📊 APK大小: ${fileSizeInMB} MB`);
      
    } else {
      console.error('❌ APK文件未找到');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ APK构建失败:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查Android SDK配置');
    console.log('2. 确认Java环境正确');
    console.log('3. 检查项目依赖');
    console.log('4. 运行: npm run clean 后重试');
    process.exit(1);
  }
}

// 主函数
async function main() {
  try {
    checkEnvironment();
    convertToReactNative();
    updateImports();
    initReactNative();
    installDependencies();
    buildAPK();
    
    console.log('\n🎉 构建完成！');
    console.log('📱 您现在可以安装APK文件到Android设备上了');
    
  } catch (error) {
    console.error('\n❌ 构建过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行构建
main();