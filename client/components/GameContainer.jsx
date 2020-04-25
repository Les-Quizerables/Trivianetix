import React, { Component } from 'react';
// import DropdownButton from "react-bootstrap/DropdownButton";
// import Dropdown from "react-bootstrap/Dropdown";
// import "bootstrap/dist/css/bootstrap.min.css";

class GameContainer extends Component {
  render() {
    let question = this.props.question;
    let correctAnswer;
    let incorrectAnswers;
    let answers;
    if (question) {
      correctAnswer = question.correct_answer;
      incorrectAnswers = question.incorrect_answers;
      answers = [correctAnswer, ...incorrectAnswers];
      answers.forEach((el, i) => {
        const random = Math.floor(Math.random() * 4);
        [answers[i], answers[random]] = [answers[random], answers[i]];
      })
    }
    return (
      <div className="app">
        <React.Fragment>
          <div className='question-app'>
            <div className='question-tag' dangerouslySetInnerHTML={{ __html: question.question }}></div>
            <form className='radio-form'>
              <input id='buttona' type='radio' name='questions' id='A' onChange={this.props.handleChange} value={answers[0]} />
              <label id='buttona' className='a' htmlFor='A' dangerouslySetInnerHTML={{ __html: answers[0] }}></label>
              <br></br>
              <input id='buttonb' type='radio' name='questions' id='B' onChange={this.props.handleChange} value={answers[1]} />
              <label id='buttonb' className='b' htmlFor='B' dangerouslySetInnerHTML={{ __html: answers[1] }}></label>
              <br></br>
              <input id='buttonc' type='radio' name='questions' id='C' onChange={this.props.handleChange} value={answers[2]} />
              <label id='buttonc' className='c' htmlFor='C' dangerouslySetInnerHTML={{ __html: answers[2] }}></label>
              <br></br>
              <input id='buttond' type='radio' name='questions' id='D' onChange={this.props.handleChange} value={answers[3]} />
              <label id='buttond' className='d' htmlFor='D' dangerouslySetInnerHTML={{ __html: answers[3] }}></label>
              <br></br>
            </form>
          </div>
        </React.Fragment>
      </div>
    )
  }
}

export default GameContainer;
