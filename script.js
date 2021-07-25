window.onload = function () {
  var board = document.getElementById("board")
  var scoreElement = document.getElementById("score")
  var contextFor2D = board.getContext("2d")
  var gameState
  /** approx time in ms to move snake forward one square/update board */
  var updateRate
  var score
  var snake
  var target
  var nTilesX
  var nTilesY
  var tileWidth
  initGame()
  
  var prevTime = performance.now() // ms since window loaded.

  document.addEventListener("keydown", handleKeyInput)
  document.addEventListener("touchstart", handleTouchStart)
  document.addEventListener("touchmove", handleTouchMove)
  var xDown = null
  var yDown = null

  var button = document.getElementById("button")
  button.addEventListener("click", buttonHandler)

  function setUpBoardSizes() {
    // set nTilesX, nTilesY, tileSize based on window size
    const xDim = window.innerWidth * 0.9
    const yDim = window.innerHeight * 0.6

    var isLandscape = xDim > yDim

    if (isLandscape) {
      nTilesX = 20
      nTilesY = 15
    } else {
      nTilesX = 15
      nTilesY = 20
    }

    limitedByX = xDim / nTilesX < yDim / nTilesY
    if (limitedByX) {
      var estTileSize = xDim / nTilesX
    } else {
      var estTileSize = yDim / nTilesY
    }
    // must be even because we divide by two to center things
    tileWidth = Math.floor(estTileSize)
    if (tileSize % 2 == 1) {
      tileWidth = tileSize - 1
    }
  }

  function buttonHandler(event) {
    button.blur() // prevent focusing on button so subsequent space doesn't trigger callback twice (thru key and button)
    switch (gameState) {
      case gameStates.LOADED :
        gameState = gameStates.PLAYING
        button.textContent = "Pause"
        window.requestAnimationFrame(updateBoard)
        break
      case gameStates.PLAYING :
        gameState = gameStates.PAUSED
        button.textContent = "Resume"
        break
      case gameStates.PAUSED :
        gameState = gameStates.PLAYING
        button.textContent = "Pause"
        window.requestAnimationFrame(updateBoard)
        break
      case gameStates.FINISHED :
        gameState = gameStates.PLAYING
        button.textContent = "Paused"
        window.requestAnimationFrame(updateBoard)
        break
    }    
  }

  function updateBoard(timeStamp) {
    // consider not wasting CPU cycles
    if (gameState == gameStates.PLAYING && timeStamp - prevTime > updateRate) {
      var nextPosition = snake.getNextPosition(tileSize())
      if (checkOverlapWithTarget(nextPosition, target)) {
        increaseScore(scoreElement)
        increaseSpeed()
        moveTarget()
        growOrMoveSnake(nextPosition, true)
      } else {
        growOrMoveSnake(nextPosition, false)
      }

      if (snake.checkOverlapWithSelf() || outOfFrame()) {
        gameState = gameStates.FINISHED
        button.textContent = "New Game"
        alert("You lost")
        initGame()
        return
      }

      redraw() // draw everything
      prevTime = timeStamp
    }

    window.requestAnimationFrame(updateBoard)
  }

  function initGame() {
    updateRate = 300 // time in ms to move 1 tile
    score = 0
    scoreElement.innerText = 0
    setUpBoardSizes()
    board.width = nTilesX * tileSize()
    board.height = nTilesY * tileSize()
    snake = new Snake(getRandomPosition())
    target = getRandomPosition()
    gameState = gameStates.LOADED
  }

  function handleKeyInput(event) {
    const key = event.code
    switch (key) {
      case "ArrowUp":
      case "KeyW":
        changeDirection("up")
        break
      case "ArrowDown":
      case "KeyS":
        changeDirection("down")
        break
      case "ArrowRight":
      case "KeyD":
        changeDirection("right")
        break
      case "ArrowLeft":
      case "KeyA":
        changeDirection("left")
        break
      case "Space":
      case "KeyP":
        buttonHandler()
        break
    }
  }

  function handleTouchStart(event) {
    const firstTouch = event.touches[0]
    xDown = firstTouch.clientX
    yDown = firstTouch.clientY
  };

  /**
   * Modified from
   * https://stackoverflow.com/a/23230280
   * (user "givanse")
   */
  function handleTouchMove(event) {
    if (!xDown || !yDown) {
      return;
    }

    var xUp = event.touches[0].clientX;
    var yUp = event.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) { // horizontal component larger
      if (xDiff > 0) {
        /* left swipe */
        changeDirection("left")
      } else {
        /* right swipe */
        changeDirection("right")
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
        changeDirection("up")
      } else {
        /* down swipe */
        changeDirection("down")
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  };

  function changeDirection(direction) {
    snake.dir = direction
  }

  function growOrMoveSnake(nextPosition, ateTarget) {
    if (ateTarget) {
      snake.addToFront(nextPosition)
    } else {
      snake.moveBackToFront(nextPosition)
    }
  }

  function moveTarget() {
    target = getRandomPosition()
  }

  function redraw() {
    contextFor2D.clearRect(0, 0, board.width, board.height)
    snake.getSegments().forEach(segment => {
      drawCircle(segment.x, segment.y, tileSize() / 2 - 1)
    })
    drawCircle(target.x, target.y, tileSize() / 2 - 3)
  }

  // return true if snake overlaps target
  function checkOverlapWithTarget(nextSnakeHead, target) {
    return (nextSnakeHead.x == target.x) && (nextSnakeHead.y == target.y)
  }

  function increaseScore(scoreElement) {
    scoreElement.innerText = ++score
  }

  function increaseSpeed() {
    updateRate = 0.95 * updateRate
  }

  function tileSize() {
    return tileWidth
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function getRandomPosition() {
    // xy in pixels wrt canvas origin (top left)
    var pos = {
      x: getRandomInt(nTilesX - 1) * tileSize() + (tileSize() / 2),
      y: getRandomInt(nTilesY - 1) * tileSize() + (tileSize() / 2)
    }
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

const gameStates = {
  LOADED : "loaded", // hasn't started
  PLAYING : "playing",
  PAUSED : "paused",
  FINISHED : "finished" // lost
}

function Snake(pos) {
  this.segments = []
  this.dir = "right"
  this.segments.push(pos)
  return this
}

Snake.prototype.getHead = function () {
  return this.segments[0]
}

Snake.prototype.getSegments = function () {
  return this.segments
}

Snake.prototype.getNextPosition = function (tileSize) {
  var nextPos = {
    x: this.getHead().x,
    y: this.getHead().y
  }
  switch (this.dir) {
    case "up":
      nextPos.y -= tileSize
      break
    case "down":
      nextPos.y += tileSize
      break
    case "right":
      nextPos.x += tileSize
      break
    case "left":
      nextPos.x -= tileSize
      break
  }
  return nextPos
}

Snake.prototype.addToFront = function (nextPos) {
  this.segments.unshift(nextPos)
}

Snake.prototype.moveBackToFront = function (nextPos) {
  this.segments.pop()
  this.segments.unshift(nextPos)
}

Snake.prototype.checkOverlapWithSelf = function () {
  for (var i = 1; i < this.segments.length; i++) {
    if ((this.getHead().x == this.segments[i].x) && (this.getHead().y == this.segments[i].y)) {
      return true
    }
  }
  return false
}