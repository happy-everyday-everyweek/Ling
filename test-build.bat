@echo off
echo 开始测试构建...

echo 1. 清理缓存...
call npm run clean
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 2. 安装依赖...
call npm install

echo 3. 创建必要的Android文件...
if not exist android\app\src\main\java\com\aicompanion\app mkdir android\app\src\main\java\com\aicompanion\app
if not exist android\app\src\main\res\values mkdir android\app\src\main\res\values

echo 4. 创建debug keystore...
if not exist android\app\debug.keystore (
    keytool -genkeypair -v -keystore android\app\debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
)

echo 5. 构建APK...
cd android
call gradlew clean
call gradlew assembleRelease --stacktrace --info
cd ..

echo 构建完成！
pause