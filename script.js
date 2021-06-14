window.onload = function(){
  // your code here
  var gameOver = false
  var board = document.getElementById("board")
  var contextFor2D = board.getContext("2d")
  var snake = {x:100, y:100, dir:"right"}
  var prevTime = performance.now() // ms since window loaded.
  console.log("Prev: " + prevTime)
  var i = 0;

  window.requestAnimationFrame(updateBoard) // why does this work???
  function updateBoard(){
    moveSnake()
    if (snake.x > 500) {
      window.alert("You lost")
    } else {
      window.requestAnimationFrame(updateBoard)
    }
  }

  function moveSnake(){
    var time = performance.now()
    console.log("Prev: " + prevTime)
    console.log("Time: " + time)
    if (time - prevTime > 1000) {
      contextFor2D.clearRect(0, 0, board.width, board.height)
      if (snake.dir === "right") {
        snake.x = snake.x + 30
        console.log("update position")
      }
      contextFor2D.beginPath()
      contextFor2D.arc(snake.x, snake.y, 10, 0, 2 * Math.PI)
      contextFor2D.stroke()
      prevTime = time
    }
  }
};