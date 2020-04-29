export default class MemoryPointer {
  constructor(location, clockwise) {
    this.location = location;
    this.clockwise = clockwise;
  }

  moveLeft() {
    this.location = this.getLeftLocation();
    this.clockwise = (this.location[2] === 'SE') ? !this.clockwise : this.clockwise;
    return this;
  }

  moveRight() {
    this.location = this.getRightLocation();
    this.clockwise = (this.location[2] === 'NE') ? !this.clockwise : this.clockwise;

    return this;
  }

  reverse() {
    this.clockwise = !this.clockwise;
    return this;
  }

  getLeftLocation() {
    switch (this.location[2]) {
      case 'NE': {
        return [this.location[0] + this.clockwise, this.location[1] - 1, 'SE'];
      }
      case 'E': {
        return [this.location[0], this.location[1] + this.clockwise, 'NE'];
      }
      case 'SE': {
        return [this.location[0] - this.clockwise, this.location[1] + this.clockwise, 'E'];
      }
      default: {
        throw new Error(`Invalid MemoryPointer: ${this}`);
      }
    }
  }

  getRightLocation() {
    switch (this.location[2]) {
      case 'NE': {
        return [this.location[0], this.location[1] - !this.clockwise, 'E'];
      }
      case 'E': {
        return [this.location[0] + !this.clockwise, this.location[1] - !this.clockwise, 'SE'];
      }
      case 'SE': {
        return [this.location[0] - this.clockwise, this.location[1] + 1, 'NE'];
      }
      default: {
        throw new Error(`Invalid MemoryPointer: ${this}`);
      }
    }
  }
}
