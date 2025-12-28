#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 快速构建灵动陪伴APK...\n');

// 检查是否有Android项目
if (!fs.existsSync('android')) {
  console.log('❌ 未找到Android项目目录');
  console.log('请先运行完整的项目初始化');
  process.exit(1);
}

// 尝试使用不同的构建方法
function tryBuild() {
  console.log('🏗️ 尝试构建APK...');
  
  const buildCommands = [
    // 方法1: 使用npx
    'npx react-native run-android --variant=release',
    // 方法2: 直接使用gradle
    'cd android && gradle assembleRelease',
    // 方法3: 使用gradlew
    process.platform === 'win32' ? 'cd android && gradlew.bat assembleRelease' : 'cd android && ./gradlew assembleRelease'
  ];
  
  for (const command of buildCommands) {
    try {
      console.log(`尝试命令: ${command}`);
      execSync(command, { stdio: 'inherit' });
      
      // 检查APK是否生成
      const apkPath = 'android/app/build/outputs/apk/release/app-release.apk';
      if (fs.existsSync(apkPath)) {
        console.log('\n🎉 APK构建成功！');
        
        // 复制APK
        const targetPath = '灵动陪伴-v1.0.0.apk';
        fs.copyFileSync(apkPath, targetPath);
        console.log(`📱 APK已复制到: ${targetPath}`);
        
        const stats = fs.statSync(targetPath);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`📊 APK大小: ${fileSizeInMB} MB`);
        
        return true;
      }
      
    } catch (error) {
      console.log(`❌ 命令失败: ${command}`);
      console.log(`错误: ${error.message}`);
      continue;
    }
  }
  
  return false;
}

// 创建简单的APK构建配置
function createSimpleBuild() {
  console.log('📝 创建简化构建配置...');
  
  // 创建简单的build.gradle
  const simpleBuildGradle = `
apply plugin: "com.android.application"

android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"

    defaultConfig {
        applicationId "com.aicompanion.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation 'com.facebook.react:react-native:+'
}
`;

  // 确保目录存在
  const appDir = 'android/app';
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  
  // 写入简化的build.gradle
  fs.writeFileSync(path.join(appDir, 'build.gradle'), simpleBuildGradle);
  
  console.log('✅ 简化构建配置已创建');
}

// 主函数
function main() {
  try {
    // 如果构建失败，创建简化配置
    if (!tryBuild()) {
      console.log('\n🔧 尝试创建简化构建配置...');
      createSimpleBuild();
      
      if (!tryBuild()) {
        console.log('\n❌ 所有构建方法都失败了');
        console.log('\n💡 建议:');
        console.log('1. 安装Android Studio');
        console.log('2. 设置ANDROID_HOME环境变量');
        console.log('3. 确保Java环境正确');
        console.log('4. 或者使用在线构建服务');
        process.exit(1);
      }
    }
    
    console.log('\n🎉 构建完成！');
    console.log('📱 APK文件已准备就绪，可以安装到Android设备');
    
  } catch (error) {
    console.error('❌ 构建过程出错:', error.message);
    process.exit(1);
  }
}

main();