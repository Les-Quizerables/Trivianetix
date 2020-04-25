const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);

// const server = require('http').Server(app);
// const io = require('socket.io')(server);

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

// function handler (req, res) {
//   fs.readFile('/Users/jie-yuncheng/Desktop/Trivianetix/client/profile.html',
//   function (err, data) {
//     if (err) {
//       res.writeHead(500);
//       return res.end('Error loading profile.html');
//     }
//     res.writeHead(200);
//     res.end(data);
//   });
// }

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  socket.on('chat messages', function (message) {
    console.log('message from the server: ', message);
    io.emit('chat messages', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
