import './styles.css';
import Victor from 'victor';

var lastTime;
var currentTime;
var currentTick = 0;
var backgroundColor = "black";
var gConstant = 10;

class Body {
  constructor(x, y, dx, dy) {
    this.location = new Victor(x, y);
    this.velocity = new Victor(dx, dy);
    this.mass = 10;
    this.id = Math.random();
  }

  update(bodies) {
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

    //finally change the actual location
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
    body.update(bodies);
    body.draw(ctx);
  }
}


initialize();
var bodies = [];
bodies.push(new Body(400,100,-2,0));
bodies.push(new Body(500,200,5,0));
window.setInterval(runGame, "17");
