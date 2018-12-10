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
    case 'premier_league_standings':
      getPLStandings().then(res => {
        const message = res.join(' \n');
        bot.sendMessage(msg.chat.id, message, {
          parse_mode: 'HTML'
        });
      });
      break;
    case 'premier_league_today_games':
      getPLTodayGames().then(res => {
        if (res) {
          const message = res.join(' \n');
          bot.sendMessage(msg.chat.id, message, {
            parse_mode: 'HTML'
          });
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
      getPLTopScorers().then(scorers => {
        if (scorers) {
          const message = scorers.join(' \n');
          bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });
        }
      });
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

function getPLStandings() {
  const url = 'https://api.football-data.org/v2/competitions/PL/standings';
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

function getPLTodayGames() {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://api.football-data.org/v2/competitions/PL/matches?dateFrom=${today}&dateTo=${today}`;
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
function getPLTopScorers() {
  const url = 'https://api.football-data.org/v2/competitions/PL/scorers';
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
