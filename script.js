window.onload = function () {
  var board = document.getElementById("board")
  var scoreElement = document.getElementById("score")
  var highScoreElement = document.getElementById("highScore")
  var contextFor2D = board.getContext("2d")
  var confetti
  var gameState = gameStates.LOADED
  /** approx time in ms to move snake forward one square/update board */
  var updateRate
  var score
  var highScore
  var mode
  var snake
  var targets = []
  var targetImage = new Image()
  var nTilesX
  var nTilesY
  /** pixels */
  var tileWidth
  var directionQueue = []
  loadModePreference()
  loadHighScore(mode)

  function loadThemeResources() {
    return new Promise((resolve, reject) => {
      const expectedNumResources = 1
      var numLoaded = 0
      targetImage = new Image()
      targetImage.onload = () => {
        if (++numLoaded == expectedNumResources) {
          console.log("loaded our target Image!!")
          resolve()
        }
      }
      targetImage.src = pathToTheme + "basic_target.svg"
    })
  }

  loadThemeResources()
    .then(() => initGame())
  
  var prevTime = performance.now() // ms since window loaded.

  document.getElementById("settingsButton").addEventListener("click", toggleSettings)
  document.getElementsByName("theme").forEach(element => element.addEventListener("change", changeTheme))
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", systemThemeChanged)
  document.getElementsByName("mode").forEach(element => element.addEventListener("change", changeMode))
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
        if (confetti) {
          // clear() can only be called once - must be re-initialized/rendered before next call
          confetti.clear()
        }
        gameState = gameStates.PLAYING
        button.textContent = "Paused"
        window.requestAnimationFrame(updateBoard)
        break
    }    
  }

  function updateBoard(timeStamp) {
    // consider not wasting CPU cycles
    if (gameState == gameStates.PLAYING && timeStamp - prevTime > updateRate) {
      if (directionQueue.length != 0) {
        snake.dir = directionQueue.shift()
      }
      var nextPosition = snake.getNextPosition()
      activatedTarget = checkOverlapWithTargets(nextPosition, targets)
      if (activatedTarget) {
        activate(activatedTarget, nextPosition)
      } else {
        growOrMoveSnake(nextPosition, false)
        // at a semi-random interval, spawn target
        const rand = getRandomInt(1000)
        if (mode == modes.ARCADE && rand < 25) {
          spawnTarget(snake)
        }
      }

      if (snake.checkOverlapWithSelf() || outOfFrame()) {
        endGame()
      }

      redraw() // draw everything
      prevTime = timeStamp
    }

    window.requestAnimationFrame(updateBoard)
  }

  function activate(target, nextPosition) {
    if (target.didLose()) {
      endGame()
    } else {
      changeScore(target.getScoreChange())
      changeSpeed(target.getNewUpdateRate(updateRate, mode))
      growOrMoveSnake(nextPosition, target.shouldIncreaseSnakeSize())
      moveTarget(activatedTarget, snake) // TODO - change spawning so it is independent of consuming target
    }
  }

  function endGame() {
    gameState = gameStates.FINISHED
        button.textContent = "New Game"
        if (score > highScore) {
          // set confetti settings here because scrollHeight changes after loading
          var confettiSettings = {target: "confetti", height: document.documentElement.scrollHeight}
          confetti = new ConfettiGenerator(confettiSettings)
          confetti.render()
          saveHighScore(mode)
        } else {
          alert("You lost")
        }
        initGame()
        return
  }
  
  function loadModePreference() {
    var savedMode = getCookie("difficulty") // for backwards compatibility, mode used to be called difficulty
    if (savedMode != null) {
      mode = savedMode
    } else {
      mode = modes.EASY
    }
  }

  function loadHighScore(mode) {
    var savedHighScore = getCookie("highScore_" + mode)
    if (savedHighScore != null) {
      highScore = savedHighScore
    } else {
      highScore = 0
    }
    highScoreElement.innerText = highScore
    document.getElementById("highScoreLabel").innerText = "High Score (" + capitalizeFirstLetter(mode) + "):"
  }

  function capitalizeFirstLetter(string) {
    return string.substring(0, 1).toUpperCase() + string.substring(1)
  }

  function saveHighScore(mode) {
    highScore = score
    highScoreElement.innerText = highScore
    document.cookie = "highScore_" + mode + "=" + highScore + "; SameSite=Strict;"
  }

