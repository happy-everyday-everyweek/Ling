@echo off
chcp 65001 >nul
echo 🚀 开始设置灵定位AI情感陪伴应用...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 请先安装Node.js ^(版本16或更高^)
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js版本检查通过: 
node --version

REM 检查npm是否可用
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm未找到，请确保Node.js正确安装
    pause
    exit /b 1
)

REM 检查Expo CLI
echo 📦 检查Expo CLI...
expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 正在安装Expo CLI...
    npm install -g @expo/cli
    if %errorlevel% neq 0 (
        echo ❌ Expo CLI安装失败
        pause
        exit /b 1
    )
    echo ✅ Expo CLI安装完成
) else (
    echo ✅ Expo CLI已安装
)

REM 安装项目依赖
echo 📦 正在安装项目依赖...
npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

REM 创建assets目录
if not exist "assets" (
    mkdir assets
    echo ✅ 创建assets目录
)

REM 创建简单的图标文件
echo ^<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"^> > assets\icon.svg
echo   ^<defs^> >> assets\icon.svg
echo     ^<linearGradient id="grad" x1="0%%" y1="0%%" x2="100%%" y2="100%%"^> >> assets\icon.svg
echo       ^<stop offset="0%%" style="stop-color:#6C63FF;stop-opacity:1" /^> >> assets\icon.svg
echo       ^<stop offset="100%%" style="stop-color:#FF6B9D;stop-opacity:1" /^> >> assets\icon.svg
echo     ^</linearGradient^> >> assets\icon.svg
echo   ^</defs^> >> assets\icon.svg
echo   ^<circle cx="512" cy="512" r="500" fill="url(#grad)" /^> >> assets\icon.svg
echo   ^<text x="50%%" y="50%%" text-anchor="middle" dy=".3em" fill="white" font-size="300" font-family="Arial"^>灵^</text^> >> assets\icon.svg
echo ^</svg^> >> assets\icon.svg

echo ✅ 创建应用图标

echo.
echo 🎉 设置完成！
echo.
echo 📱 启动应用:
echo    npm start        # 启动开发服务器
echo    npm run android  # 在Android模拟器中运行
echo    npm run ios      # 在iOS模拟器中运行
echo.
echo 📝 使用说明:
echo 1. 首次启动需要输入DeepSeek API密钥
echo 2. 按住球体进行语音对话
echo 3. 上滑查看帖子，左滑写日记，右滑看心情统计
echo.
echo 🔗 获取API密钥: https://platform.deepseek.com/
echo 💡 如有问题，请查看README.md文件
echo.
pause