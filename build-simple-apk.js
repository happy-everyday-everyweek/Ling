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

// 创建Gradle Wrapper
function createGradleWrapper() {
  console.log('创建Gradle Wrapper...');
  
  // 创建gradlew脚本
  const gradlewScript = `#!/bin/sh

# Gradle start up script for UN*X

# Attempt to set APP_HOME
# Resolve links: $0 may be a link
PRG="$0"
# Need this for relative symlinks.
while [ -h "$PRG" ] ; do
    ls=\`ls -ld "$PRG"\`
    link=\`expr "$ls" : '.*-> \\(.*\\)$'\`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=\`dirname "$PRG"\`"/$link"
    fi
done
SAVED="\`pwd\`"
cd "\`dirname \\"$PRG\\"\`/" >/dev/null
APP_HOME="\`pwd -P\`"
cd "$SAVED" >/dev/null

APP_NAME="Gradle"
APP_BASE_NAME=\`basename "$0"\`

# Use the maximum available, or set MAX_FD != -1 to use that value.
MAX_FD="maximum"

warn ( ) {
    echo "$*"
}

die ( ) {
    echo
    echo "$*"
    echo
    exit 1
}

# OS specific support (must be 'true' or 'false').
cygwin=false
msys=false
darwin=false
case "\`uname\`" in
  CYGWIN* )
    cygwin=true
    ;;
  Darwin* )
    darwin=true
    ;;
  MINGW* )
    msys=true
    ;;
esac

# For Cygwin, ensure paths are in UNIX format before anything is touched.
if $cygwin ; then
    [ -n "$JAVA_HOME" ] && JAVA_HOME=\`cygpath --unix "$JAVA_HOME"\`
fi

# Attempt to set ANDROID_HOME
if [ -z "$ANDROID_HOME" ] ; then
    if [ -x "$ANDROID_SDK_ROOT/platform-tools/adb" ] ; then
        export ANDROID_HOME="$ANDROID_SDK_ROOT"
    elif [ -x "$HOME/Android/Sdk/platform-tools/adb" ] ; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -x "/usr/local/android-sdk/platform-tools/adb" ] ; then
        export ANDROID_HOME="/usr/local/android-sdk"
    fi
fi

# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        # IBM's JDK on AIX uses strange locations for the executables
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
else
    JAVACMD="java"
    which java >/dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
fi

# Increase the maximum file descriptors if we can.
if [ "$cygwin" = "false" -a "$darwin" = "false" ] ; then
    MAX_FD_LIMIT=\`ulimit -H -n\`
    if [ $? -eq 0 ] ; then
        if [ "$MAX_FD" = "maximum" -o "$MAX_FD" = "max" ] ; then
            MAX_FD="$MAX_FD_LIMIT"
        fi
        ulimit -n $MAX_FD
        if [ $? -ne 0 ] ; then
            warn "Could not set maximum file descriptor limit: $MAX_FD"
        fi
    else
        warn "Could not query maximum file descriptor limit: $MAX_FD_LIMIT"
    fi
fi

# For Darwin, add options to specify how the application appears in the dock
if $darwin; then
    GRADLE_OPTS="$GRADLE_OPTS \\"-Xdock:name=$APP_NAME\\" \\"-Xdock:icon=$APP_HOME/media/gradle.icns\\""
fi

# For Cygwin, switch paths to Windows format before running java
if $cygwin ; then
    APP_HOME=\`cygpath --path --mixed "$APP_HOME"\`
    CLASSPATH=\`cygpath --path --mixed "$CLASSPATH"\`
fi

# Find gradle
if [ -f "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" ] ; then
    GRADLE_JAR="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"
else
    # Use system gradle if wrapper not found
    GRADLE_JAR=""
fi

if [ -n "$GRADLE_JAR" ] ; then
    exec "$JAVACMD" $DEFAULT_JVM_OPTS $JAVA_OPTS $GRADLE_OPTS \\"-Dorg.gradle.appname=$APP_BASE_NAME\\" -classpath "$GRADLE_JAR" org.gradle.wrapper.GradleWrapperMain "$@"
else
    # Fallback to system gradle
    exec gradle "$@"
fi
`;

  // 创建gradlew.bat脚本
  const gradlewBatScript = `@rem Gradle startup script for Windows

@rem Set local scope for the variables with windows NT shell
if "%OS%"=="Windows_NT" setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve any "." and ".." in APP_HOME to make it shorter.
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here. You can also use JAVA_OPTS and GRADLE_OPTS to pass JVM options to this script.
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME goto findJavaFromJavaHome

set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if "%ERRORLEVEL%" == "0" goto execute

echo.
echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:findJavaFromJavaHome
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

echo.
echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
echo.
echo Please set the JAVA_HOME variable in your environment to match the
echo location of your Java installation.

goto fail

:execute
@rem Setup the command line

set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar

@rem Execute Gradle
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*

:end
@rem End local scope for the variables with windows NT shell
if "%ERRORLEVEL%"=="0" goto mainEnd

:fail
rem Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
rem the _cmd_ return code when the batch file is called from a command line.
if not "" == "%GRADLE_EXIT_CONSOLE%" exit 1
exit /b 1

:mainEnd
if "%OS%"=="Windows_NT" endlocal

:omega
`;

  // 写入gradlew文件
  fs.writeFileSync('android/gradlew', gradlewScript);
  fs.writeFileSync('android/gradlew.bat', gradlewBatScript);
  
  // 设置执行权限
  try {
    execSync('chmod +x android/gradlew', { stdio: 'inherit' });
  } catch (error) {
    console.log('设置gradlew权限时出现警告:', error.message);
  }
  
  // 创建gradle wrapper目录和属性文件
  const wrapperDir = 'android/gradle/wrapper';
  if (!fs.existsSync(wrapperDir)) {
    fs.mkdirSync(wrapperDir, { recursive: true });
  }
  
  const gradleWrapperProperties = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-7.6.1-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;
  
  fs.writeFileSync('android/gradle/wrapper/gradle-wrapper.properties', gradleWrapperProperties);
  
  console.log('✅ Gradle Wrapper已创建');
}

// 构建APK
function buildAPK() {
  console.log('\n🏗️ 开始构建APK...');
  
  try {
    // 进入android目录并构建
    process.chdir('android');
    
    // 创建Gradle Wrapper
    process.chdir('..');
    createGradleWrapper();
    process.chdir('android');
    
    // 使用系统gradle进行构建
    console.log('清理项目...');
    try {
      if (process.platform === 'win32') {
        execSync('gradlew.bat clean', { stdio: 'inherit' });
      } else {
        execSync('./gradlew clean', { stdio: 'inherit' });
      }
    } catch (error) {
      console.log('使用系统gradle清理...');
      execSync('gradle clean', { stdio: 'inherit' });
    }
    
    // 构建Release APK
    console.log('构建Release APK...');
    try {
      if (process.platform === 'win32') {
        execSync('gradlew.bat assembleRelease', { stdio: 'inherit' });
      } else {
        execSync('./gradlew assembleRelease', { stdio: 'inherit' });
      }
    } catch (error) {
      console.log('使用系统gradle构建...');
      execSync('gradle assembleRelease', { stdio: 'inherit' });
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