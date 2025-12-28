# 灵动陪伴 - APK构建指南

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
   - 将 %ANDROID_HOME%\platform-tools 添加到PATH

## 构建步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 初始化React Native项目
```bash
npx react-native init TempProject
cp -r TempProject/android .
cp -r TempProject/ios .
rm -rf TempProject
```

### 3. 链接原生依赖
```bash
npx react-native link
```

### 4. 构建APK
```bash
cd android
./gradlew assembleRelease
```

### 5. 获取APK文件
构建完成后，APK文件位于：
`android/app/build/outputs/apk/release/app-release.apk`

## 故障排除

### 常见问题
1. **ANDROID_HOME未设置**
   - 确保环境变量正确设置
   - 重启命令行工具

2. **Gradle构建失败**
   - 检查网络连接
   - 清理项目：`./gradlew clean`
   - 重新构建

3. **依赖冲突**
   - 删除node_modules：`rm -rf node_modules`
   - 重新安装：`npm install`

### Windows用户
- 使用 `gradlew.bat` 而不是 `./gradlew`
- 确保启用开发者模式

### 构建优化
- 使用 `--release` 标志构建生产版本
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
