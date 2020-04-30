const db = require('../data/userModel');
const fetch = require("node-fetch");

const userModelController = {};

// create a user when a new user signs up
userModelController.createUser = (req, res, next) => {
  const { username, password, age, state, education } = req.body;
  const text = `
    INSERT INTO usersfix (username, password, age, state, education, games_played, correct_answers)
    values($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [username, password, age, state, education, 0, 0];
  db.query(text, values)
    .then(response => {})
    .catch(err => console.log(err));
  return next();
};

// used for login verification
userModelController.findUser = (req, res, next) => {
  const { username, password } = req.body;
  const text = `
    SELECT username
    FROM usersfix
    WHERE username = '${username}' AND password = '${password}'
  `;
  db.query(text)
    .then(response => {
      if (response.rows[0]) { // if the user doesn't exist or username or password is incorrect
        return next();
      } else {
        res.send('Invalid username or password. Please sign up or try again.');
      }
    })
    .catch(err => console.log(err));
};

// used to find games played and correct answers
userModelController.findStats = (req, res, next) => {
  const text = `
    SELECT games_played, correct_answers
    FROM usersfix
    WHERE username = '${req.params.username}'
  `;
  db.query(text)
    .then(response => {
      if (response.rows[0]) {
        res.locals.stats = response.rows[0];
        return next();
      } else {
        console.log('Error occurred. Username is not sending properly.');
        res.send('Error occurred. Username is not sending properly.');
      }
    })
    .catch(err => console.log(err));
};

// get trivia questions depending on the category selected passed in params.url
userModelController.questions = async (req, res, next) => {
  const url = 'https://opentdb.com/api.php?amount=10&category=' + req.params.url + '&type=multiple';
  await fetch(url)
    .then(response => response.json())
    .then(data => {
      res.locals.results = data.results;
    })
    .catch(err => console.log(err));
  return next();
};

// update tables after a game is finished
userModelController.updateUser = (req, res, next) => {
  const { username, totalCorrectAnswers, currentCorrectAnswers, score, gamesPlayed, url } = req.body;
  let text = `
    UPDATE usersfix
    SET games_played = '${gamesPlayed}', correct_answers = '${totalCorrectAnswers}'
    WHERE username = '${username}'
  `;
  db.query(text)
    .then(response => {})
    .catch(err => console.log(err));
  text = `
    INSERT INTO gamesplayed
    (username_fk, category_fk, correct_answers)
    VALUES ('${username}', ${url}, ${currentCorrectAnswers})
  `;
  db.query(text)
    .then(response => {
      return next();
    })
    .catch(err => console.log(err));
};

userModelController.deleteUser = async (req, res, next) => {
  const { username } = req.body;
  const text = `
    DELETE FROM usersfix
    WHERE username = '${username}'
  `;
  await db.query(text)
    .then(res => {
      return next();
    })
    .catch(err => console.log(err));
  return next();
};

// get average score of one educational level for one topic
userModelController.getGraphData = async(req, res, next) => {
  const { username } = req.params;
  let row;
  let sql = `SELECT id FROM category`;
  await db.query(sql)
    .then(response => {
      row = response.rows;
    })
    .catch(err => console.log(err));
  // get score per category of all games played by the current user and other users
  const education = ['SE','BA','MA'];
  const obj1 = {};
  let obj;
  for (let j = -1; j < education.length; j++){
    obj = {};
    for (let i = 0; i < row.length; i++){
      const category = row[i].id;
      if (j === -1) { // for the current user
        sql = `
          SELECT SUM(correct_answers), COUNT(*) 
          FROM gamesplayed 
          WHERE username_fk = '${username}' and category_fk = ${category}
        `;
      } else { // for all other users
        sql = `
          SELECT SUM(correct_answers), COUNT(*) 
          FROM gamesplayed 
          WHERE category_fk = ${category} AND username_fk in 
          (SELECT username 
          FROM usersfix 
          WHERE education = '${education[j]}' AND username != '${username}')
        `;
      }
      await db.query(sql)
        .then(resp => {
          gamesPlayed = Number(resp.rows[0].count);
          if (gamesPlayed === 0) {
            obj[category] = 0        
          } else {  
            obj[category] = (resp.rows[0].sum / (gamesPlayed * 10)) * 100;
          }
        })
        .catch(err => console.log(err));
    }
    if (j === -1) { // for the current user
      res.locals.currentuser = obj;
    } else { // for all other users
      obj1[education[j]] = obj;   
    }
  }
  res.locals.users = obj1;
  return next();
};

// Query for average over time of current user
userModelController.getGraphData2 = async(req, res, next) => {
  const { username } = req.params;
  let row;
  let sql = `
    SELECT correct_answers, TO_CHAR(date, 'Mon dd, yyyy HH24:MI:SS') 
    FROM gamesplayed 
    WHERE username_fk = '${username}' 
    ORDER BY date DESC LIMIT 20
  `;
  await db.query(sql)
    .then(response => {
      row = { ...response.rows };
      res.locals.graph2 = row;
    })
    .catch(err => console.log(err));
  return next();
};

userModelController.findLeaders = (req, res, next) => {
  const text = `
    SELECT *
    FROM leaderboard ORDER BY score desc
  `;
  db.query(text)
    .then (response =>{
      const usernames = [];
      const categories = [];
      const scores = [];
      const ranks = [];
      for (let i = 0; i < response.rows.length; i += 1){
        let row = response.rows[i];
        usernames.push(row.username_fk);
        categories.push(row.category_fk);
        scores.push(row.score);
        ranks.push(i + 1);
      }
      res.locals.usernames = usernames;
      res.locals.categories = categories;
      res.locals.scores = scores;
      res.locals.ranks = ranks;
      return next();
    })
    .catch(err => console.log(err));
};

userModelController.compareLeaders = (req, res, next) => {
  const { usernames, categories, scores, ranks } = res.locals;
  const { username, url, currentCorrectAnswers } = req.body;
  let currentRank = ranks.length < 10 ? ranks.length + 1 : 11;
  let firstInstanceFound = false;
  for (let i = 0; i < scores.length; i += 1) {
    if (scores[i] < currentCorrectAnswers * 10 && !firstInstanceFound) {
      currentRank = i + 1;
      firstInstanceFound = true;
    }
  }
  if (currentRank <= 10) {
    let text = ``;
    if (ranks.length < 10) { // move current last place if leaderboard doesn't have 10 rankings yet
      const lastRank = ranks.length;
      text += `
        INSERT INTO leaderboard (username_fk, category_fk, score, id)
        VALUES ('${usernames[lastRank - 1]}', ${categories[lastRank - 1]}, ${scores[lastRank - 1]}, ${lastRank + 1});
      `;
    }
    for (let i = ranks.length - 1; i >= currentRank; i -= 1) { // move everyone down by 1 rank
      text += `UPDATE leaderboard SET username_fk = '${usernames[i - 1]}', category_fk = ${categories[i - 1]}, score = ${scores[i - 1]}
        WHERE id = ${i + 1};
      `;
    }
    // update the current rank to be the current user's current game played
    text += `
      UPDATE leaderboard SET username_fk = '${username}', category_fk = ${url}, score = ${currentCorrectAnswers * 10}
      WHERE id = ${currentRank};
    `;
    db.query(text)
      .then (response => {
        return next();
      })
      .catch(err => console.log(err));
  }
};

module.exports = userModelController;
