import './styles.css';
import Victor from 'victor';

var lastTime;
var currentTime;
var currentTick = 0;
var backgroundColor = "black";
var gConstant = 5;

function getMouseLocation(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return new Victor(event.clientX - rect.left, event.clientY - rect.top);
}

class Body {

  constructor(location, velocity) {
    this.location = location;
    this.velocity = velocity;
    this.mass = 10;
    this.id = Math.random();
  }

  updateVelocity(bodies) {
    var self = this;
    for(var body of bodies) {
      if(body.id !== self.id) {
        var nominator = gConstant*self.mass*body.mass;
        var distanceVector = self.location.clone();
        distanceVector.subtract(body.location);
        var forceMagnitude = nominator/(distanceVector.lengthSq());

        distanceVector.normalize();
        distanceVector.x = distanceVector.x * forceMagnitude;
        distanceVector.y = distanceVector.y * forceMagnitude;
        self.velocity.add(distanceVector);
      }
    }
    //set speed limit
    if(this.velocity.length() > 15) {
      this.velocity.normalize();
      this.velocity.x = this.velocity.x * 15;
      this.velocity.y = this.velocity.y * 15;
    }
  }

  updateLocation() {
    this.location.subtract(this.velocity);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(Math.round(this.location.x), Math.round(this.location.y), 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
  }
}

function getFramesPerSecond() {
  if(lastTime == null) {
    lastTime = Date.now();
  }
  currentTime = Date.now();
  var fps = (1/(currentTime - lastTime)*1000);
  lastTime = currentTime;
  return fps;
}

function getContext() {
  var canvas = document.getElementById("mainCanvas");
  return canvas.getContext("2d");
}

function clearScreen(ctx) {
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function initialize() {
  var ctx = getContext();
  clearScreen(ctx);
}

function drawCursor(ctx) {
  if(mousePressed && mouseMoving) {
    ctx.beginPath();
    ctx.arc(Math.round(mousePressedLocation.x), Math.round(mousePressedLocation.y), 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#003300';
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.moveTo(mousePressedLocation.x,mousePressedLocation.y);
    ctx.lineTo(currentMouseLocation.x,currentMouseLocation.y);
    ctx.stroke();
  }
}

function createOrbitingBody(location, centerBody) {
  var difference = location.clone();
  difference.subtract(centerBody.location);
  var velocityMagnitude = Math.sqrt(((gConstant * centerBody.mass)/difference.length()));
  difference.normalize();
  difference.rotateDeg(90);
  difference.x = difference.x * velocityMagnitude;
  difference.y = difference.y * velocityMagnitude;

  return new Body(location, difference);
}


function setupBoard() {
  var ctx = getContext();
  var bodies = [];
  var middleOfCanvas = new Victor(ctx.canvas.width/2, ctx.canvas.height/2);
  var root = new Body(middleOfCanvas, new Victor(0,0));
  root.mass = 100;
  //making it so the center planet doesnt move
  root.updateLocation = function() {};
  bodies.push(root);

  // bodies.push(new Body(new Victor(400,100), new Victor(-2,0)));
  // bodies.push(new Body(new Victor(500,200), new Victor(5,0)));

  bodies.push(createOrbitingBody(new Victor(50,500), root));
  //bodies.push(createOrbitingBody(new Victor(200,200), root));
  return bodies
}

var runGame = function runGame() {
  var ctx = getContext();
  clearScreen(ctx);

  currentTick++;
  var fps = getFramesPerSecond();
  if((currentTick % 60) == 0) {
    console.log("FPS: " + fps);
  }

  // Dreaded O(n^2) to calculate the effects of each body on each other
  // Its accurate, we can improve if its a problem later
  for(var body of bodies) {
    body.updateVelocity(bodies);
  }
  // Need to update the location after each has their velocities updated
  for(var body of bodies) {
    body.updateLocation();
    body.draw(ctx);
  }

  drawCursor(ctx);
}


initialize();
var bodies = setupBoard();
window.setInterval(runGame, "17");


var canvas = document.getElementById('mainCanvas');
var context = canvas.getContext('2d');

var mousePressed = false;
var mousePressedLocation;
var mouseMoving = false;
var currentMouseLocation;

canvas.addEventListener("mousedown", function(event) {
    mousePressed = true;
    mousePressedLocation = getMouseLocation(canvas, event);
}, false);

canvas.addEventListener("mousemove", function(event) {
    mouseMoving = true;
    currentMouseLocation = getMouseLocation(canvas, event);
}, false);

canvas.addEventListener('mouseup', function(event) {

  if(mousePressed && (mouseMoving == false)) {
    //click
    // todo when theres a center make a perfect orbit
  } else if(mouseMoving) {
    // if they were clicking and dragging
    var mouseUpLocation = getMouseLocation(canvas, event);
    var velocity = mousePressedLocation.clone();
    velocity.subtract(mouseUpLocation);
    velocity.x = velocity.x/50;
    velocity.y = velocity.y/50;
    bodies.push(new Body(mousePressedLocation, velocity));
  }
  mousePressed = false;
}, false)
