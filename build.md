## 组件库发布流程

1. 注册 npm 账号

2. 登录 npm
   在终端中运行以下命令登录： npm login
   输入你的用户名、密码和邮箱地址

3. 注意点
   检查 package.json 配置 你的 package.json 已经包含了必要的发布配置：
   name: 包名称为 "pangcg-components"
   version: 当前版本为 "0.0.1" 【每次发版需要更新 version 的值】
   files: 指定发布时包含的文件/目录为 "dist"
   publishConfig: 已设置为 public 访问权限

4. 构建项目
   构建项目 在发布前构建项目，你的 package.json 中已经配置了 prepublishOnly 脚本，它会在发布前自动运行 father doctor 和 build：
   命令：npm run build

5. 发布包  
   命令：npm publish

## 文档发布流程

1. 检查：package.json 文件
   "dev": "dumi dev",
   "docs:build":"dumi build"".
   "deploy": "gh-pages -d dist-docs"
   "deploy":"gh-pages -d docs-dist'
   "predeploy": "npm run docs:build"
   "doctor": "father doctor"
   "lint": "npm run lint:es && npm run lint:css",

2. 运行部署命令
   npm run deploy

3. 运行部署命令讲解
   npm run deploy 该命令会执行以下操作:
   首先通过 predeploy 脚本运行 npm run docs:build 构建文档。然后执行 gh-pages -d docs-dist 将构建好的文档部署到 GitHub Pages
   部署成功后，您的文档将会发布到:https://<您的 GitHub 用户名>.github.io/pangcg-components/
   注意:
   1. 您的配置文件.dumirc.ts 已经正确设置了 base 和 publicPath 为/pangcg-components/
   2. 首次部署后，请检查 GitHub 仓库的设置，确保 GitHub Pages 的分支设置为 gh-pages 分支
   3. 如需更新文档，只需再次运行 npm run deploy 即可。
