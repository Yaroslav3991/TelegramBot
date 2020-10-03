const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const token = "1209199757:AAHc9IzOLpWYVow006lIOIcGPiWOIhcTCIQ";
const apiCryptoCompareKey =
  "da070e2781369c2446227b7e2cf515cdee789f3d853e03569f40c608492471dd";

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

bot.onText(/\/crypto (.+)/, async (msg, match) => {
  const userId = msg.chat.id;
  const type = match[1].toLocaleUpperCase();

  try {
    let res = await axios.get(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${type}&tsyms=USD&api_key=${apiCryptoCompareKey}`
    );
    let data = res.data.DISPLAY[type].USD;

    console.log(data);
    let message = `
Name: ${type}
Symbol: ${data.FROMSYMBOL}
Price: ${data.PRICE}
Open: ${data.OPENDAY}
High: ${data.HIGHDAY}
Low: ${data.LOWDAY}
Supply: ${data.SUPPLY}
Market Cap: ${data.MKTCAP}
`;

    bot.sendMessage(userId, message);
  } catch (err) {
    console.log(err);
    bot.sendMessage(userId, "Error, try again later");
  }
});

bot.on("message", (msg) => {
  console.log(msg);
});
