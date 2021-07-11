window.onload = function(){
  const nTilesX = 20
  const nTilesY = 15
  const speed = 300 // time in ms to move 1 tile

  var board = document.getElementById("board")
  var scoreElement = document.getElementById("score")
  var score = 0
  var contextFor2D = board.getContext("2d")
  board.width = nTilesX * tileSize()
  board.height = nTilesY * tileSize()
  var snake = new Snake(getRandomPosition())
  var target = getRandomPosition()
  var prevTime = performance.now() // ms since window loaded.

  document.addEventListener("keydown", changeDirection)

  window.requestAnimationFrame(updateBoard)
  function updateBoard(timeStamp){
    if (timeStamp - prevTime > speed) {
      moveSnake()
      if (checkOverlap(snake, target)) {
      	increaseScore(scoreElement)
      	moveTarget()
      }
      redraw() // draw everything
      prevTime = timeStamp
    }
    
    if (outOfFrame()) {
      alert("You lost")
    } else {
      window.requestAnimationFrame(updateBoard)
    }
  }

  function changeDirection(event) {
    const key = event.code
    switch (key) {
      case "ArrowUp" :
        snake.dir = "up"
        break
      case "ArrowDown" :
        snake.dir = "down"
        break
      case "ArrowRight" :
        snake.dir = "right"
        break
      case "ArrowLeft" :
        snake.dir = "left"
        break
    }
  }

  function moveSnake() {
    switch (snake.dir) {
        case "up" :
          snake.getHead().y = snake.getHead().y - tileSize()
          break
        case "down" :
          snake.getHead().y = snake.getHead().y + tileSize()
          break
        case "right" :
          snake.getHead().x = snake.getHead().x + tileSize()
          break
        case "left" :
          snake.getHead().x = snake.getHead().x - tileSize()
          break
    }
    console.log("update position")
  }

  function moveTarget() {
  	target = getRandomPosition()
  }

  function redraw() {
  	contextFor2D.clearRect(0, 0, board.width, board.height)
  	drawCircle(snake.getHead().x, snake.getHead().y, tileSize() / 2 - 1)
    drawCircle(target.x, target.y, tileSize() / 2 - 3)
  }

  // return true if snake overlaps target
  function checkOverlap(snake, target) {
  	return (snake.getHead().x == target.x) && (snake.getHead().y == target.y)
  }

  function increaseScore(scoreElement) {
  	scoreElement.innerText = ++score
  } 

  function tileSize() { // must be even because we divide by two to center things
    return 20
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getRandomPosition() {
  	// xy in pixels wrt canvas origin (top left)
    var pos = {
      x : getRandomInt(nTilesX - 1) * tileSize() + (tileSize() / 2),
      y : getRandomInt(nTilesY - 1) * tileSize() + (tileSize() / 2)
    }
    console.log("New circle at x=" + pos.x + ", y=" + pos.y)
    return pos
  }

  function outOfFrame() {
    return snake.getHead().x + tileSize() / 2 > board.width ||
    snake.getHead().x < 0 ||
    snake.getHead().y + tileSize() / 2 > board.height ||
    snake.getHead().y < 0
  }

  function drawCircle(x, y, radius) {
    contextFor2D.beginPath()
    contextFor2D.arc(x, y, radius, 0, 2 * Math.PI)
    contextFor2D.stroke()
  }
}

function Snake(pos) {
	this.segments = []
	this.dir = "right"
	this.segments.push(pos)
}

Snake.prototype.getHead = function() {
	return this.segments[0]
}