#!/bin/bash

# ==================== 配置信息 ====================
# 云服务器信息
SERVER_USER="ubuntu"
SERVER_IP="106.54.204.153"
SERVER_TARGET_PATH="~/frontend/pangcg-components/"

# 本地项目信息
LOCAL_PROJECT_PATH="/Users/pangconggang/project/myproject/pangcg-components-project/pangcg-components"
LOCAL_DIST_PATH="docs-dist"
# ==================================================

echo "================ PangCG 组件库发布脚本 ================"

# 1. 进入项目目录
echo "1. 进入项目目录: $LOCAL_PROJECT_PATH"
cd $LOCAL_PROJECT_PATH || { echo "项目目录不存在！"; exit 1; }

# 2. 打包项目
echo "2. 开始打包项目..."
yarn run docs:build || { echo "打包失败！"; exit 1; }

# 3. 临时关闭代理（如果需要）
echo "3. 临时关闭代理..."
unset ALL_PROXY && unset HTTPS_PROXY

# 4. 上传文件到服务器
echo "4. 上传文件到服务器..."
scp -r $LOCAL_DIST_PATH $SERVER_USER@$SERVER_IP:$SERVER_TARGET_PATH || { echo "文件上传失败！"; exit 1; }

# 5. 登录服务器并重启服务
echo "5. 登录服务器并重启 Nginx 服务..."
ssh $SERVER_USER@$SERVER_IP "cd ~ && docker-compose down && docker-compose up -d" || { echo "重启服务失败！"; exit 1; }

echo "===================================================="
echo "🎉 发布成功！请访问: http://$SERVER_IP/pangcg-components/"
echo "===================================================="