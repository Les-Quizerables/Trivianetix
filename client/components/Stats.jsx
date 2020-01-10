import React, { Component } from "react";
import * as d3 from "d3";
import Table from 'react-bootstrap/Table';
import { Carousel } from 'react-responsive-carousel';

class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rankings: [],
      usernames: [],
      categories: [],
      scores: []
    };
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
        // Constructing data of graph 
        console.log(res)
        let models = [];
        let topCat = [0, 0];
        let topCat2 = [0, 0];
        let topCat3 = [0, 0];
        let model1 = { "model_name": "Your scores" };
        let model2 = { "model_name": "High School" };
        let model3 = { "model_name": "Bachelors" };
        let model4 = { "model_name": "Masters" };

        //try to get this user's top 3 categories
        //topcat = [category, score]
        let keys = Object.keys(res.currentuser)
        for (let i = 0; i < keys.length; i += 1) {
          let key = keys[i];
          if (res.currentuser[key] > topCat[1]) {
            topCat3 = topCat2;
            topCat2 = topCat;
            topCat = [key, res.currentuser[key]]
          }
          else if (res.currentuser[key] > topCat2[1]) {
            topCat3 = topCat2;
            topCat2 = [key, res.currentuser[key]];
          }
          else if (res.currentuser[key] > topCat3[1]) {
            topCat3 = [key, res.currentuser[key]];
          }
        }
        console.log('topCats :', topCat3, topCat2, topCat)
        let topCats = [topCat, topCat2, topCat3]
        console.log(topCats[0][0], topCats[1][0], topCats[2][0])

        for (let i = 0; i < 3; i += 1) {
          let userCategory = res.currentuser[parseInt(topCats[i][0])];
          model1[`field${i + 1}`] = userCategory;

        }
        for (let i = 0; i < 3; i += 1) {
          let userCategory = res.users.SE[parseInt(topCats[i][0])];
          model2[`field${i + 1}`] = userCategory;

        }
        for (let i = 0; i < 3; i += 1) {
          let userCategory = res.users.BA[parseInt(topCats[i][0])];
          model3[`field${i + 1}`] = userCategory;

        }
        for (let i = 0; i < 3; i += 1) {
          let userCategory = res.users.MA[parseInt(topCats[i][0])];
          model4[`field${i + 1}`] = userCategory;
        }
        models.push(model1, model2, model3, model4)
        console.log(models)
        // this.drawChart(models);

        // Constructing graph of second graph
        let graph = res.graph2;
        let graphArray = [];
        let date;
        let nps;
        for (let key in graph) {
          console.log(graph[key]);
          date = new Date(graph[key].to_char);
          nps = Number(graph[key].correct_answers) * 10;
          graphArray.push({ 'date': date, 'nps': nps });
        }
        let categoryOptions = {
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
          27: 'Animals',
        }
        let categories = [`${categoryOptions[topCats[0][0]]}`, `${categoryOptions[topCats[1][0]]}`, `${categoryOptions[topCats[2][0]]}`]
        // console.log('categories are', categories)
        // console.log(graphArray);
        this.drawChart(models, graphArray, categories);
      })
      .catch(err => console.log(err))

    // fetch(`/getGraphData/${chosentopic}/HighSchool`)
    // .then(res => res.json)
    // .catch(err => console.log(err))

    // fetch(`/getGraphData/${chosentopic}/PHD`)
    // .then(res => res.json)
    // .catch(err => console.log(err))
  }
  drawChart(data, data2, categories) {
    let models = data;
    let lineData = data2;
    //give the graph an array of data with each element as an object with date: new date and nps: score
    // let lineData = [];

    // send all if less than 20 games

    // lineData.push({date:new Date('December 18, 1995 03:24:00'), nps:89});
    // lineData.push({date:new Date('December 19, 1995 03:24:00'), nps:96});
    // lineData.push({date:new Date('December 20, 1995 03:24:00'), nps:87});
    // lineData.push({date:new Date('December 21, 1995 03:24:00'), nps:99});
    // lineData.push({date:new Date('December 22, 1995 03:24:00'), nps:83});
    // lineData.push({date:new Date('December 23, 1995 03:24:00'), nps:93});
    // lineData.push({date:new Date('December 24, 1995 03:24:00'), nps:79});
    // lineData.push({date:new Date('December 25, 1995 03:24:00'), nps:94});
    // lineData.push({date:new Date('December 26, 1995 03:24:00'), nps:89});
    // lineData.push({date:new Date('December 27, 1995 03:24:00'), nps:93});
    // lineData.push({date:new Date('December 28, 1995 03:24:00'), nps:81});

    // lineData.sort(function(a,b){
    //     return new Date(b.date) - new Date(a.date);
    // });



    let height = 600;
    let width = 700;
    let hEach = 40;

    let margin = { top: 50, right: 25, bottom: 125, left: 25 };

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const svg = d3.select('#graph').append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("border-radius", "5px")
      // .attr("font-size", "20px")
      .attr("style", "outline: thick solid black;");   //This will do the job


    // set the ranges
    let x = d3.scaleTime().range([0, width]);
    x.domain(d3.extent(lineData, function (d) { return d.date; }));


    let y = d3.scaleLinear().range([height, 0]);


    y.domain([d3.min(lineData, function (d) { return d.nps; }) - 5, 100]);

    let valueline = d3.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.nps); })
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .data([lineData])
      .attr("class", "line")
      .attr("d", valueline);



    let xAxis_woy = d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d ")).tickValues(lineData.map(d => d.date));

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis_woy);

    //  Add the Y Axis
    //  svg.append("g").call(d3.axisLeft(y));

    svg.selectAll(".dot")
      .data(lineData)
      .enter()
      .append("circle") // Uses the enter().append() method
      .attr("class", "dot") // Assign a class for styling
      .attr("cx", function (d) { return x(d.date) })
      .attr("cy", function (d) { return y(d.nps) })
      .attr("r", 5)
      .attr("fill", "red");


    svg.selectAll(".text")
      .data(lineData)
      .enter()
      .append("text") // Uses the enter().append() method
      .attr("class", "label") // Assign a class for styling
      .attr("x", function (d, i) { return x(d.date) })
      .attr("y", function (d) { return y(d.nps + 1) })
      .attr("dy", "-5")
      .attr("font-family", "Pompadour")
      .attr("font-size", "20px")
      .attr("fill", "black")
      .text(function (d) { return d.nps; });

    // svg.append('text')
    //   .attr('x', 10)
    //   .attr('y', -30)
    //   .text('Your Scores Over Time')
    //   .attr("fill", "black");


    //NEW GRAPH

    let container = d3.select('#graph2'),
      width2 = 920,
      height2 = 600,
      margin2 = { top: 100, right: 120, bottom: 130, left: 150 },
      barPadding = .2,
      axisTicks = { qty: 5, outerSize: 0, dateFormat: '%m-%d' };
    let svg2 = container
      .append("svg")
      .attr("width", width2)
      .attr("height", height2)
      .append("g")
      .attr("transform", `translate(${margin2.left},${margin2.top})`)
      .attr("border-radius", "5px")
      .attr("style", "outline: thick solid black;");

    let xScale0 = d3.scaleBand().range([0, width2 - margin2.left - margin2.right]).padding(barPadding);
    let xScale1 = d3.scaleBand();
    let yScale = d3.scaleLinear().range([height2 - margin2.top - margin2.bottom, 0]);
    let xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    let yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);
    xScale0.domain(models.map(d => d.model_name));
    xScale1.domain(['field1', 'field2', 'field3', 'field4']).range([0, xScale0.bandwidth()]);
    // yScale.domain([0, d3.max(models, d => {
    //   if (d.field1 > d.field2) {
    //     return d.field1 > d.field3 ? d.field1 : d.field3
    //   }
    //   else {
    //     return d.field2 > d.field3 ? d.field2 : d.field3
    //   }
    // })]);
    yScale.domain([0, 100]);
    let model_name = svg2.selectAll(".model_name")
      .data(models)
      .enter().append("g")
      .attr("class", "model_name")
      .attr("transform", d => `translate(${xScale0(d.model_name)},0)`);

    model_name.selectAll(".bar.field1")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar field1")
      .style("fill", "blue")
      .attr("x", d => xScale1('field1'))
      .attr("y", d => yScale(d.field1))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => height2 - margin2.top - margin2.bottom - yScale(d.field1));
    model_name.selectAll(".bar.field2")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar field2")
      .style("fill", "red")
      .attr("x", d => xScale1('field2'))
      .attr("y", d => yScale(d.field2))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => height2 - margin2.top - margin2.bottom - yScale(d.field2));
    model_name.selectAll(".bar.field3")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar field3")
      .style("fill", "green")
      .attr("x", d => xScale1('field3'))
      .attr("y", d => yScale(d.field3))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => height2 - margin2.top - margin2.bottom - yScale(d.field3));

    svg2.append("g")
      .attr("class", "x axis")
      .style("font", "20px times")
      .attr("transform", `translate(0,${height2 - margin2.top - margin2.bottom})`)
      .call(xAxis);
    svg2.append("g")
      .attr("class", "y axis")
      .style("font", "20px times")
      .call(yAxis);
    svg2.append("circle").attr("cx", -10).attr("cy", -70).attr("r", 6).style("fill", "blue");
    svg2.append("circle").attr("cx", -10).attr("cy", -50).attr("r", 6).style("fill", "red");
    svg2.append("circle").attr("cx", -10).attr("cy", -30).attr("r", 6).style("fill", "green");
    svg2.append("text").attr("x", 0).attr("y", -70).text(`Gametype: ${categories[0]}`).style("font-size", "15px").style("fill", "blue").attr("alignment-baseline", "middle").style("font", "20px times");
    svg2.append("text").attr("x", 0).attr("y", -50).text(`Gametype: ${categories[1]}`).style("font-size", "15px").style("fill", "red").attr("alignment-baseline", "middle").style("font", "20px times");
    svg2.append("text").attr("x", 0).attr("y", -30).text(`Gametype: ${categories[2]}`).style("font-size", "15px").style("fill", "green").attr("alignment-baseline", "middle").style("font", "20px times");
    // svg2.append("text").attr("x", 100).attr("y", -70).text("Your Best 3 Categories Compared to Other Users").style("fill", "black").attr("alignment-baseline", "middle").style("font", "30px times");

  }

  render() {
    const questionsPosed = this.props.stats.gamesPlayed * 10;
    const questionsRight = this.props.stats.correctAnswers;
    const PercentageRightForThisGame = this.props.correctResponses.length * 10;
    const percentageRight = questionsPosed ? Math.floor((questionsRight / questionsPosed) * 100) : 0;
    let gameMode = this.props.gameMode;
    let graph = <div id='graph'></div>;
    let graph2 = <div id='graph2'></div>;
    let scoreBoard = <p>Your All-Time Score: {percentageRight}%<br />Your Score For This Game: {PercentageRightForThisGame}%</p>;
    // console.log(`questionsPosed: ${questionsPosed}, questionsRight: ${questionsRight}, percentageRight: ${percentageRight}, PercentageRightForThisGame: ${PercentageRightForThisGame}`);

    const categoryMap = {
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
    };
    const leaderBoard = [];
    for (let i = 0; i <= 10; i += 1) {
      let eachLeader = (
        <tr>
          <td>{this.state.rankings[i]}</td>
          <td>{this.state.usernames[i]}</td>
          <td>{categoryMap[this.state.categories[i]]}</td>
          <td>{this.state.scores[i]}</td>
        </tr>
      );
      leaderBoard.push(eachLeader);
    }



    return (
      <div>
        <Carousel autoPlay stopOnHover={true} infinteLoop={true}>
          <div>
            <img src="https://res.cloudinary.com/travelappcloud/image/upload/v1578619347/new_datapic_nps4au.jpg" />
          </div>

          <div className='leaderboard'>
            <Table striped bordered hover className='center'>
              <thead>
                <tr>
                  <th>Ranking</th>
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
            <p className="legend">Your Best 3 Categories Compared to Other Users</p>
          </div>
        </Carousel>
        <div className='scoreboard'>
          {scoreBoard}
        </div>
      </div >
    );
  }
}

export default Stats;