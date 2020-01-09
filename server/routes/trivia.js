const express = require('express');
const trivia = express.Router();
const path = require('path');

const userModelController = require('../controller/userModelController');

trivia.get('/:username', userModelController.getGraphData, userModelController.getGraphData2,(req, res) => {
    res.status(200).json({
        currentuser: res.locals.currentuser,
        users: res.locals.users,
        graph2: res.locals.graph2,
    });
})

// trivia.get('/graph2/:username', userModelController.getGraphData2, (req, res) => {
//     res.status(200).json({
//         graph2: res.locals.graph2
//     });
// });

trivia.get('/:username/:url', userModelController.findStats, userModelController.questions, (req, res) => {
  res.status(200).json({
    username: req.params.username,
    results: res.locals.results,
    gamesPlayed: res.locals.stats.games_played,
    correctAnswers: res.locals.stats.correct_answers,
  });
});

// trivia.get('/:username', userModelController.getGraphData, (req, res) => {
//   res.status(200).json({
//     currentuser: res.locals.currentuser,
//     users: res.locals.users,
//   });
// });

module.exports = trivia;