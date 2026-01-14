@echo off
echo 📦 下载 Gradle Wrapper...

REM 创建目录
if not exist "android\gradle\wrapper" mkdir android\gradle\wrapper

REM 下载 gradle-wrapper.jar
echo 正在下载 gradle-wrapper.jar...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/gradle/gradle/v7.6.1/gradle/wrapper/gradle-wrapper.jar' -OutFile 'android\gradle\wrapper\gradle-wrapper.jar'"

if exist "android\gradle\wrapper\gradle-wrapper.jar" (
    echo ✅ gradle-wrapper.jar 下载成功！
) else (
    echo ❌ 下载失败，尝试备用方法...
    
    REM 备用方法：使用 curl
    curl -L -o android\gradle\wrapper\gradle-wrapper.jar https://raw.githubusercontent.com/gradle/gradle/v7.6.1/gradle/wrapper/gradle-wrapper.jar
    
    if exist "android\gradle\wrapper\gradle-wrapper.jar" (
        echo ✅ gradle-wrapper.jar 下载成功！
    ) else (
        echo ❌ 下载失败，请手动下载
        echo 下载地址: https://raw.githubusercontent.com/gradle/gradle/v7.6.1/gradle/wrapper/gradle-wrapper.jar
        echo 保存到: android\gradle\wrapper\gradle-wrapper.jar
        exit /b 1
    )
)

echo 完成！
