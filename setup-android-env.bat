@echo off
chcp 65001 >nul
echo 🚀 开始部署Android开发环境...
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ 管理员权限已获取
) else (
    echo ❌ 需要管理员权限，请右键"以管理员身份运行"
    pause
    exit /b 1
)

REM 创建工作目录
set WORK_DIR=%USERPROFILE%\AndroidDev
if not exist "%WORK_DIR%" mkdir "%WORK_DIR%"
cd /d "%WORK_DIR%"

echo 📁 工作目录: %WORK_DIR%
echo.

REM 检查并安装Chocolatey
echo 🍫 检查Chocolatey包管理器...
where choco >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Chocolatey已安装
) else (
    echo 📦 正在安装Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    if %errorLevel% == 0 (
        echo ✅ Chocolatey安装成功
        refreshenv
    ) else (
        echo ❌ Chocolatey安装失败
        goto :error
    )
)

echo.

REM 安装Java JDK
echo ☕ 检查Java JDK...
java -version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Java已安装
    java -version
) else (
    echo 📦 正在安装Java JDK 17...
    choco install openjdk17 -y
    if %errorLevel% == 0 (
        echo ✅ Java JDK 17安装成功
        refreshenv
    ) else (
        echo ❌ Java安装失败
        goto :error
    )
)

echo.

REM 安装Node.js
echo 🟢 检查Node.js...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Node.js已安装
    node --version
    npm --version
) else (
    echo 📦 正在安装Node.js...
    choco install nodejs -y
    if %errorLevel% == 0 (
        echo ✅ Node.js安装成功
        refreshenv
    ) else (
        echo ❌ Node.js安装失败
        goto :error
    )
)

echo.

REM 安装Git
echo 🔧 检查Git...
git --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Git已安装
    git --version
) else (
    echo 📦 正在安装Git...
    choco install git -y
    if %errorLevel% == 0 (
        echo ✅ Git安装成功
        refreshenv
    ) else (
        echo ❌ Git安装失败
        goto :error
    )
)

echo.

REM 下载Android Studio
echo 🤖 下载Android Studio...
set ANDROID_STUDIO_URL=https://redirector.gvt1.com/edgedl/android/studio/install/2023.1.1.28/android-studio-2023.1.1.28-windows.exe
set ANDROID_STUDIO_FILE=%WORK_DIR%\android-studio-installer.exe

if exist "%ANDROID_STUDIO_FILE%" (
    echo ✅ Android Studio安装包已存在
) else (
    echo 📥 正在下载Android Studio...
    powershell -Command "& {$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri '%ANDROID_STUDIO_URL%' -OutFile '%ANDROID_STUDIO_FILE%'}"
    if %errorLevel% == 0 (
        echo ✅ Android Studio下载完成
    ) else (
        echo ❌ Android Studio下载失败，尝试备用方法...
        curl -L -o "%ANDROID_STUDIO_FILE%" "%ANDROID_STUDIO_URL%"
        if %errorLevel% neq 0 (
            echo ❌ 下载失败，请手动下载Android Studio
            echo 🌐 下载地址: https://developer.android.com/studio
            goto :error
        )
    )
)

echo.

REM 安装Android Studio
echo 🚀 安装Android Studio...
echo 📝 注意: 安装过程中请选择"Standard"安装类型
echo 📝 这将自动安装Android SDK和必要组件
echo.
pause

start /wait "" "%ANDROID_STUDIO_FILE%" /S

echo ✅ Android Studio安装完成
echo.

REM 设置环境变量
echo ⚙️ 配置环境变量...

REM 检测Android SDK路径
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
if not exist "%ANDROID_HOME%" (
    set ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk
)
if not exist "%ANDROID_HOME%" (
    set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
)

echo 📍 Android SDK路径: %ANDROID_HOME%

REM 设置系统环境变量
setx ANDROID_HOME "%ANDROID_HOME%" /M
setx ANDROID_SDK_ROOT "%ANDROID_HOME%" /M

REM 添加到PATH
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SYSTEM_PATH=%%b"

