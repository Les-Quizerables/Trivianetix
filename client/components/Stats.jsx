import React, { Component } from "react";
import * as d3 from "d3";
import Table from 'react-bootstrap/Table';

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
    .then((res)=> {
      // Constructing data of graph 
      console.log(res)
      let models = [];
      let model1 = {"model_name": "Your scores" };
      let model2 = {"model_name": "High School"}; 
      let model3 = {"model_name" : "Bachelors"};
      let model4 = {"model_name": "Masters"};
      for (let i = 0; i < 3; i += 1) {
        let userCategory = res.currentuser[i + 9];
        model1[`field${i + 1}`] = userCategory;

      }
      for (let i = 0; i < 3; i += 1) {
        let userCategory = res.users.SE[i + 9];
        model2[`field${i + 1}`] = userCategory;

      }
      for (let i = 0; i < 3; i += 1) {
        let userCategory = res.users.BA[i + 9];
        model3[`field${i + 1}`] = userCategory;

      }
      for (let i = 0; i < 3; i += 1) {
        let userCategory = res.users.MA[i + 9];
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
      for (let key in graph){
        console.log(graph[key]);
        date = new Date(graph[key].to_char);
        nps = Number(graph[key].correct_answers)/10;
         graphArray.push({'date': date, 'nps': nps});
      }    
      console.log(graphArray);
      this.drawChart(models, graphArray);
    })
    // .then(()=> {
    //   var models = [{
    //     "model_name":"PHD",
    //     "field1":19,
    //     "field2":83,
    //     "field3":50, 
    //   },
    //   {
    //     "model_name":"High School",
    //     "field1":67,
    //     "field2":93,
    //     "field3": 20,
    //   },
    //   {
    //     "model_name":"College",
    //     "field1":40,
    //     "field2":56,
    //     "field3":100,
    //   },
    //   {
    //     "model_name":"You",
    //     "field1":60,
    //     "field2":80,
    //     "field3":10,
    //   }];
    //   this.drawChart(models)})
    .catch(err => console.log(err));

    // fetch(`/getGraphData/${chosentopic}/HighSchool`)
    // .then(res => res.json)
    // .catch(err => console.log(err))

    // fetch(`/getGraphData/${chosentopic}/PHD`)
    // .then(res => res.json)
    // .catch(err => console.log(err))
  }
  drawChart(data, data2) {
    let models = data;
    let lineData = data2;
    //give the graph an array of data with each element as an object with date: new date and nps: score
    // var lineData = [];
    
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
    
    var height  = 600;
    var width   = 700;
    var hEach   = 40;
    
    var margin = {top: 120, right: 25, bottom: 125, left: 25};
    
    width =     width - margin.left - margin.right;
    height =    height - margin.top - margin.bottom;
    
    var svg = d3.select('#graph').append("svg")
      .attr("width",  width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("border-radius", "5px")
      // .attr("font-size", "20px")
      .attr("style", "outline: thick solid black;");   //This will do the job
      
    
    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    x.domain(d3.extent(lineData, function(d) { return d.date; }));
    
    
    var y = d3.scaleLinear().range([height, 0]);
    
    
    y.domain([d3.min(lineData, function(d) { return d.nps; }) - 5, 100]);
    
    var valueline = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.nps);  })
            .curve(d3.curveMonotoneX);
    
    svg.append("path")
        .data([lineData]) 
        .attr("class", "line")  
        .attr("d", valueline); 
       
    
    
     var xAxis_woy = d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")).tickValues(lineData.map(d=>d.date));
    
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
        .attr("cx", function(d) { return x(d.date) })
        .attr("cy", function(d) { return y(d.nps) })
        .attr("r", 5)
        .attr("fill","red");  
    
    
    svg.selectAll(".text")
        .data(lineData)
        .enter()
        .append("text") // Uses the enter().append() method
        .attr("class", "label") // Assign a class for styling
        .attr("x", function(d, i) { return x(d.date) })
        .attr("y", function(d) { return y(d.nps + 1) })
        .attr("dy", "-5")
        .attr("font-family", "Pompadour")
        .attr("font-size", "20px")
        .attr("fill", "black")
        .text(function(d) {return d.nps; });
    
    svg.append('text')                                     
          .attr('x', 10)              
          .attr('y', -30)             
          .text('Score Over Time for This Topic')
          .attr("fill", "black"); 


    //NEW GRAPH
   
    var container = d3.select('#graph'),
      width = 920,
      height = 620,
      margin = {top: 130, right: 120, bottom: 130, left: 150},
      barPadding = .2,
      axisTicks = {qty: 5, outerSize: 0, dateFormat: '%m-%d'};
    var svg2 = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("border-radius", "5px")
      .attr("style", "outline: thick solid black;");
    //   var redBox = svg2.append("rect")
    // .attr("width", width)
    // .attr("height", height)
    // .attr("fill", "red")
    // .attr("opacity", 0.2);
    var xScale0 = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(barPadding);
    var xScale1 = d3.scaleBand();
    var yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);
    var xAxis = d3.axisBottom(xScale0).tickSizeOuter(axisTicks.outerSize);
    var yAxis = d3.axisLeft(yScale).ticks(axisTicks.qty).tickSizeOuter(axisTicks.outerSize);
    xScale0.domain(models.map(d => d.model_name));
    xScale1.domain(['field1', 'field2', 'field3', 'field4']).range([0, xScale0.bandwidth()]);
    yScale.domain([0, d3.max(models, d => {
      if (d.field1 > d.field2) {
        return d.field1 > d.field3 ? d.field1 : d.field3
      }
      else {
        return d.field2 > d.field3 ? d.field2 : d.field3
      }
    })]);
    var model_name = svg2.selectAll(".model_name")
      .data(models)
      .enter().append("g")
      .attr("class", "model_name")
      .attr("transform", d => `translate(${xScale0(d.model_name)},0)`);
    //   svg2.append("rect")
    // .attr("width", "100%")
    // .attr("height", "100%")
    // .attr("fill", "pink");
    model_name.selectAll(".bar.field1")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar field1")
      .style("fill","blue")
      .attr("x", d => xScale1('field1'))
      .attr("y", d => yScale(d.field1))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => height - margin.top - margin.bottom - yScale(d.field1));
    model_name.selectAll(".bar.field2")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar field2")
      .style("fill","red")
      .attr("x", d => xScale1('field2'))
      .attr("y", d => yScale(d.field2))
      .attr("width", xScale1.bandwidth())
      .attr("height", d =>  height - margin.top - margin.bottom - yScale(d.field2));
    model_name.selectAll(".bar.field3")
      .data(d => [d])
      .enter()
      .append("rect")
      .attr("class", "bar field3")
      .style("fill","green")
      .attr("x", d => xScale1('field3'))
      .attr("y", d => yScale(d.field3))
      .attr("width", xScale1.bandwidth())
      .attr("height", d => height - margin.top - margin.bottom - yScale(d.field3));
      
    svg2.append("g")
      .attr("class", "x axis")
      .style("font", "20px times")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis);
    svg2.append("g")
      .attr("class", "y axis")
      .style("font", "20px times")
      .call(yAxis);
    svg2.append("circle").attr("cx", -10).attr("cy", -70).attr("r", 6).style("fill", "blue");
    svg2.append("circle").attr("cx", -10).attr("cy", -50).attr("r", 6).style("fill", "red");
    svg2.append("circle").attr("cx", -10).attr("cy", -30).attr("r", 6).style("fill", "green");
    svg2.append("text").attr("x", 0).attr("y", -70).text("Gametype: Film").style("font-size", "15px").style("fill", "blue").attr("alignment-baseline","middle").style("font", "20px times");
    svg2.append("text").attr("x", 0).attr("y", -50).text("Gametype: Music").style("font-size", "15px").style("fill", "red").attr("alignment-baseline","middle").style("font", "20px times");
    svg2.append("text").attr("x", 0).attr("y", -30).text("Gametype: Politics").style("font-size", "15px").style("fill", "green").attr("alignment-baseline","middle").style("font", "20px times");    
  }

  render() {
    const questionsPosed = this.props.stats.gamesPlayed * 10;
    const questionsRight = this.props.stats.correctAnswers;
    const PercentageRightForThisGame = this.props.correctResponses.length * 10;
    const percentageRight = questionsPosed ? Math.floor((questionsRight / questionsPosed) * 100) : 0;
    let gameMode = this.props.gameMode;
    let graph = <div id='graph'></div>;
    let scoreBoard = <p>Your All-Time Score: {percentageRight}%<br/>Your Score For This Game: {PercentageRightForThisGame}%</p>;
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
        <div className='scoreboard'>
          {scoreBoard}
          {graph}
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
      </div>
    );
  }
}

export default Stats;