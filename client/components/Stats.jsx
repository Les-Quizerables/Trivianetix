import React, { Component } from "react";
import * as d3 from "d3";
import Table from 'react-bootstrap/Table';
import io from 'socket.io-client';
let socket;
const endpoint = "localhost:3000";
import { Carousel } from 'react-responsive-carousel';

class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rankings: [],
      usernames: [],
      categories: [],
      scores: [],
      messages: [],
      message: '',
      categoryMap: {
        9: 'General Knowledge',
        10: 'Books',
        11: 'Film',
        12: 'Music',
        13: 'Musicals and Theater',
        14: 'Television',
        15: 'Video Games',
        16: 'Board Games',
        17: 'Science and Nature',
        18: 'Computers',
        19: 'Mathematics',
        20: 'Mythology',
        21: 'Sports',
        22: 'Geography',
        23: 'History',
        24: 'Politics',
        25: 'Art',
        26: 'Celebrities',
        27: 'Animals'
      }
    };
    this.startChatting = this.startChatting.bind(this);
    this.saveCurrMsg = this.saveCurrMsg.bind(this);
  }

  componentDidMount() {
    fetch('/profile/getLeaders')
      .then(res => res.json())
      .then(data => {
        this.setState({
          rankings: data.rankings,
          usernames: data.usernames,
          categories: data.categories,
          scores: data.scores
        });
      });

    fetch(`/Trivia/${this.props.username}`)
      .then(res => res.json())
      .then((res) => {
        const models = [];
        let topCat = [0, 0];
        let topCat2 = [0, 0];
        let topCat3 = [0, 0];
        const model1 = { "model_name": "Your scores" };
        const model2 = { "model_name": "High School" };
        const model3 = { "model_name": "Bachelors" };
        const model4 = { "model_name": "Masters" };

        // get current user's top 3 categories, topcat = [category, score]
        const keys = Object.keys(res.currentuser)
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          if (res.currentuser[key] > topCat[1]) {
            topCat3 = topCat2;
            topCat2 = topCat;
            topCat = [key, res.currentuser[key]]
          } else if (res.currentuser[key] > topCat2[1]) {
            topCat3 = topCat2;
            topCat2 = [key, res.currentuser[key]];
          } else if (res.currentuser[key] > topCat3[1]) {
            topCat3 = [key, res.currentuser[key]];
          }
        }

        // generate data needed to construct graph for different education levels
        const topCats = [topCat, topCat2, topCat3];
        for (let i = 0; i < 3; i += 1) {
          model1[`field${i + 1}`] = res.currentuser[parseInt(topCats[i][0])];
          model2[`field${i + 1}`] = res.users.SE[parseInt(topCats[i][0])];
          model3[`field${i + 1}`] = res.users.BA[parseInt(topCats[i][0])];
          model4[`field${i + 1}`] = res.users.MA[parseInt(topCats[i][0])];
        }
        models.push(model1, model2, model3, model4);
        const categories = [`${this.state.categoryMap[topCats[0][0]]}`, `${this.state.categoryMap[topCats[1][0]]}`, `${this.state.categoryMap[topCats[2][0]]}`];

        // generate data needed to construct graph of score over time
        const graph = res.graph2;
        const graphArray = [];
        for (let key in graph) {
          graphArray.push({ 'date': new Date(graph[key].to_char), 'nps': Number(graph[key].correct_answers) * 10 });
        }

        // draw both d3 graphs
        this.drawChart(models, graphArray, categories);
      })
      .catch(err => console.log(err));
  }

  drawChart(data, data2, categories) {
    // first graph configuration
    const models = data;
    const lineData = data2;
    const margin = { top: 50, right: 25, bottom: 125, left: 25 };
    const height = 600 - margin.top - margin.bottom;
    const width = 700 - margin.left - margin.right;
    
    // first graph axis
    const x = d3.scaleTime().range([0, width]);
    x.domain(d3.extent(lineData, function (d) { return d.date; }));
    const y = d3.scaleLinear().range([height, 0]);
    y.domain([d3.min(lineData, function (d) { return d.nps; }) - 5, 100]);
    const valueline = d3.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.nps); })
      .curve(d3.curveMonotoneX);
    const xAxis_woy = d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d ")).tickValues(lineData.map(d => d.date));
    
    // first graph svg
    const svg = d3.select('#graph').append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("fill", "none")
      .attr("stroke", "#000");

    svg.append("path").data([lineData]).attr("class", "line").attr("d", valueline);
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis_woy);

    svg.selectAll(".dot")
      .data(lineData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", function (d) { return x(d.date) })
      .attr("cy", function (d) { return y(d.nps) })
      .attr("r", 5)
      .attr("fill", "red");

    svg.selectAll(".text")
      .data(lineData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", function (d, i) { return x(d.date) })
      .attr("y", function (d) { return y(d.nps + 1) })
      .attr("dy", "-5")
      .attr("font-family", "Pompadour")
      .attr("font-size", "20px")
      .attr("fill", "black")
      .text(function (d) { return d.nps; });

    // second graph configuration
    const container = d3.select('#graph2'),
      width2 = 700,
      height2 = 600,
      barPadding = .2,
      margin2 = { top: 100, right: 25, bottom: 130, left: 45 },
      axisTicks = { qty: 5, outerSize: 0, dateFormat: '%m-%d' };

    // second graph axis
    const xScale0 = d3.scaleBand().range([0, width2 - margin2.left - margin2.right]).padding(barPadding);
    const xScale1 = d3.scaleBand();
    const yScale = d3.scaleLinear().range([height2 - margin2.top - margin2.bottom, 0]);
    const xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    const yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);
    xScale0.domain(models.map(d => d.model_name));
    xScale1.domain(['field1', 'field2', 'field3']).range([0, xScale0.bandwidth()]);
    yScale.domain([0, 100]);

    // second graph svg
    const svg2 = container
      .append("svg")
      .attr("width", width2)
      .attr("height", height2)
      .append("g")
      .attr("transform", `translate(${margin2.left},${margin2.top})`);

    svg2.append("g").attr("class", "x axis").style("font", "20px times").attr("transform", `translate(0,${height2 - margin2.top - margin2.bottom})`).call(xAxis);
    svg2.append("g").attr("class", "y axis").style("font", "20px times").call(yAxis);
    svg2.append("circle").attr("cx", -10).attr("cy", -70).attr("r", 6).style("fill", "blue");
    svg2.append("circle").attr("cx", -10).attr("cy", -50).attr("r", 6).style("fill", "red");
    svg2.append("circle").attr("cx", -10).attr("cy", -30).attr("r", 6).style("fill", "green");
    svg2.append("text").attr("x", 0).attr("y", -70).text(`Category: ${categories[0]}`).style("font-size", "15px").style("fill", "blue").attr("alignment-baseline", "middle").style("font", "20px times");
    svg2.append("text").attr("x", 0).attr("y", -50).text(`Category: ${categories[1]}`).style("font-size", "15px").style("fill", "red").attr("alignment-baseline", "middle").style("font", "20px times");
    svg2.append("text").attr("x", 0).attr("y", -30).text(`Category: ${categories[2]}`).style("font-size", "15px").style("fill", "green").attr("alignment-baseline", "middle").style("font", "20px times");
    
    // second graph models
    const model_name = svg2.selectAll(".model_name")
      .data(models)
      .enter().append("g")
      .attr("class", "model_name")
      .attr("transform", d => `translate(${xScale0(d.model_name)},0)`);
    const constructModel = fieldNames => {
      for (let { fieldName, color } of fieldNames) {
        model_name.selectAll(".bar." + fieldName)
        .data(d => [d])
        .enter()
        .append("rect")
        .attr("class", "bar" + fieldName)
        .style("fill", color)
        .attr("x", d => xScale1(fieldName))
        .attr("y", d => yScale(d[fieldName]))
        .attr("width", xScale1.bandwidth())
        .attr("height", d => height2 - margin2.top - margin2.bottom - yScale(d[fieldName]));
      }
    };
    constructModel([{ fieldName: 'field1', color: 'blue'}, { fieldName: 'field2', color: 'red'}, { fieldName: 'field3', color: 'green'}]);
  }

  startChatting(message) {
    socket.emit('chat messages', message);
  }

  saveCurrMsg(e) {
    this.setState({
      message: e.target.value
    });
  }

  render() {
    if (!socket) {
      socket = io(endpoint);
      socket.on('chat messages', message => {
        this.setState(prevState => {
          return { messages: [...prevState.messages, message] };
        });
      })
    }
    const allMsg = [];
    for (let i = 0; i < this.state.messages.length; i += 1) {
      allMsg.push(<li key={i}>{this.state.messages[i]}</li>);
    }

    const questionsPosed = this.props.stats.gamesPlayed * 10;
    const questionsRight = this.props.stats.correctAnswers;
    const PercentageRightForThisGame = this.props.correctResponses.length * 10;
    const percentageRight = questionsPosed ? Math.floor((questionsRight / questionsPosed) * 100) : 0;
    let graph = <div id='graph'></div>;
    let graph2 = <div id='graph2'></div>;
    let scoreBoard = <p>Your All-Time Score: {percentageRight}%<br />Your Score For This Game: {PercentageRightForThisGame}%</p>;
    
    const leaderBoard = [];
    for (let i = 0; i <= 10; i += 1) {
      let eachLeader = (
        <tr key={i}>
          <td>{this.state.rankings[i]}</td>
          <td>{this.state.usernames[i]}</td>
          <td>{this.state.categoryMap[this.state.categories[i]]}</td>
          <td>{this.state.scores[i]}</td>
        </tr>
      );
      leaderBoard.push(eachLeader);
    }

    return (
      <div>
        <Carousel autoPlay={true} stopOnHover={true} infinteLoop={true} showStatus	={false} showIndicators={false} showThumbs={false}>
          <div className="leaderboard">
            <Table striped bordered hover className="center">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Category</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderBoard}
              </tbody>
            </Table>
          </div>
          <div>
            {graph}
            <p className="legend">Your Scores Over Time</p>
          </div>
          <div>
            {graph2}
            <p className="legend">Your Highest-Scored Categories</p>
          </div>
        </Carousel>
        <div className='scoreboard'>
          {scoreBoard}
        </div>
        {allMsg}
        <label className="messageLabel">
          Message:
          <input type="text" name="name" onChange={this.saveCurrMsg} />
        </label>
        <button onClick={() => this.startChatting(this.state.message)}>Submit</button>
      </div>
    );
  }
}

export default Stats;