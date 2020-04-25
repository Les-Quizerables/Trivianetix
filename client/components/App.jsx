import React, { Component } from "react";
import UserInfo from "./UserInfo.jsx";
import Stats from "./Stats.jsx";
import GameContainer from "./GameContainer.jsx";
import Draggable from 'react-draggable';
import { useHistory } from 'react-router-dom';
import { Button } from 'semantic-ui-react';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //ACTUAL DEFAULT
      username: document.cookie.slice(9),
      gameMode: false,
      results: [],
      stats: { gamesPlayed: 0, correctAnswers: 0 },
      correctResponses: [],
      incorrectResponses: [],
      question: {},
      choice: 'none',
      url: '9',
      score: 0,
      //MOCK DATA
      // username: document.cookie.slice(9),
      // gameMode: false,
      // results: [
      //   {
      //     category: "General Knowledge",
      //     type: "multiple",
      //     difficulty: "easy",
      //     question: "Which one of these Swedish companies was founded in 1943?",
      //     correct_answer: "IKEA",
      //     incorrect_answers: ["H &; M", "Lindex", "Clas Ohlson"]
      //   },
      //   {
      //     category: "General Knowledge",
      //     type: "multiple",
      //     difficulty: "easy",
      //     question: "Which one of these Swedish companies was founded in 1943?",
      //     correct_answer: "IKEA",
      //     incorrect_answers: ["H &; M", "Lindex", "Clas Ohlson"]
      //   }
      // ],
      // stats: { gamesPlayed: 5, correctAnswers: 12 },
      // correctResponses: [],
      // incorrectResponses: [],
      // question:{},
      // choice: 'none',
    };

    // Function binds=================================================
    this.startGame = this.startGame.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onHandleClick = this.onHandleClick.bind(this);
    this.settingScore = this.settingScore.bind(this);
    this.settingScoreResponse = this.settingScoreResponse.bind(this);
    this.sendResponse = this.sendResponse.bind(this);
  }

  // Setting the score state after stats state is set
  settingScore() {
    let correctAnswers = this.state.stats.correctAnswers;
    let gamesPlayed = this.state.stats.gamesPlayed * 10;
    if (gamesPlayed > 0) {
      let scoreCal = (correctAnswers / gamesPlayed) * 100;
      this.setState({
        score: scoreCal,
      });
    }
  }

  settingScoreResponse() {
    let correctAnswers = this.state.stats.correctAnswers;
    let gamesPlayed = this.state.stats.gamesPlayed * 10;
    let scoreCal = (correctAnswers / gamesPlayed) * 100;
    this.setState({
      score: scoreCal,
    }, this.sendResponse);
  }

  // Wait until server is working to test correct data
  componentDidMount() {
    console.log('MOUNTED');
    fetch(`/trivia/${this.state.username}/${this.state.url}`)
      .then(res => res.json())
      .then(data => {
        const { username, results, gamesPlayed, correctAnswers } = data;
        this.setState({
          username,
          results,
          stats: { gamesPlayed, correctAnswers },
        }, this.settingScore);
      })
      .catch((err) => { console.log(err); });

  }

  onHandleClick(e) {
    this.setState({ url: e.target.value });
  }

  startGame() {
    if (!this.state.gameMode) {
      fetch(`/trivia/${this.state.username}/${this.state.url}`)
        .then(res => res.json())
        .then(data => {
          const { results } = data;
          const gameMode = true;
          const question = results.pop();
          this.setState({
            gameMode,
            results,
            question,
          });
        })
        .catch(err => { console.log(err); });
    } else {
      let gameMode = this.state.gameMode;
      let results = [...this.state.results];
      let question = this.state.question;

      // populate question
      if (results.length > 0) {
        question = results.pop();
        gameMode = true;
      }
      // Updating state
      this.setState({
        gameMode,
        results,
        question,
        choice: 'pending',
      });
    }
  }

  // Manages behaviour while playing the game, wheather start game, end game and send results and 
  // setState between games
  handleChange(e) {
    let gameMode = this.state.gameMode;
    const choice = e.target.value;
    const correct = this.state.question.correct_answer;
    const correctResponses = [...this.state.correctResponses];
    const incorrectResponses = [...this.state.incorrectResponses];
    // console.log('User chose the answer: ', e.target.value);
    // console.log('The actual correct answer: ', correct);
    // console.log('correctResponses: ', this.state.correctResponses);

    if (choice === correct) {
      correctResponses.push(this.state.question);
    } else {
      incorrectResponses.push(this.state.question);
    }
    if (this.state.results.length > 0) {
      this.startGame();
    } else {
      const stats = { ...this.state.stats };
      stats.correctAnswers = stats.correctAnswers + this.state.correctResponses.length;
      stats.gamesPlayed = stats.gamesPlayed + 1;
      this.setState({
        stats,
      }, this.settingScoreResponse
      );
      gameMode = false;
    }
    e.target.checked = false;
    this.setState({
      gameMode,
      correctResponses,
      incorrectResponses,
    });
  }

  sendResponse() {
    console.log('Sending Response...');
    fetch('/profile/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.state.username,
        totalCorrectAnswers: this.state.stats.correctAnswers,
        currentCorrectAnswers: this.state.correctResponses.length,
        url: this.state.url,
        score: this.state.score,
        gamesPlayed: this.state.stats.gamesPlayed,
      }),
    })
      .catch(err => {
        console.log(err);
      })
  }

  chatting() {
    let path = `http://localhost:8008`;
    let history = useHistory();
    history.push(path);
  }

  render() {
    return (
      <div className="app">
        {/* ===================================================================================== */}
        {/* When User is logged in, and gameMode=false, render UserInfo, Stats, and GameContainer */}
        {/* ===================================================================================== */}
        {!this.state.gameMode ?
          <React.Fragment>
            <UserInfo username={this.state.username} gameMode={this.state.gameMode} />
            <Stats username={this.state.username} stats={this.state.stats} correctResponses={this.state.correctResponses} gameMode={this.state.gameMode} />
            <select className="custom-select" onChange={this.onHandleClick}>
              <option value="9" className="topicButton">General Knowledge</option>
              <option value="10"> Books</option>
              <option value="11"> Film</option>
              <option value="12"> Music</option>
              <option value="13"> Musicals and Theater</option>
              <option value="14"> Television</option>
              <option value="15"> Video Games</option>
              <option value="16"> Board Games</option>
              <option value="17"> Science and Nature</option>
              <option value="18"> Computers</option>
              <option value="19"> Mathematics</option>
              <option value="20"> Mythology</option>
              <option value="21"> Sports</option>
              <option value="22"> Geography</option>
              <option value="23"> History</option>
              <option value="24"> Politics</option>
              <option value="25"> Art</option>
              <option value="26"> Celebrities</option>
              <option value="27"> Animals</option>
            </select>
            <button className="playGameBtn" onClick={() => this.startGame()}>Play Game</button>
          </React.Fragment>
          :
          //*================================================================= */}
          //* When User is logged in, and gameMode=true, render GameContainer */}
          //*================================================================= */}
          <React.Fragment>
            <GameContainer
              onHandleClick={this.onHandleClick}
              choice={this.state.choice}
              results={this.state.results}
              gameMode={this.state.gameMode}
              question={this.state.question}
              handleChange={this.handleChange} />
          </React.Fragment>}
        {/* ================================================================= */}
        {/* <Link to="http://localhost:8008">
            <Button style={myStyle}>
                <p>Click Me!</p>
            </Button>
        </Link> */}
      </div>
    )
  }
}

export default App;
