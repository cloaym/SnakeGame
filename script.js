window.onload = function(){
  // your code here
  var gameOver = false
  var board = document.getElementById("board")
  var contextFor2D = board.getContext("2d")
  var nTilesX = 20;
  var nTilesY = 15;
  board.width = (nTilesX * tileSize())
  board.height = (nTilesY * tileSize())
  var snake = {x:getRandomInt(board.width), y:getRandomInt(board.height), dir:"right"} // xy wrt canvas origin
  var prevTime = performance.now() // ms since window loaded.

  document.addEventListener("keydown", changeDirection)

  window.requestAnimationFrame(updateBoard)
  function updateBoard(timeStamp){
    moveSnake(timeStamp)
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
        break;
      case "ArrowDown" :
        snake.dir = "down"
        break;
      case "ArrowRight" :
        snake.dir = "right"
        break;
      case "ArrowLeft" :
        snake.dir = "left"
        break;
    }
  }

  function moveSnake(timeStamp){
    console.log("Prev: " + prevTime)
    console.log("Time: " + timeStamp)
    if (timeStamp - prevTime > 500) {
      contextFor2D.clearRect(0, 0, board.width, board.height)
      switch (snake.dir) {
        case "up" :
          snake.y = snake.y - tileSize()
          break;
        case "down" :
          snake.y = snake.y + tileSize()
          break;
        case "right" :
          snake.x = snake.x + tileSize()
          break;
        case "left" :
          snake.x = snake.x - tileSize()
          break;

      }
      console.log("update position")

      contextFor2D.beginPath()
      contextFor2D.arc(snake.x, snake.y, (tileSize() / 2) - 1, 0, 2 * Math.PI)
      contextFor2D.stroke()
      prevTime = timeStamp
    }
  }

  function tileSize() { // must be even
    return 20;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function outOfFrame() {
    return snake.x + tileSize()/2 > board.width ||
    snake.x < 0 ||
    snake.y + tileSize()/2 > board.height ||
    snake.y < 0
  }
};