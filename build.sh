#!/bin/bash

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
