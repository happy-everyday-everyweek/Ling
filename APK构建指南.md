# 灵定位 APK 构建指南

## 🚀 快速构建

### 方法一：一键构建（推荐）
```bash
npm run build:apk
```

### 方法二：手动构建
```bash
# 1. 登录Expo账号（首次构建）
eas login

# 2. 构建APK
eas build --platform android --profile preview
```

## 📋 构建前准备

### 1. 确认环境
- ✅ Node.js已安装
- ✅ EAS CLI已安装 (eas-cli/16.28.0)
- ✅ 项目依赖已安装

### 2. 检查配置文件
- ✅ `app.json` - 应用配置
- ✅ `eas.json` - 构建配置
- ✅ `assets/` - 应用图标

### 3. 应用信息
- **应用名称**: 灵定位
- **包名**: com.soulcompanion.app
- **版本**: 1.0.0

## 🔧 构建配置

### EAS构建配置 (eas.json)
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Android权限
- 录音权限 (RECORD_AUDIO)
- 存储权限 (READ/WRITE_EXTERNAL_STORAGE)

## 📱 构建流程

1. **登录验证**: 首次构建需要登录Expo账号
2. **配置检查**: 自动验证配置文件完整性
3. **云端构建**: 在Expo服务器上构建APK
4. **下载链接**: 构建完成后获得下载链接

## 📥 下载APK

构建完成后：
1. 访问 [Expo控制台](https://expo.dev/)
2. 进入项目 → Builds 页面
3. 下载生成的APK文件

## ⚠️ 常见问题

### 构建失败
```bash
# 重新登录
eas login

# 清理缓存
npm install

# 重新构建
npm run build:apk
```

### 图标问题
- 确保assets目录包含所需图标
- 图标尺寸要求：1024x1024 (icon.png, adaptive-icon.png)

### 网络问题
- 确保网络连接稳定
- 可能需要科学上网访问Expo服务

## 🎯 构建选项

### 预览版 (推荐)
```bash
npm run build:preview
# 生成APK文件，适合测试分发
```

### 生产版
```bash
npm run build:android
# 生成AAB文件，适合应用商店
```

## 📞 技术支持

如遇到问题：
1. 检查网络连接
2. 确认Expo账号状态
3. 验证配置文件正确性
4. 查看构建日志获取详细错误信息

---

**注意**: 首次构建可能需要5-10分钟，请耐心等待。