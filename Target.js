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

    getNewUpdateRate(currentUpdateRate, difficulty) {
        var accel = 1
        switch (difficulty) {
          case difficulties.EASY :
            accel = 1
            break
          case difficulties.MEDIUM :
            accel = 0.95
            break
          case difficulties.HARD :
            accel = 0.9
            break
        }
        return currentUpdateRate * accel
    }
}