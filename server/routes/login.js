const express = require('express');
const login = express.Router();
const path = require('path');

login.get('/', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../../index.html'));
});

login.get('/index.css', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../../index.css'));
});

module.exports = login;