const express = require('express');
const path = require('path');
const profile = express.Router();
const userModelController = require('../controller/userModelController');
const cookieController = require('../controller/cookieController');

profile.get('/profile.css', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../../profile.css'));
});

profile.get('/getLeaders', userModelController.findLeaders, (req, res) => {
  res.status(200).json({
    usernames: res.locals.usernames,
    categories: res.locals.categories,
    scores: res.locals.scores,
    rankings: res.locals.ranks
  });
});

profile.post('/', userModelController.findUser, cookieController.setCookie, (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, "../../client/profile.html"));
});

profile.put('/update', userModelController.updateUser, userModelController.findLeaders, userModelController.compareLeaders, (req, res) => {
  res.sendStatus(200);
});

profile.delete('/delete', userModelController.deleteUser, (req, res) => {
  res.status(200).send('User has been deleted');
});

module.exports = profile;
