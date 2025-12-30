@echo off
chcp 65001 >nul
echo 🔍 验证Android开发环境...
echo.

echo ☕ Java版本:
java -version 2>nul
if %errorLevel% neq 0 (
    echo ❌ Java未安装或未配置
    echo 💡 请安装Java JDK 17
) else (
    echo ✅ Java环境正常
)
echo.

echo 🟢 Node.js版本:
node --version 2>nul
if %errorLevel% neq 0 (
    echo ❌ Node.js未安装
    echo 💡 请安装Node.js LTS版本
) else (
    echo ✅ Node.js环境正常
    node --version
)

npm --version 2>nul
if %errorLevel% neq 0 (
    echo ❌ npm未安装
) else (
    echo ✅ npm环境正常
    npm --version
)
echo.

echo 🤖 Android环境:
if "%ANDROID_HOME%"=="" (
    echo ❌ ANDROID_HOME环境变量未设置
    echo 💡 请设置ANDROID_HOME指向Android SDK目录
) else (
    echo ✅ ANDROID_HOME: %ANDROID_HOME%
)

if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ✅ ADB工具已安装
    "%ANDROID_HOME%\platform-tools\adb.exe" version 2>nul
) else (
    echo ❌ ADB工具未找到
    echo 💡 请安装Android SDK Platform-Tools
)
echo.

echo ⚛️ React Native CLI:
npx react-native --version 2>nul
if %errorLevel% neq 0 (
    echo ❌ React Native CLI未安装
    echo 💡 请运行: npm install -g @react-native-community/cli
) else (
    echo ✅ React Native CLI已安装
)
echo.

echo 🔧 Git版本:
git --version 2>nul
if %errorLevel% neq 0 (
    echo ❌ Git未安装
    echo 💡 请安装Git
) else (
    echo ✅ Git环境正常
    git --version
)
echo.

echo 📱 连接的Android设备:
if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    "%ANDROID_HOME%\platform-tools\adb.exe" devices 2>nul
) else (
    echo ❌ 无法检查设备连接状态
)
echo.

echo 🎯 环境验证完成！
echo.
echo 📋 如果有❌标记的项目，请按照提示进行修复
echo 💡 所有项目显示✅后，即可开始构建APK
echo.
pause