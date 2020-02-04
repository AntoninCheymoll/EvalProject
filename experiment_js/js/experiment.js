var ctx = {
  w: 1400,
  h: 600,

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
};

var nextTrial = function() {

  let trial = ctx.trials[ctx.trialNb];
  console.log(trial);

  let circleNb;
  let otherCirclesColor;
  let uniqCircleColor;
  let otherCirclesSize;
  let uniqCircleSize;

  switch(trial.O) {
    case "Low":
      circleNb = 3;
      break;
    case "Medium":
      circleNb = 7;
      break;
    case "Large":
      circleNb = 10;
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

  d3.selectAll("rect").remove();

  for(let i=0; i<circleNb; i++){
    let x = uniqCircleSize + Math.random()*(ctx.w-uniqCircleSize*2);
    let y = uniqCircleSize + Math.random()*(ctx.h-uniqCircleSize*2);
    d3.select("#mainScene")
      .append("rect")
      .style("stroke", "gray")
      .style("fill", otherCirclesColor)
      .attr("rx", otherCirclesSize)
      .attr("ry", otherCirclesSize)
      .attr("width", otherCirclesSize)
      .attr("height", otherCirclesSize)
      .attr("x", x)
      .attr("y", y);
  }

  let x = otherCirclesSize + Math.random()*(ctx.w-otherCirclesSize*2);
  let y = otherCirclesSize + Math.random()*(ctx.h-otherCirclesSize*2);
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

  var startTime, interval;
  startTime = Date.now();
  interval = setInterval(function() {
    var elapsedTime = Date.now() - startTime;
    document.getElementById("timer").innerHTML = (elapsedTime / 1000).toFixed(3);
  }, 10000);
}

var startExperiment = function(event) {
  event.preventDefault();

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
  ctx.trialNb++;
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
