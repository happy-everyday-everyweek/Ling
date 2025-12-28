#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建灵动陪伴APK...\n');

// 检查环境
function checkEnvironment() {
  console.log('🔍 检查构建环境...');
  
  // 检查React Native CLI
  try {
    execSync('npx react-native --version', { encoding: 'utf8' });
    console.log('✅ React Native CLI已安装');
  } catch (error) {
    console.log('📦 正在安装React Native CLI...');
    execSync('npm install -g @react-native-community/cli', { stdio: 'inherit' });
  }
  
  // 检查Android环境
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  if (!androidHome) {
    console.log('⚠️ 警告: ANDROID_HOME环境变量未设置');
    console.log('如果构建失败，请设置Android SDK路径');
  } else {
    console.log(`✅ Android SDK: ${androidHome}`);
  }
}

// 初始化React Native项目
function initProject() {
  console.log('\n🏗️ 初始化React Native项目...');
  
  if (!fs.existsSync('android')) {
    console.log('创建Android项目结构...');
    try {
      // 使用react-native init创建临时项目
      execSync('npx react-native init TempApp --skip-install', { stdio: 'inherit' });
      
      // 复制android目录
      if (fs.existsSync('TempApp/android')) {
        execSync('cp -r TempApp/android .', { stdio: 'inherit' });
        console.log('✅ Android项目结构已创建');
      }
      
      // 清理临时文件
      execSync('rm -rf TempApp', { stdio: 'inherit' });
      
    } catch (error) {
      console.error('❌ 项目初始化失败:', error.message);
      console.log('尝试手动创建项目结构...');
      createManualStructure();
    }
  } else {
    console.log('✅ Android项目结构已存在');
  }
  
  updateAndroidConfig();
}

// 手动创建项目结构
function createManualStructure() {
  console.log('手动创建Android项目结构...');
  
  // 创建基本目录结构
  const dirs = [
    'android',
    'android/app',
    'android/app/src',
    'android/app/src/main',
    'android/app/src/main/java',
    'android/app/src/main/java/com',
    'android/app/src/main/java/com/aicompanion',
    'android/app/src/main/java/com/aicompanion/app',
    'android/app/src/main/res',
    'android/app/src/main/res/values',
    'android/app/src/main/res/mipmap-hdpi',
    'android/app/src/main/res/mipmap-mdpi',
    'android/app/src/main/res/mipmap-xhdpi',
    'android/app/src/main/res/mipmap-xxhdpi',
    'android/app/src/main/res/mipmap-xxxhdpi',
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // 创建基本配置文件
  createAndroidFiles();
}

// 创建Android配置文件
function createAndroidFiles() {
  console.log('创建Android配置文件...');
  
  // build.gradle (项目级)
  const projectBuildGradle = `
buildscript {
    ext {
        buildToolsVersion = "33.0.0"
        minSdkVersion = 21
        compileSdkVersion = 33
        targetSdkVersion = 33
        ndkVersion = "23.1.7779620"
    }
    dependencies {
        classpath("com.android.tools.build:gradle:7.3.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}
`;
  
  // build.gradle (应用级)
  const appBuildGradle = `
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"

android {
    ndkVersion rootProject.ext.ndkVersion
    compileSdkVersion rootProject.ext.compileSdkVersion

    namespace "com.aicompanion.app"
    defaultConfig {
        applicationId "com.aicompanion.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation "com.facebook.react:react-android"
    implementation "com.facebook.react:react-native"
    
    debugImplementation("com.facebook.flipper:flipper:0.125.0")
    debugImplementation("com.facebook.flipper:flipper-network-plugin:0.125.0") {
        exclude group:'com.squareup.okhttp3', module:'okhttp'
    }
    debugImplementation("com.facebook.flipper:flipper-fresco-plugin:0.125.0")
}

apply from: file("../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"); applyNativeModulesAppBuildGradle(project)
`;

  // AndroidManifest.xml
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>
`;

  // strings.xml
  const stringsXml = `<resources>
    <string name="app_name">灵动陪伴</string>
</resources>`;

  // MainActivity.java
  const mainActivity = `package com.aicompanion.app;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {

  @Override
  protected String getMainComponentName() {
    return "AiCompanionApp";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }
}
`;

  // MainApplication.java
  const mainApplication = `package com.aicompanion.app;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return DefaultNewArchitectureEntryPoint.getFabricEnabled();
        }

        @Override
        protected Boolean isHermesEnabled() {
          return DefaultNewArchitectureEntryPoint.getHermesEnabled();
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, false);
    if (DefaultNewArchitectureEntryPoint.getFabricEnabled()) {
      DefaultNewArchitectureEntryPoint.load();
    }
  }
}
`;

  // 写入文件
  fs.writeFileSync('android/build.gradle', projectBuildGradle);
  fs.writeFileSync('android/app/build.gradle', appBuildGradle);
  fs.writeFileSync('android/app/src/main/AndroidManifest.xml', androidManifest);
  fs.writeFileSync('android/app/src/main/res/values/strings.xml', stringsXml);
  fs.writeFileSync('android/app/src/main/java/com/aicompanion/app/MainActivity.java', mainActivity);
  fs.writeFileSync('android/app/src/main/java/com/aicompanion/app/MainApplication.java', mainApplication);
  
  console.log('✅ Android配置文件已创建');
}

// 更新Android配置
function updateAndroidConfig() {
  console.log('\n⚙️ 更新Android配置...');
  
  // 确保strings.xml存在
  const stringsPath = 'android/app/src/main/res/values/strings.xml';
  if (!fs.existsSync(stringsPath)) {
    const stringsXml = `<resources>
    <string name="app_name">灵动陪伴</string>
</resources>`;
    fs.mkdirSync(path.dirname(stringsPath), { recursive: true });
    fs.writeFileSync(stringsPath, stringsXml);
  }
  
  console.log('✅ Android配置已更新');
}

// 构建APK
function buildAPK() {
  console.log('\n🏗️ 开始构建APK...');
  
  try {
    // 进入android目录并构建
    process.chdir('android');
    
    // 清理项目
    console.log('清理项目...');
    if (process.platform === 'win32') {
      execSync('gradlew.bat clean', { stdio: 'inherit' });
    } else {
      execSync('./gradlew clean', { stdio: 'inherit' });
    }
    
    // 构建Release APK
    console.log('构建Release APK...');
    if (process.platform === 'win32') {
      execSync('gradlew.bat assembleRelease', { stdio: 'inherit' });
    } else {
      execSync('./gradlew assembleRelease', { stdio: 'inherit' });
    }
    
    // 返回根目录
    process.chdir('..');
    
    // 检查APK文件
    const apkPath = 'android/app/build/outputs/apk/release/app-release.apk';
    if (fs.existsSync(apkPath)) {
      console.log('\n🎉 APK构建完成！');
      
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
    console.log('1. 确保Android SDK已正确安装');
    console.log('2. 设置ANDROID_HOME环境变量');
    console.log('3. 确保Java环境正确配置');
    console.log('4. 检查网络连接');
    process.exit(1);
  }
}

// 主函数
async function main() {
  try {
    checkEnvironment();
    initProject();
    buildAPK();
    
    console.log('\n🎉 构建完成！');
    console.log('📱 您现在可以将APK文件安装到Android设备上了');
    console.log('💡 安装方法: 将APK文件传输到手机，点击安装即可');
    
  } catch (error) {
    console.error('\n❌ 构建过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行构建
main();