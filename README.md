# Telegram 群管理机器人（Cloudflare Workers）

一个基于Cloudflare Worker的自用Telegram群垃圾消息删除机器人。

欢迎fork，但请记得保留[其他](#其他)的内容
## 功能

- 链接删除
- 联系人卡片删除
- 外部引用回复删除
- 关键词检测
- 个人简介检测

## 准备工作

### 一、创建 Telegram Bot

1. 在 Telegram 搜索 **@BotFather**
2. 发送 `/start`
3. 发送 `/newbot`
4. 按提示输入：
   - 机器人名称
   - 机器人用户名（必须以 `bot` 结尾）
5. 获取 **Bot Token**，格式示例：
123456789:AAxxxxxxxxxxxxxxxxxxxx

### 二、将机器人加入群聊

- 把机器人加入需要管理的群聊
- 设置为 **管理员**
- 至少勾选以下权限：
  - 删除消息
  - 读取消息

## 部署

### 1.创建 Worker
1.![img_1.png](assets%2Fimages%2Fimg_1.png)
2.![img_2.png](assets%2Fimages%2Fimg_2.png)

3.![img_3.png](assets%2Fimages%2Fimg_3.png)
4.![img_4.png](assets%2Fimages%2Fimg_4.png)

5.选择刚刚创建的Worker，把worker.js放进去
![img_5.png](assets%2Fimages%2Fimg_5.png)

6.修改机器人Token
```
const BOT_TOKEN = 'xxxxxxx';
```
将xxxxxxx改成你自己的机器人token

7.修改白名单列表，也就是不会被机器人检测消息的用户id
```
const WHITE_LIST_ID = new Set([
	123456,
	78945612
]);
```
这里使用的是id，不知道什么是id的请加群询问 https://t.me/oyDevelopersClub

8.修改完后记得点部署

## 设置Webhook

当一切就绪后，在浏览器中访问：
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<WORKER_URL>/webhook
![img.png](assets%2Fimages%2Fimg.png)

例如：`https://api.telegram.org/bot123456789:AAxxxxxxxxxxxxxxxxxxxx/setWebhook?url=https://aaaabbbb.wokers.dev/webhook`
![img_6.png](assets%2Fimages%2Fimg_6.png)

设置成功后你会看到这样的提示：
{"ok":true,"result":true,"description":"Webhook is set"}

## 其他

作者 欧阳([@OuYoung](https://t.me/ouyoung))

如果部署遇到问题，欢迎来群内找人解答 https://t.me/oyDevelopersClub
