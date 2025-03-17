# 通过Vercel部署钢琴块游戏

## 第一步：准备游戏文件
1. 将您的所有游戏文件（index.html、styles.css、script.js、gameLogic.js、audioManager.js、imageManager.js）放在一个文件夹中

## 第二步：注册Vercel账号
1. 访问 [Vercel官网](https://vercel.com/)
2. 点击"Sign Up"，可以使用GitHub、GitLab、Bitbucket账号或电子邮件注册

## 第三步：部署方式选择
### 方式一：通过GitHub部署（推荐）
1. 首先，将您的游戏上传到GitHub仓库（参考GitHub部署指南）
2. 在Vercel仪表板，点击"New Project"
3. 导入您的GitHub仓库
4. 保持默认设置，点击"Deploy"
5. 等待几秒钟，您的网站就会被部署

### 方式二：直接上传部署
1. 安装Vercel CLI工具：在命令行中运行 `npm i -g vercel`
2. 在游戏文件夹中，运行 `vercel login` 并登录
3. 然后运行 `vercel` 命令，按照提示完成部署

## 第四步：获取和分享链接
1. 部署完成后，Vercel会自动生成一个链接（通常格式为 https://项目名-随机字符.vercel.app）
2. 您可以直接将此链接分享给朋友，他们就可以通过浏览器访问游戏

## 第五步：自定义域名（可选）
1. 在项目仪表板中，点击"Settings" > "Domains"
2. 您可以添加自己的域名，或使用Vercel提供的免费子域名（format.vercel.app）

## 优势
- 完全免费
- 自动HTTPS安全连接
- 全球CDN加速
- 与GitHub等版本控制系统无缝集成
- 自动预览和部署（当您更新代码时） 