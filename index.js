const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const token = '781768594:AAHl_1XjYLWvX0Tifw-9wZb6rtelV6Im7No';
const api_Token = '539985f9ce1449148fab699e976750c7';
const bot = new TelegramBot(token, {
  polling: true
});

bot.on('message', msg => {
  if (
    msg.text
      .toString()
      .toLowerCase()
      .indexOf('hi') === 0
  ) {
    // bot.sendMessage(msg.from.id, `Hello, <b>${msg.from.first_name}</b> `, {
    //   parse_mode: 'HTML'
    // });
    bot.sendMessage(msg.chat.id, 'Please, choose competition', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Premier League',
              callback_data: 'premier_league'
            },
            {
              text: 'Serie A',
              callback_data: 'serie_a'
            },
            {
              text: 'Champions League',
              callback_data: 'champions_league'
            }
          ]
        ]
      }
    });
  }

  if (
    msg.text
      .toString()
      .toLowerCase()
      .includes('bye')
  ) {
    bot.sendMessage(msg.chat.id, 'Hope to see you around again, Bye');
  }

  // bot.sendMessage(
  //   msg.chat.id,
  //   "I'm just a stupid bot. I don't know what to answer"
  // );
  // bot.sendSticker(msg.chat.id, 'CAADAgADAQADjM_pG1m6VaBWgHPBAg');
});

bot.on('callback_query', callbackQuery => {
  console.log(callbackQuery.data);
  const msg = callbackQuery.message;
  switch (callbackQuery.data) {
    case 'premier_league':
      bot.sendMessage(msg.chat.id, 'Got it! What do you want to know?', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Today games',
                callback_data: 'premier_league_today_games'
              },
              {
                text: 'Standings',
                callback_data: 'premier_league_standings'
              },
              {
                text: 'Top scorers',
                callback_data: 'premier_league_top'
              }
            ]
          ]
        }
      });
      break;
    case 'serie_a':
      bot.sendMessage(msg.chat.id, 'Got it! What do you want to know?', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Today games',
                callback_data: 'serie_a_today_games'
              },
              {
                text: 'Standings',
                callback_data: 'serie_a_standings'
              },
              {
                text: 'Top scorers',
                callback_data: 'serie_a_top'
              }
            ]
          ]
        }
      });
      break;
    case 'premier_league_standings':
      getStandings('PL').then(res => {
        sendFormattedMessage(res, msg.chat.id);
      });
      break;
    case 'premier_league_today_games':
      getTodayGames('PL').then(res => {
        if (res) {
          sendFormattedMessage(res, msg.chat.id);
        } else {
          bot.sendMessage(
            msg.chat.id,
            "Unfortunately there's no Premier League games today"
          );
          bot.sendSticker(msg.chat.id, 'CAADAgADAQADjM_pG1m6VaBWgHPBAg');
        }
      });
      break;
    case 'premier_league_top':
      getTopScorers('PL').then(res => {
        if (res) {
          sendFormattedMessage(res, msg.chat.id);
        }
      });
      break;
    case 'serie_a_today_games':
      getTodayGames('SA').then(res => {
        if (res) {
          sendFormattedMessage(res, msg.chat.id);
        } else {
          bot.sendMessage(
            msg.chat.id,
            "Unfortunately there's no Premier League games today"
          );
          bot.sendSticker(msg.chat.id, 'CAADAgADAQADjM_pG1m6VaBWgHPBAg');
        }
      });
      break;
    case 'serie_a_standings':
      getStandings('SA').then(res => {
        sendFormattedMessage(res, msg.chat.id);
      });
      break;
    case 'serie_a_top':
      getTopScorers('SA').then(res => {
        if (res) {
          sendFormattedMessage(res, msg.chat.id);
        }
      });
      break;
  }

  bot.answerCallbackQuery(callbackQuery.id);
});

bot.on('polling_error', error => {
  console.log(error.code);
});

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.from.id, `Hello, <b>${msg.from.first_name}</b> `, {
    parse_mode: 'HTML'
  });
});

function sendFormattedMessage(res, chatId) {
  const message = res.join(' \n');
  bot.sendMessage(chatId, message, {
    parse_mode: 'HTML'
  });
}

function getStandings(competition) {
  const url = `https://api.football-data.org/v2/competitions/${competition}/standings`;
  return axios({
    method: 'get',
    url,
    headers: {
      'X-Auth-Token': api_Token
    }
  }).then(res => {
    const standings = res.data.standings[0].table.map(team => {
      return `${team.position}. <b>${team.team.name}</b>  ${
        team.points
      } points`;
    });
    return standings;
  });
}

function getTodayGames(competition) {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://api.football-data.org/v2/competitions/${competition}/matches?dateFrom=${today}&dateTo=${today}`;
  return axios({
    method: 'get',
    url,
    headers: {
      'X-Auth-Token': api_Token
    }
  }).then(res => {
    if (res.data.matches.length !== 0) {
      const matches = res.data.matches.map(
        match =>
          `<b>${match.homeTeam.name} - ${match.awayTeam.name}</b> ⌚${new Date(
            match.utcDate
          ).toLocaleTimeString()}`
      );
      return matches;
    } else {
      return null;
    }
  });
}
function getTopScorers(competition) {
  const url = `https://api.football-data.org/v2/competitions/${competition}/scorers`;
  return axios({
    method: 'get',
    url,
    headers: {
      'X-Auth-Token': api_Token
    }
  }).then(res => {
    const scorers = res.data.scorers.map(
      scorer =>
        `<b>${scorer.player.name} (${scorer.team.name})</b> - ${
          scorer.numberOfGoals
        }`
    );
    return scorers;
  });
}
