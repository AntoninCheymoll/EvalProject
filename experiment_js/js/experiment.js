var ctx = {
  w: 1100,
  h: 500,

  trials: [],
  participant: "",
  startBlock: 0,
  startTrial: 0,
  cpt: 0,

  participantIndex:"Participant",
  blockIndex:"Block",
  trialIndex:"Trial",
  vvIndex:"V",
  objectsCountIndex:"O",

  trialNb: 0,
  errorNb: 0,
  participantNb: 0,
  startTime: 0,
  trialTime: -1,
  csvFile: "",
};

var showEndMessage = function() {

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("The experiment is over,");

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("thank you for your participation !");
}

var showIntertitle = function() {

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("Multiple shapes will get displayed.<br> Only <b>one shape</b> is different from all other shapes.");

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("1. Spot it as fast as possible and press <code>Space</code> bar. <br>2. Click on the placeholder over that shape.");

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("Press <code>GO</code> when ready to start.");
}

var startTime, interval, spottingTime;

document.addEventListener('keydown', function(event) {

  if(event.keyCode == 32) {
    event.preventDefault();

    if (ctx.trialTime === 0){
      ctx.trialTime = Date.now() - ctx.startTime;
    }

    d3.selectAll("rect")
      .transition()
      .attr("rx",0)
      .attr("ry",0)
      .attr("width", 30)
      .attr("height", 30)
      .style("fill", "white");

    function clicked(d,i) {

      if(d3.select(this).attr("id") === "uniqCircle"){

        if(ctx.trials[ctx.trialNb+1].Participant === ctx.participantNb){
          trial = ctx.trials[ctx.trialNb];
          ctx.csvFile = ctx.csvFile +trial.Participant + "," + trial.Practice + "," + trial.Block + "," +trial.Trial+ "," + trial.O + "," +trial.V+ "," +ctx.trialTime + "," + ctx.errorNb + "\n";
          ctx.errorNb = 0;
          ctx.trialNb++;

          startExperiment();

        }else{
          showEndMessage();
          d3.selectAll("rect").remove();

          var element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(ctx.csvFile));
          element.setAttribute('download', "result.csv");

          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }
      }else{
        ctx.errorNb++;
        startExperiment();
      }
    }

    d3.selectAll("rect")
      .on("click",clicked);
  }
});



  var nextTrial = function() {

  d3.selectAll("rect").remove();
  let trial = ctx.trials[ctx.trialNb];
  d3.select('#participantSel').property('value', trial.Participant);
  d3.select('#blockSel').property('value', trial.Block);
  d3.select('#trialSel').property('value', trial.Trial);

  setTimeout(() => {

    let circleNb;
    let otherCirclesColor;
    let uniqCircleColor;
    let otherCirclesSize;
    let uniqCircleSize;

    switch(trial.O) {
      case "Low":
        circleNb = 6;
        break;
      case "Medium":
        circleNb = 15;
        break;
      case "Large":
        circleNb = 24;
        break;
    }

    switch(trial.V) {
      case "Color":
        rand = Math.round(Math.random());
        otherCirclesColor = (rand==1)?"red":"color";
        uniqCircleColor= (rand==1)?"black":"red";
        rand = Math.round(Math.random());
        uniqCircleSize = (rand==1)?40:20;
        otherCirclesSize = (rand==1)?40:20;
        break;
      case "Size":
        rand = Math.round(Math.random());
        otherCirclesColor = (rand==1)?"red":"color";
        uniqCircleColor= (rand==1)?"red":"black";
        rand = Math.round(Math.random());
        uniqCircleSize = (rand==1)?20:40;
        otherCirclesSize = (rand==1)?40:20;
        break;
      case "Color&Size":
        rand = Math.round(Math.random());
        otherCirclesColor = (rand==1)?"red":"color";
        uniqCircleColor= (rand==1)?"black":"red";
        rand = Math.round(Math.random());
        uniqCircleSize = (rand==1)?40:20;
        otherCirclesSize = (rand==1)?20:40;
        break;
    }

    let circleList = [];

    for(let i=0; i<circleNb; i++){

      let position = returnNoneOverlappingPosition(circleList);
      let x = position[0];
      let y = position[1];
      circleList.push([x,y]);

      let color,size;
      if(trial.V === "Color&Size"){

        if(i/circleNb < 1/3){
          color = otherCirclesColor;
          size = otherCirclesSize;
        }else if(i/circleNb < 2/3){
          color = uniqCircleColor;
          size = otherCirclesSize;
        }else{
          color = otherCirclesColor;
          size = uniqCircleSize;
        }
      }else{
        color = otherCirclesColor;
        size = otherCirclesSize;
      }
      console.log(uniqCircleSize,otherCirclesSize);

      d3.select("#mainScene")
          .append("rect")
          .style("stroke", "gray")
          .style("fill", color)
          .attr("rx", size)
          .attr("ry", size)
          .attr("width", size)
          .attr("height", size)
          .attr("x", x)
          .attr("y", y)
          .attr("id","otherCircle");

    }

    let position = returnNoneOverlappingPosition(circleList);
    let x = position[0];
    let y = position[1];

    d3.select("#mainScene")
      .append("rect")
      .style("stroke", "gray")
      .style("fill", uniqCircleColor)
      .attr("rx", uniqCircleSize)
      .attr("ry", uniqCircleSize)
      .attr("height", uniqCircleSize)
      .attr("width", uniqCircleSize)
      .attr("x", x)
      .attr("y", y)
      .attr("id","uniqCircle");

      ctx.startTime = Date.now();
      ctx.trialTime = 0;

    }, 1000);

}

