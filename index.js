var TelegramBot = require('node-telegram-bot-api');
var request = require('request');
var s = require('sprintf-js');
var rabbit = require('./rabbit.min');
var token = process.env.TELEGRAM_ORNAGAI_TOKEN;
var bot = new TelegramBot(token, {
  polling: true
});

var help = "အသုံးပြုပုံကတော့ \n" +
  "'/e hello' ဆိုရင် 'hello' ရဲ့ အဓိပ္ပါယ် ကို ပ​ြပေးပါတယ်။\n" +
  "'/help' ဆိုရင် အခု message ကို ပြန်ပြပါတယ်။\n" +
  "Disclaimer : The data is based on http://ornagai.com";

var counter = 0;

bot.on('text', function(msg) {
  var chatId = msg.chat.id;

  en2mm = /\/e */.test(msg.text);

  if (en2mm) {
    x = msg.text.replace(/\/e */, "").trim();
    search(x, function(def) {
      bot.sendMessage(chatId, def);
    });
  } else if (msg.text == '/help') {
    bot.sendMessage(chatId, help);
  } 

  counter++;
  console.log("Total request " + counter);
});

function search(keyword, fn) {
  var url = 'http://ornagai.com/search/' + keyword;
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      rawResult = JSON.parse(body);
      if (rawResult.length == 1) {
        properResult = s.sprintf(
          "%1$s\n%2$s\n%3$s",
          rawResult[0].Word,
          rawResult[0].state,
          rawResult[0].def)
        fn(rabbit.zg2uni(properResult));
      } else if (rawResult.length > 1) {
        for (var i = 0; i < 3; i++) {
          properResult = s.sprintf(
            "%1$s\n%2$s\n%3$s\n-----",
            rawResult[i].Word,
            rawResult[i].state,
            rawResult[i].def)
          fn(rabbit.zg2uni(properResult));
        }
      } else {
        fn("Sorry. No meaning found for " + keyword);
      }
    }
  });
}
