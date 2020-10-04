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

let helpMessage = `
I can't do much yet, but here's what I can

1. Find out the exchange rate against the ruble
/rates "short currency name"

Example
/rates usd

2. Find out the cost of cryptocurrency in dollars
/crypto "short cryptocurrency name"

Example
/crypto btc

3. Give a Fact
/fact

If Fact repeat, you can update it
/update facts


`;

bot.onText(/\/start/i, (msg, match) => {
  const userId = msg.chat.id;

  bot.sendMessage(userId, "Greetings traveler! " + helpMessage);
});

bot.onText(/help/i, (msg, match) => {
  const userId = msg.chat.id;

  bot.sendMessage(userId, helpMessage);
});

bot.onText(/\/rates (.+)/i, (msg, match) => {
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

bot.onText(/\/crypto (.+)/i, async (msg, match) => {
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
    console.log(err, "117");
    bot.sendMessage(userId, "Error, try again later");
  }
});

//Data store from gsheet
let dataStore = [];

getData();

bot.onText(/fact/i, (msg) => {
  const userId = msg.chat.id;
  //get max row number
  let maxRow = dataStore.filter((item) => {
    return item.row == "1" && item.col == "2";
  })[0].val;

  //generate random number from 1 to max row
  let k = Math.floor(Math.random() * maxRow) + 1;
  //get fact object that matches row with randomly generated number
  let fact = dataStore.filter((item) => {
    return item.row == k && item.col == "5";
  })[0];

  //output message
  let message = `
Fact #${fact.row}:
${fact.val}
  `;
  //reply user
  bot.sendMessage(userId, message);
});

bot.onText(/update/i, async (msg) => {
  const userId = msg.chat.id;

  try {
    //update data
    await getData();
    bot.sendMessage(userId, "updated");
  } catch (err) {
    console.log(err, "161");
    bot.sendMessage(userId, "Error encountered");
  }
});

async function getData() {
  try {
    //send http request to gs link to get information back in json format
    let res = await axios(
      "https://spreadsheets.google.com/feeds/cells/1qwunC72mqNN2Vfy2tIiOrwpxOnHn3AnWmLfsf18llIA/1/public/full?alt=json"
    );

    //store entry array into data variable
    let data = res.data.feed.entry;
    //make sure dataStore is empty
    dataStore = [];
    //process data into dataStore
    data.forEach((item) => {
      dataStore.push({
        row: item.gs$cell.row,
        col: item.gs$cell.col,
        val: item.gs$cell.inputValue,
      });
    });
  } catch (err) {
    console.log(err, "186");
    throw new Error();
  }
}

bot.on("message", (msg) => {
  // console.log(msg);
});
