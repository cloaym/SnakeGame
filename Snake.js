class Snake {
  constructor(pos) {
    this.segments = [];
    this.dir = "right";
    this.segments.push(pos);
    return this;
  }
  getHead() {
    return this.segments[0];
  }
  getSegments() {
    return this.segments;
  }
  /**
   * Does not change internal state of Snake.
   * @returns next position of the snake based on direction (assumes infinite board), in indexes
   */
  getNextPosition() {
    var nextPos = {
      i: this.getHead().i,
      j: this.getHead().j
    };

    switch (this.dir) {
      case "up":
        nextPos.j -= 1;
        break;
      case "down":
        nextPos.j += 1;
        break;
      case "right":
        nextPos.i += 1;
        break;
      case "left":
        nextPos.i -= 1;
        break;
    }
    return nextPos;
  }
  addToFront(nextPos) {
    this.segments.unshift(nextPos);
  }
  moveBackToFront(nextPos) {
    this.segments.pop();
    this.segments.unshift(nextPos);
  }
  checkOverlapWithSelf() {
    for (var n = 1; n < this.segments.length; n++) {
      if ((this.getHead().i == this.segments[n].i) && (this.getHead().j == this.segments[n].j)) {
        return true;
      }
    }
    return false;
  }
}
