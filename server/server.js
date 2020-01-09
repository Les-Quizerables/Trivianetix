const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const profileRouter = require('./routes/profile');
const triviaRouter = require('./routes/trivia');

// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));
app.use(cookieParser());

app.use('/signup', signupRouter);
app.use('/profile', profileRouter);
app.use('/trivia', triviaRouter);
app.use('/', loginRouter);

app.get('/', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../index.html'));
});

app.get('/build/bundle.js', (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../build/bundle.js'));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
