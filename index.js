const TelegramBot = require("node-telegram-bot-api");

const token = "1209199757:AAHc9IzOLpWYVow006lIOIcGPiWOIhcTCIQ";

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/echo (.+)/, (msg, match) => {
  const userId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(userId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const userId = msg.chat.id;
  const chatId = msg.chat.id;

  // msg object
  //   {
  //     message_id: 10,
  //     from: {
  //       id: 803239764,
  //       is_bot: false,
  //       first_name: 'Perfect',
  //       last_name: 'Nightmare',
  //       username: 'Legato3991',
  //       language_code: 'ru'
  //     },
  //     chat: {
  //       id: 803239764,
  //       first_name: 'Perfect',
  //       last_name: 'Nightmare',
  //       username: 'Legato3991',
  //       type: 'private'
  //     },
  //     date: 1600379792,
  //     text: '123'
  //   }

  console.log(msg);

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(
    userId,
    msg.from.first_name + " " + msg.from.last_name + " I am busy, sorry"
  );

//   bot.sendLocation(
//     (chat_id = chatId),
//     (latitude = 51.521727),
//     (longitude = -0.117255)
//   );

  bot.sendSticker(chatId, "CAADAgADOQADfyesDlKEqOOd72VKAg")
});