echo %SYSTEM_PATH% | find "%ANDROID_HOME%\platform-tools" >nul
if %errorLevel% neq 0 (
    setx PATH "%SYSTEM_PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin" /M
    echo ✅ PATH环境变量已更新
)

echo.

REM 安装React Native CLI
echo ⚛️ 安装React Native CLI...
npm install -g @react-native-community/cli
if %errorLevel% == 0 (
    echo ✅ React Native CLI安装成功
) else (
    echo ❌ React Native CLI安装失败
    goto :error
)

echo.

REM 创建验证脚本
echo 📝 创建环境验证脚本...
(
echo @echo off
echo chcp 65001 ^>nul
echo echo 🔍 验证Android开发环境...
echo echo.
echo.
echo echo ☕ Java版本:
echo java -version
echo echo.
echo.
echo echo 🟢 Node.js版本:
echo node --version
echo npm --version
echo echo.
echo.
echo echo 🤖 Android环境:
echo echo ANDROID_HOME: %%ANDROID_HOME%%
echo if exist "%%ANDROID_HOME%%\platform-tools\adb.exe" ^(
echo     echo ✅ ADB工具已安装
echo     "%%ANDROID_HOME%%\platform-tools\adb.exe" version
echo ^) else ^(
echo     echo ❌ ADB工具未找到
echo ^)
echo echo.
echo.
echo echo ⚛️ React Native CLI:
echo npx react-native --version
echo echo.
echo.
echo echo 🎯 环境验证完成！
echo pause
) > "%WORK_DIR%\verify-env.bat"

echo.

REM 创建项目构建脚本
echo 🔨 创建项目构建脚本...
(
echo @echo off
echo chcp 65001 ^>nul
echo echo 🚀 构建灵动陪伴APK...
echo echo.
echo.
echo REM 检查项目目录
echo if not exist "package.json" ^(
echo     echo ❌ 请在项目根目录运行此脚本
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo 📦 安装依赖...
echo npm install
echo.
echo echo 🏗️ 初始化Android项目...
echo if not exist "android" ^(
echo     npx react-native init TempProject --skip-install
echo     xcopy TempProject\android android\ /E /I /Y
echo     rmdir /s /q TempProject
echo ^)
echo.
echo echo 🔗 链接原生依赖...
echo npx react-native link
echo.
echo echo 🏗️ 构建APK...
echo cd android
echo gradlew.bat clean
echo gradlew.bat assembleRelease
echo.
echo echo 📱 复制APK文件...
echo if exist "app\build\outputs\apk\release\app-release.apk" ^(
echo     copy "app\build\outputs\apk\release\app-release.apk" "..\灵动陪伴-v1.0.0.apk"
echo     echo ✅ APK构建成功: 灵动陪伴-v1.0.0.apk
echo ^) else ^(
echo     echo ❌ APK构建失败
echo ^)
echo.
echo pause
) > "%WORK_DIR%\build-apk.bat"

echo.

REM 完成安装
echo 🎉 Android开发环境部署完成！
echo.
echo 📋 安装摘要:
echo ✅ Chocolatey包管理器
echo ✅ Java JDK 17
echo ✅ Node.js和npm
echo ✅ Git版本控制
echo ✅ Android Studio
echo ✅ React Native CLI
echo ✅ 环境变量配置
echo.
echo 📝 后续步骤:
echo 1. 重启计算机以确保环境变量生效
echo 2. 打开Android Studio完成初始设置
echo 3. 在Android Studio中安装Android SDK
echo 4. 运行 verify-env.bat 验证环境
echo 5. 使用 build-apk.bat 构建APK
echo.
echo 📁 相关文件位置:
echo - 工作目录: %WORK_DIR%
echo - 验证脚本: %WORK_DIR%\verify-env.bat
echo - 构建脚本: %WORK_DIR%\build-apk.bat
echo.
echo 🔄 请重启计算机后继续...
pause
goto :end

:error
echo.
echo ❌ 安装过程中出现错误！
echo 💡 建议:
echo 1. 检查网络连接
echo 2. 确保以管理员身份运行
echo 3. 关闭杀毒软件后重试
echo 4. 手动安装失败的组件
pause
exit /b 1

:end
echo.
echo 👋 安装脚本执行完成
exit /b 0