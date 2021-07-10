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
  var snake = getRandomPosition()
  snake.dir = "right"
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
          snake.y = snake.y - tileSize()
          break
        case "down" :
          snake.y = snake.y + tileSize()
          break
        case "right" :
          snake.x = snake.x + tileSize()
          break
        case "left" :
          snake.x = snake.x - tileSize()
          break
    }
    console.log("update position")
  }

  function moveTarget() {
  	target = getRandomPosition()
  }

  function redraw() {
  	contextFor2D.clearRect(0, 0, board.width, board.height)
  	drawCircle(snake.x, snake.y, tileSize() / 2 - 1)
    drawCircle(target.x, target.y, tileSize() / 2 - 3)
  }

  // return true if snake overlaps target
  function checkOverlap(snake, target) {
  	return (snake.x == target.x) && (snake.y == target.y)
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
    return snake.x + tileSize() / 2 > board.width ||
    snake.x < 0 ||
    snake.y + tileSize() / 2 > board.height ||
    snake.y < 0
  }

  function drawCircle(x, y, radius) {
    contextFor2D.beginPath()
    contextFor2D.arc(x, y, radius, 0, 2 * Math.PI)
    contextFor2D.stroke()
  }
};