function initGame() {
    updateRate = 300
    score = 0
    scoreElement.innerText = 0
    setUpBoardSizes()
    board.width = nTilesX * tileSize()
    board.height = nTilesY * tileSize()
    snake = new Snake({i:0, j:0})
    targets = [new Target(getRandomUnoccupiedPosition(snake))]
    hideSettings()
  }

  function toggleSettings(event) {
    var settingsPanel = document.getElementById("settings")
    if (settingsPanel.classList.contains("hidden")) {
      settingsPanel.classList.remove("hidden")
      var themes = document.getElementsByName("theme")
      themes.forEach(theme => {
        if (theme.value == getCurrentTheme()) {
          theme.checked = "checked"
        }
      })
      var modeOptions = document.getElementsByName("mode")
      modeOptions.forEach(modeOption => {
        if (modeOption.value == mode) {
          modeOption.checked = "checked"
        }
      })
    } else {
      settingsPanel.classList.add("hidden")
    }
  }

  function hideSettings() {
    var settingsPanel = document.getElementById("settings")
    if (!settingsPanel.classList.contains("hidden")) {
      settingsPanel.classList.add("hidden")
    }
  }

  function changeTheme(event) {
    var theme = event.target.value
    changeThemeResource(theme)
    document.cookie = "theme=" + theme + "; SameSite=Strict;"
    loadThemeResources()
      .then(() => redraw())
  }

  function systemThemeChanged(event) {
    if (getCookie("theme") == null) {
      // The "event" is "(prefers-color-scheme: dark)" changing.
      // If that value now "matches" then the dark theme has been set on the system.
      if (event.matches) {
        changeThemeResource(themes.DARK)
      } else {
        changeThemeResource(themes.LIGHT)
      }
    }
  }

  function changeMode(event) {
    var newMode = event.target.value
    if (gameState == gameStates.PLAYING || gameState == gameStates.PAUSED) {
      if (confirm("Start new game?")) {
        saveHighScore(mode)
        gameState = gameStates.FINISHED
        button.textContent = "New Game"
      } else {
        hideSettings()
        return
      }
    }
    mode = newMode
    loadHighScore(mode)
    document.cookie = "difficulty=" + mode + "; SameSite=Strict;" // mode used to be called "difficulty"
    initGame()
  }

  function handleKeyInput(event) {
    const key = event.code
    if (gameState == gameStates.PLAYING) {
      switch (key) {
        case "ArrowUp":
        case "KeyW":
          handleDirectionChange(event, "up")
          break
        case "ArrowDown":
        case "KeyS":
          handleDirectionChange(event, "down")
          break
        case "ArrowRight":
        case "KeyD":
          handleDirectionChange(event, "right")
          break
        case "ArrowLeft":
        case "KeyA":
          handleDirectionChange(event, "left")
          break
      }
    }

    switch(key) {
      case "Space":
      case "KeyP":
        event.preventDefault() // stop pagedown
        buttonHandler()
        break
    }
  }

  function handleTouchStart(event) {
    const firstTouch = event.touches[0]
    xDown = firstTouch.clientX
    yDown = firstTouch.clientY
  }

  /**
   * Modified from
   * https://stackoverflow.com/a/23230280
   * (user "givanse")
   */
  function handleTouchMove(event) {
    if (!xDown || !yDown || gameState != gameStates.PLAYING) {
      return;
    }

    var xUp = event.touches[0].clientX
    var yUp = event.touches[0].clientY

    var xDiff = xDown - xUp
    var yDiff = yDown - yUp

    if (Math.abs(xDiff) > Math.abs(yDiff)) { // horizontal component larger
      if (xDiff > 0) {
        /* left swipe */
        handleDirectionChange(event, "left")
      } else {
        /* right swipe */
        handleDirectionChange(event, "right")
      }
    } else {
      if (yDiff > 0) {
        /* up swipe */
        handleDirectionChange(event, "up")
      } else {
        /* down swipe */
        handleDirectionChange(event, "down")
      }
    }
    /* reset values */
    xDown = null
    yDown = null
  }

  function handleDirectionChange(event, direction) {
    event.preventDefault() // stop scrolling
    var previousDirection
    if (directionQueue.length == 0) {
      previousDirection = snake.dir
    } else {
      previousDirection = directionQueue[directionQueue.length - 1]
    }
    if (previousDirection != direction && !areOppositeDirections(previousDirection, direction)) {
      queueDirection(direction)
    }
  }

  function areOppositeDirections(direction1, direction2) {
    switch (direction1) {
      case "up":
        return direction2 == "down"
      case "down":
        return direction2 == "up"
      case "right":
        return direction2 == "left"
      case "left":
        return direction2 == "right"
    }
  }

  function queueDirection(direction) {
    directionQueue.push(direction)
  }

  function growOrMoveSnake(nextPosition, shouldGrow) {
    if (shouldGrow) {
      snake.addToFront(nextPosition)
    } else {
      snake.moveBackToFront(nextPosition)
    }
  }

  function moveTarget(activatedTarget, snake) {
    // we don't need to handle the case where activatedTarget
    // is not in the array, since it comes directly from "targets"
    targets.splice(targets.indexOf(activatedTarget), 1)
    spawnTarget(snake)
  }

  function spawnTarget(snake) {
    var pos = getRandomUnoccupiedPosition(snake)
    var target
    if (mode != modes.ARCADE) {
      target = new Target(pos)
    } else {
      const rand = getRandomInt(100)
      if (rand < 30) {
        target = new BombTarget(pos)
      } else {
        target = new Target(pos)
      }
    }
    targets.push(target)
  }

  function redraw() {
    console.log(pathToTheme)
    contextFor2D.clearRect(0, 0, board.width, board.height)
    snake.getSegments().forEach(segment => {
      drawCircle(segment, tileSize() / 2 - 1, "#60842e") // uses radius
    })
    drawEyes(snake, tileSize() / 2 - 1) // uses radius
    targets.forEach(target => {
      if (target instanceof BombTarget) { // XXX hack for now
        drawCircle(target.position, tileSize() / 2 - 3, target.color) // uses radius
      } else {
        // to pixelCoords gets us center, subtract radius to get top left of target (where svg is positioned)
        targetX = toPixelCoords(target.position).x - tileSize() * 0.5 + 3
        targetY = toPixelCoords(target.position).y - tileSize() * 0.5 + 3
        // TODO do we need to change targetImage?
        contextFor2D.drawImage(targetImage, targetX, targetY, tileSize() - 6, tileSize() - 6) // uses diameter
      }
    })
  }

  // return target that is overlapped with, or null
  function checkOverlapWithTargets(nextSnakeHead, targets) {
    for (var t = 0; t < targets.length; t++) {
      var target = targets[t]
      if ((nextSnakeHead.i == target.position.i) && (nextSnakeHead.j == target.position.j)) {
        return target
      }
    }
    return null
  }

  function changeScore(delta) {
    score += delta
    scoreElement.innerText = score
  }

  function changeSpeed(newUpdateRate) {
    updateRate = newUpdateRate
  }

  function tileSize() {
    return tileWidth
  }

  /**
   * returns int [0, max - 1]
   */
  function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

  function getRandomUnoccupiedPosition(snake) {
    var unoccupiedPositions = []
    for (var col = 0; col < nTilesX; col++) {
      for (var row = 0; row < nTilesY; row++) {
        var isOccupied = false
        for (const segment of snake.getSegments()) {
          if (col === segment.i && row === segment.j) {
            isOccupied = true
            break
          }
        }
        for (const target of targets) {
          if (col === target.position.i && row === target.position.j) {
            isOccupied = true
            break
          }
        }
        if (!isOccupied) {
          unoccupiedPositions.push({i: col, j: row})
        }
      }
    }
    return unoccupiedPositions[getRandomInt(unoccupiedPositions.length)]
  }
  /**
   * tilePosition: 0-indexed xy tile index
   * returns pixel coords of center of that tile
   */
  function toPixelCoords(tilePosition) {
    return {
      x: (tilePosition.i + 0.5) * tileSize(),
      y: (tilePosition.j + 0.5) * tileSize()
    }
  }

  function outOfFrame() {
    return snake.getHead().i >= nTilesX ||
      snake.getHead().i < 0 ||
      snake.getHead().j >= nTilesY ||
      snake.getHead().j < 0
  }

  function drawCircle(tilePos, radius, color) {
    drawCircleAt(toPixelCoords(tilePos), radius, color)
  }

  function drawCircleAt(coord, radius, color) {
    contextFor2D.beginPath()
    contextFor2D.strokeStyle = color
    contextFor2D.arc(coord.x, coord.y, radius, 0, 2 * Math.PI)
    contextFor2D.fillStyle = color
    contextFor2D.fill()
    contextFor2D.stroke()
  }

  function drawEyes(snake, headRadius) {
    const headCenter = toPixelCoords(snake.getHead())
    var eyesCoords = getEyeCoordinates(headCenter, headRadius, snake.dir)
    drawCircleAt(eyesCoords[0], headRadius * 0.1, "black")
    drawCircleAt(eyesCoords[1], headRadius * 0.1, "black")
  }

  function getEyeCoordinates(headCenter, headRadius, direction) {
    var ret = []
    switch (direction) {
      case "up" :
        ret[0] = {x: headCenter.x - headRadius * 0.3, y: headCenter.y - headRadius * 0.3}
        ret[1] = {x: headCenter.x + headRadius * 0.3, y: headCenter.y - headRadius * 0.3}
        break
      case "down" :
        ret[0] = {x: headCenter.x - headRadius * 0.3, y: headCenter.y + headRadius * 0.3}
        ret[1] = {x: headCenter.x + headRadius * 0.3, y: headCenter.y + headRadius * 0.3}
        break
      case "left" :
        ret[0] = {x: headCenter.x - headRadius * 0.3, y: headCenter.y - headRadius * 0.3}
        ret[1] = {x: headCenter.x - headRadius * 0.3, y: headCenter.y + headRadius * 0.3}
        break
      case "right" :
        ret[0] = {x: headCenter.x + headRadius * 0.3, y: headCenter.y - headRadius * 0.3}
        ret[1] = {x: headCenter.x + headRadius * 0.3, y: headCenter.y + headRadius * 0.3}
        break
    }
    return ret
  }
}

const modes = {
  EASY : "easy",
  MEDIUM : "medium",
  HARD : "hard",
  ARCADE : "arcade"
}

const gameStates = {
  LOADED : "loaded", // first loaded page
  PLAYING : "playing",
  PAUSED : "paused",
  FINISHED : "finished" // game over
}