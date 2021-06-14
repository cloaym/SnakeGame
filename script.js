

window.onload = function(){
  // your code here
  var gameOver = false
  var board = document.getElementById("board")
  var contextFor2D = board.getContext("2d")
  var snake = {x:100, y:100, dir:"right"}
  var animations = 0
  while(animations < 6){
  	animations++
  	updateBoard()
  }

  function updateBoard() {
	  window.requestAnimationFrame(moveSnake)
}

function moveSnake(){
	contextFor2D.clearRect(0, 0, board.width, board.height)
	if (snake.dir === "right") {
		snake.x = snake.x + 30;
	}
	contextFor2D.beginPath()
	contextFor2D.arc(snake.x, snake.y, 10, 0, 2 * Math.PI)
	contextFor2D.stroke()
}
};