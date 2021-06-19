window.onload = function(){
  const nTilesX = 20;
  const nTilesY = 15;
  const speed = 300; // time in ms to move 1 tile

  var board = document.getElementById("board")
  var contextFor2D = board.getContext("2d")
  board.width = nTilesX * tileSize()
  board.height = nTilesY * tileSize()
  var snakePos = getRandomPosition(tileSize(), nTilesX, nTilesY)
  var snake = {
    x : snakePos.x, // xy of snake center wrt canvas origin (top left)
    y : snakePos.y,
    dir : "right"
  }
  var targetPos = getRandomPosition(tileSize(), nTilesX, nTilesY)
  var target = {
    x : targetPos.x,
    y : targetPos.y
  }
  var prevTime = performance.now() // ms since window loaded.

  document.addEventListener("keydown", changeDirection)

  window.requestAnimationFrame(updateBoard)
  function updateBoard(timeStamp){
    if (timeStamp - prevTime > speed) {
      contextFor2D.clearRect(0, 0, board.width, board.height)
      drawSnakeInNextPos()
      drawTarget()
      prevTime = timeStamp
    }
    
    if (outOfFrame()) {
      window.alert("You lost")
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

  function drawSnakeInNextPos() {
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
    drawCircle(snake.x, snake.y, tileSize() / 2 - 1)
  }

  function drawTarget() {
    drawCircle(target.x, target.y, tileSize() / 2 - 3)
  }

  function tileSize() { // must be even
    return 20;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getRandomPosition(tileSize, nTilesX, nTilesY) {
    var pos = {
      x : getRandomInt(nTilesX - 1) * tileSize - (tileSize / 2),
      y : getRandomInt(nTilesY - 1) * tileSize - (tileSize / 2)
    }
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