var returnNoneOverlappingPosition = function(circleList){
  let isOverlapping = true;
  let x,y;

  while(isOverlapping){
    isOverlapping = false;
    x = 50 + Math.random()*(ctx.w-(50)*2);
    y = 50 + Math.random()*(ctx.h-50*2);

    for(let pos of circleList){
      let dist = Math.sqrt((x-pos[0])*(x-pos[0]) + (y-pos[1])*(y-pos[1]));
      if(dist<50){
        isOverlapping = true
        break;
      }
    }
  }
  return [x,y];
}


var initExperiment = function(event){
  ctx.participantNb = d3.select("#participantSel").property("value");
  index = ctx.trials.findIndex(x => x.Participant === ctx.participantNb);
  ctx.trialNb = index;
  document.getElementById("goButton").style.display = "none";
  document.getElementById("participantSel").disabled = true;
  ctx.csvFile = ctx.csvFile + "Participant,Practice,Block,Trial,O,V,time,error\n"
}

var startExperiment = function(event) {
  if(event)event.preventDefault();

  d3.selectAll('.instr').remove();

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if(parseInt(ctx.trials[i][ctx.trialIndex]) == ctx.startTrial) {
          ctx.cpt = i - 1;
        }
      }
    }
  }

  console.log("start experiment at "+ctx.cpt);
  nextTrial();


}

var createScene = function(){
  var svgEl = d3.select("#scene").append("svg");
  svgEl.attr("id", "mainScene");
  svgEl.attr("width", ctx.w);
  svgEl.attr("height", ctx.h)
  .classed('centered', true);

  loadData(svgEl);
};

/****************************************/
/******** STARTING PARAMETERS ***********/
/****************************************/

var setTrial = function(trialID) {
  ctx.startTrial = parseInt(trialID);
}

var setBlock = function(blockID) {
  ctx.startBlock = parseInt(blockID);

  var trial = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if(!(ctx.trials[i][ctx.trialIndex] === trial)) {
          trial = ctx.trials[i][ctx.trialIndex];
          options.push(trial);
        }
      }
    }
  }

  var select = d3.select("#trialSel");

  select.selectAll('option')
    .data(options)
    .enter()
    .append('option')
    .text(function (d) { return d; });

  setTrial(options[0]);

}

var setParticipant = function(participantID) {
  ctx.participant = participantID;

  var block = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(!(ctx.trials[i][ctx.blockIndex] === block)) {
        block = ctx.trials[i][ctx.blockIndex];
        options.push(block);
      }
    }
  }

  var select = d3.select("#blockSel")
  select.selectAll('option')
    .data(options)
    .enter()
    .append('option')
    .text(function (d) { return d; });

  setBlock(options[0]);

};

var loadData = function(svgEl){

  d3.csv("experiment.csv").then(function(data){
    ctx.trials = data;

    var participant = "";
    var options = [];

    for(var i = 0; i < ctx.trials.length; i++) {
      if(!(ctx.trials[i][ctx.participantIndex] === participant)) {
        participant = ctx.trials[i][ctx.participantIndex];
        options.push(participant);
      }
    }

    var select = d3.select("#participantSel")
    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
      .text(function (d) { return d; });

    setParticipant(options[0]);

  }).catch(function(error){console.log(error)});
};

function onchangeParticipant() {
  selectValue = d3.select('#participantSel').property('value');
  setParticipant(selectValue);
};

function onchangeBlock() {
  selectValue = d3.select('#blockSel').property('value');
  setBlock(selectValue);
};

function onchangeTrial() {
  selectValue = d3.select("#trialSel").property('value');
  setTrial(selectValue);
};
