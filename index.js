const TelegramBot = require("node-telegram-bot-api");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const token = "1209199757:AAHc9IzOLpWYVow006lIOIcGPiWOIhcTCIQ";
const bot = new TelegramBot(token, { polling: true });

let valute = {};

const getJSON = function (url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "json";
  xhr.onload = function () {
    let status = xhr.status;
    if (status === 200) {
      callback(null, xhr.responseText);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
};

getJSON("https://www.cbr-xml-daily.ru/daily_json.js", function (err, data) {
  if (err !== null) {
    console.log("Something went wrong: " + err);
  } else {
    valute = JSON.parse(data);
  }
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const userId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(userId, resp);
});

bot.onText(/\/rates (.+)/, (msg, match) => {
  const userId = msg.chat.id;
  const resp = match[1].toLocaleUpperCase();

  if (valute.Valute[resp]) {
    let value = valute.Valute[resp];

    bot.sendMessage(
      userId,
      `${value.Nominal} ${value.Name} -> ${value.Value}  Рублей`
    );

    bot.sendSticker(
      userId,
      value.Value > value.Previous
        ? "CAACAgIAAxkBAANuX3hxjDeJ1bjY_ERFn40u19XQOZgAAnAGAAJjK-IJTIAfOTr1S-EbBA"
        : "CAACAgIAAxkBAANxX3hxjweGDD2Jeg50qSceUhg19twAAnEGAAJjK-IJ8vPDFfpRp_kbBA"
    );
  } else {
    bot.sendMessage(userId, "Не могу найти валюту " + resp);
  }
});

bot.on("message", (msg) => {
  const userId = msg.chat.id;
  const chatId = msg.chat.id;

  console.log(msg);

  // bot.sendMessage(
  //   userId,
  //   msg.from.first_name + " " + msg.from.last_name + " I am busy, sorry"
  // );

  //   bot.sendLocation(
  //     (chat_id = chatId),
  //     (latitude = 51.521727),
  //     (longitude = -0.117255)
  //   );

  // bot.sendSticker(chatId, "CAADAgADOQADfyesDlKEqOOd72VKAg")
});
