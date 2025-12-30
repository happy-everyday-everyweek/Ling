# 🤖 Android开发环境部署指南

## 🚀 自动化安装（推荐）

我已经为您创建了自动化安装脚本，一键部署完整的Android开发环境。

### 📋 安装步骤

1. **下载安装脚本**
   - 脚本文件：`setup-android-env.bat`

2. **以管理员身份运行**
   - 右键点击 `setup-android-env.bat`
   - 选择"以管理员身份运行"
   - 按照提示完成安装

3. **重启计算机**
   - 安装完成后重启以确保环境变量生效

### 🎯 自动安装内容

- ✅ **Chocolatey** - Windows包管理器
- ✅ **Java JDK 17** - Android开发必需
- ✅ **Node.js** - React Native运行环境
- ✅ **Git** - 版本控制工具
- ✅ **Android Studio** - Android开发IDE
- ✅ **React Native CLI** - RN命令行工具
- ✅ **环境变量配置** - 自动设置所有必要的环境变量

## 🔧 手动安装步骤（备用方案）

如果自动安装失败，可以按以下步骤手动安装：

### 1. 安装Java JDK

```bash
# 使用Chocolatey安装
choco install openjdk17 -y

# 或者手动下载安装
# 访问: https://adoptium.net/
# 下载Java 17 LTS版本
```

### 2. 安装Node.js

```bash
# 使用Chocolatey安装
choco install nodejs -y

# 或者手动下载安装
# 访问: https://nodejs.org/
# 下载LTS版本
```

### 3. 安装Android Studio

1. **下载Android Studio**
   - 访问：https://developer.android.com/studio
   - 下载最新版本

2. **安装Android Studio**
   - 运行安装程序
   - 选择"Standard"安装类型
   - 这将自动安装Android SDK

3. **配置Android SDK**
   - 打开Android Studio
   - 进入 Settings > Appearance & Behavior > System Settings > Android SDK
   - 安装以下组件：
     - Android SDK Platform 33
     - Android SDK Build-Tools 33.0.0
     - Android SDK Platform-Tools
     - Android SDK Tools

### 4. 设置环境变量

#### Windows系统：

1. **设置ANDROID_HOME**
   ```cmd
   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk" /M
   setx ANDROID_SDK_ROOT "%LOCALAPPDATA%\Android\Sdk" /M
   ```

2. **添加到PATH**
   ```cmd
   # 添加以下路径到系统PATH环境变量：
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

### 5. 安装React Native CLI

```bash
npm install -g @react-native-community/cli
```

## 🔍 环境验证

安装完成后，运行以下命令验证环境：

```bash
# 检查Java
java -version

# 检查Node.js
node --version
npm --version

# 检查Android工具
adb version

# 检查React Native CLI
npx react-native --version
```

或者运行自动生成的验证脚本：
```cmd
verify-env.bat
```

## 🏗️ 构建APK

环境配置完成后，使用以下方法构建APK：

### 方法1：使用自动构建脚本
```cmd
build-apk.bat
```

### 方法2：手动构建
```bash
# 1. 安装依赖
npm install

# 2. 初始化Android项目（如果需要）
npx react-native init TempProject --skip-install
cp -r TempProject/android .
rm -rf TempProject

# 3. 链接原生依赖
npx react-native link

# 4. 构建APK
cd android
./gradlew assembleRelease
```

## 🐛 常见问题解决

### 1. ANDROID_HOME未设置
```bash
# 检查环境变量
echo %ANDROID_HOME%

# 如果为空，手动设置
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk" /M
```

### 2. ADB命令不可用
```bash
# 检查PATH中是否包含platform-tools
echo %PATH% | findstr platform-tools

# 如果没有，添加到PATH
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools" /M
```

### 3. Gradle构建失败
```bash
# 清理项目
cd android
./gradlew clean

# 重新构建
./gradlew assembleRelease --stacktrace
```

### 4. 网络问题
```bash
# 配置npm镜像
npm config set registry https://registry.npmmirror.com

# 配置Gradle镜像
# 在 android/gradle.properties 中添加：
# systemProp.http.proxyHost=127.0.0.1
# systemProp.http.proxyPort=7890
```

## 📱 设备调试

### 启用USB调试
1. 在Android设备上进入"设置"
2. 找到"关于手机"
3. 连续点击"版本号"7次启用开发者选项
4. 返回设置，进入"开发者选项"
5. 启用"USB调试"

### 连接设备
```bash
# 检查连接的设备
adb devices

# 如果显示设备，说明连接成功
```

## 🎯 性能优化建议

1. **增加Java堆内存**
   ```bash
   # 在 android/gradle.properties 中添加：
   org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
   ```

2. **启用Gradle守护进程**
   ```bash
   # 在 android/gradle.properties 中添加：
   org.gradle.daemon=true
   org.gradle.parallel=true
   org.gradle.configureondemand=true
   ```

3. **使用本地Gradle缓存**
   ```bash
   # 设置Gradle缓存目录
   set GRADLE_USER_HOME=D:\gradle-cache
   ```

## 📞 技术支持

如果遇到问题：
1. 检查所有环境变量是否正确设置
2. 确认Android SDK组件已完整安装
3. 重启计算机后重试
4. 查看详细的错误日志

---

**使用自动安装脚本可以大大简化部署过程，推荐优先使用！**