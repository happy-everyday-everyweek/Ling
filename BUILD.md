# 灵定位 APK 构建指南

## 快速构建

### 方法一：自动构建脚本（推荐）
```bash
node build-apk.js
```

### 方法二：手动构建步骤
```bash
# 1. 安装依赖
npm install

# 2. 安装构建工具（如果未安装）
npm install -g @expo/cli @expo/eas-cli

# 3. 登录Expo账号
expo login

# 4. 配置EAS构建（首次构建）
eas build:configure

# 5. 构建APK
npm run build:preview
```

## 构建配置说明

### EAS构建配置 (eas.json)
- **preview**: 构建APK文件，用于测试分发
- **production**: 构建AAB文件，用于Google Play商店

### 应用配置 (app.json)
- **包名**: com.soulcompanion.app
- **版本**: 1.0.0
- **权限**: 录音、存储访问

## 构建后下载

1. 构建完成后，访问 [Expo开发者控制台](https://expo.dev)
2. 进入项目 → Builds 页面
3. 下载生成的APK文件

## 常见问题

### 构建失败
- 检查网络连接
- 确认Expo账号登录状态
- 验证app.json配置正确性

### 图标问题
- 确保assets目录包含所需图标文件
- 图标尺寸要求：
  - icon.png: 1024x1024
  - adaptive-icon.png: 1024x1024
  - splash.png: 1242x2436

### 权限问题
- Android权限已在app.json中配置
- 录音权限：RECORD_AUDIO
- 存储权限：READ/WRITE_EXTERNAL_STORAGE

## 本地测试

```bash
# 启动开发服务器
npm start

# 在Android设备上测试
npm run android
```

## 发布到应用商店

### Google Play商店
```bash
# 构建生产版本
npm run build:android

# 提交到商店
eas submit --platform android
```

## 技术支持

如遇到构建问题，请检查：
1. Node.js版本 >= 16
2. Expo CLI最新版本
3. EAS CLI最新版本
4. 网络连接稳定