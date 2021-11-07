class Target {
    position;

    constructor(pos) {
        this.position = pos;
        return this;
    }
    
    get position() {
        return this.position;
    }

    static get imageName() {
        return "basic_target";
    }

    get imageName() {
        return Target.imageName; // can't call the static version from an instance??
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

class BombTarget extends Target {

    static get imageName() {
        return "bomb_target";
    }

    get imageName() {
        return BombTarget.imageName;
    }

    didLose() {
        return true;
    }
}

class SpeedUpTarget extends Target {

    static get imageName() {
        return "fast_target"; // used Twemoji high voltage (lightning bolt)
    }

    get imageName() {
        return SpeedUpTarget.imageName;
    }

    getNewUpdateRate(currentUpdateRate, mode) {
        return currentUpdateRate * 0.6;
    }
}

class SlowDownTarget extends Target {

    static get imageName() {
        return "slow_target"; // used Twemoji turtle
    }

    get imageName() {
        return SlowDownTarget.imageName;
    }

    getNewUpdateRate(currentUpdateRate, mode) {
        return currentUpdateRate * 1.5;
    }
}