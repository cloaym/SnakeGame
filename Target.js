class Target {
    position;

    constructor(pos) {
        this.position = pos;
        return this;
    }
    
    get position() {
        return this.position;
    }

    get color() {
        // TODO - eventually support svg based on type and theme
        return "#a67244";
    }

    didLose() {
        return false;
    }

    getScoreChange() {
        return 1;
    }

    shouldIncreaseSnakeSize() {
        // TODO - eventually support decreasing snake size, changing by arbitrary amount
        return true;
    }

    getNewUpdateRate(currentUpdateRate, mode) {
        var accel = 1
        switch (mode) {
          case modes.EASY :
          case modes.ARCADE :
            accel = 1
            break
          case modes.MEDIUM :
            accel = 0.95
            break
          case modes.HARD :
            accel = 0.9
            break
        }
        return currentUpdateRate * accel
    }
}