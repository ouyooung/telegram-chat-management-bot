/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const BOT_TOKEN = 'xxxxxxx'; //改成你自己的机器人Token
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * 要删除的实体类型
 * url链接, phone_number手机号, email邮箱, hashtag井号(#hashta), cashtag现金标签($USD), mention提及(@mention)
 * 改之前需要先了解实体类型 https://core.telegram.org/bots/api#messageentity
 */
const DELETE_ENTITY_TYPES = new Set([
  'url',
  'phone_number',
  'email',
  'hashtag',
  'cashtag',
  'mention'
]);

/**
 * 要删除的消息属性
 * external_reply外部引用回复, contact联系人卡片
 * 改之前需要先了解消息内有哪些属性 https://core.telegram.org/bots/api#message
 */
const BANNED_MESSAGE_ATTRS = new Set([
	'external_reply',
	'contact'
]);

/**
 * 白名单id，不会被检测消息的用户id
 */
const WHITE_LIST_ID = new Set([
	123456,
	78945612
]);

/**
 * 个人简介关键词，消息发送人个人简介中有这些关键词就删除发送的消息
 * 可以按需求添加和删除
 */
const DELETE_BIO_KEYWORDS = new Set([
	'红包',
	'客服',
	'链接',
	'下方',
	'了解',
	'项目',
	'工作',
	'咨询',
	'自助',
	'监听'
]);

/**
 * 消息关键词，消息中有这些关键词就删除发送的消息
 * 可以按需求添加和删除
 */
const DELETE_MESSAGE_KEYWORDS = new Set([
	'窝',
	'煮',
	'俠',
	'业务',
	'现货',
	'秒发',
	'开户',
	'查人',
	'🧧',
	'需要的来'
]);

/**
 * 调用 Telegram API
 */
async function telegramRequest(method, body = {}) {
  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}

/**
 * 获取用户信息
 */
async function getChat(userId) {
  return telegramRequest('getChat', { chat_id: userId });
}

/**
 * 获取聊天成员信息
 */
async function getChatMember(chatId, userId) {
  return telegramRequest('getChatMember', {
    chat_id: chatId,
    user_id: userId
  });
}

/**
 * 删除消息
 */
async function deleteMessage(chatId, messageId) {
  return telegramRequest('deleteMessage', {
    chat_id: chatId,
    message_id: messageId
  });
}

/**
 * 检查消息是否应该被删除
 */
async function isMessageDelete(message, userId) {
  try {
    // 检查实体
    if (message.entities) {
      if (message.entities.length > 3) {
        return true;
      }

      for (const entity of message.entities) {
        if (DELETE_ENTITY_TYPES.has(entity.type)) {
          return true;
        }
      }
    }

    // 检查消息属性
    for (const attr of BANNED_MESSAGE_ATTRS) {
      if (message[attr]) {
        return true;
      }
    }

    // 检查用户简介
    const chatResult = await getChat(userId);
    if (chatResult.ok && chatResult.result.bio) {
      const bio = chatResult.result.bio;
      for (const keyword of DELETE_BIO_KEYWORDS) {
        if (bio.includes(keyword)) {
          return true;
        }
      }
    }

    // 检查消息内容关键词
    const text = message.text || message.caption || '';
    for (const keyword of DELETE_MESSAGE_KEYWORDS) {
      if (text.includes(keyword)) {
        return true;
      }
    }

    return false;

  } catch (error) {
    console.error('Error in isMessageDelete:', error);
    return false;
  }
}

/**
 * 处理消息
 */
async function handleMessage(message) {
  try {
    if (!message || !message.from) {
      return;
    }

    if (message.from.is_bot) {
      return;
    }

    const userId = message.from.id;
    const chatId = message.chat.id;
    const messageId = message.message_id;

    if (userId === 777000) {
      	return;
    }

	if (WHITE_LIST_ID.includes(userId)) {
    	return;
	}

    const memberResult = await getChatMember(chatId, userId);
    if (memberResult.ok) {
      const status = memberResult.result.status;
      if (status === 'administrator' || status === 'creator') {
        return;
      }
    }

    const shouldDelete = await isMessageDelete(message, userId);

    if (shouldDelete) {
      await deleteMessage(chatId, messageId);
      console.log(`Deleted message from user ${userId} in chat ${chatId}`);
    }

  } catch (error) {
    console.error('Error in handleMessage:', error);
  }
}

/**
 * 处理函数
 */
async function handleUpdate(update) {
  try {
    // 处理普通消息或编辑消息
    const message = update.message || update.edited_message;

    if (message) {
      await handleMessage(message);
    }

  } catch (error) {
    console.error('Error in handleUpdate:', error);
  }
}

/**
 * Worker 入口
 */
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (url.pathname === '/webhook' && request.method === 'POST') {
        const update = await request.json();

        ctx.waitUntil(handleUpdate(update));

        return new Response('OK', { status: 200 });
      }

    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};