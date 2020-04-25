const express = require('express');
const signup = express.Router();
const path = require('path');

const userModelController = require('../controller/userModelController');

signup.get('/', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../../client/signup.html'));
});

signup.get('/signup.css', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../../signup.css'));
});

signup.post('/', userModelController.createUser, (req, res) => {
  res.status(200).redirect('/');
});

module.exports = signup;