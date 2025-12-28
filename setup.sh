#!/bin/bash

echo "🚀 开始设置灵定位AI情感陪伴应用..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装Node.js (版本16或更高)"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ 需要Node.js 16或更高版本，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本检查通过: $(node -v)"

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo "❌ npm未找到，请确保Node.js正确安装"
    exit 1
fi

# 安装Expo CLI
echo "📦 检查Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "正在安装Expo CLI..."
    npm install -g @expo/cli
    if [ $? -ne 0 ]; then
        echo "❌ Expo CLI安装失败"
        exit 1
    fi
    echo "✅ Expo CLI安装完成"
else
    echo "✅ Expo CLI已安装"
fi

# 安装项目依赖
echo "📦 正在安装项目依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi
echo "✅ 依赖安装完成"

# 创建assets目录
if [ ! -d "assets" ]; then
    mkdir assets
    echo "✅ 创建assets目录"
fi

# 创建简单的图标文件（SVG格式）
cat > assets/icon.svg << 'EOF'
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6C63FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF6B9D;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="500" fill="url(#grad)" />
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="300" font-family="Arial, sans-serif">灵</text>
</svg>
EOF

echo "✅ 创建应用图标"

echo ""
echo "🎉 设置完成！"
echo ""
echo "📱 启动应用:"
echo "   npm start        # 启动开发服务器"
echo "   npm run android  # 在Android模拟器中运行"
echo "   npm run ios      # 在iOS模拟器中运行"
echo ""
echo "📝 使用说明:"
echo "1. 首次启动需要输入DeepSeek API密钥"
echo "2. 按住球体进行语音对话"
echo "3. 上滑查看帖子，左滑写日记，右滑看心情统计"
echo ""
echo "🔗 获取API密钥: https://platform.deepseek.com/"
echo "💡 如有问题，请查看README.md文件"