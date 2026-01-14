@echo off
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

REM 如果android目录不存在，提示错误
if not exist "android" (
    echo ❌ Android目录不存在！
    echo 请确保项目包含完整的android目录结构
    exit /b 1
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
if exist "app\build\outputs\apk\release\app-release.apk" (
    echo 🎉 APK构建成功！
    
    REM 复制APK到根目录
    copy "app\build\outputs\apk\release\app-release.apk" "..\灵动陪伴-v1.0.0.apk"
    echo 📱 APK已复制到: 灵动陪伴-v1.0.0.apk
    
    echo ✅ 构建完成！
) else (
    echo ❌ APK构建失败
    exit /b 1
)
