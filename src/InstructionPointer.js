import { neighbours, wrapAroundHexagon } from './coord';

export default class InstructionPointer {
  constructor(location, direction, size) {
    this.location = location;
    this.direction = direction;
    this.size = size;
  }

  moveForward() {
    this.location = wrapAroundHexagon(neighbours(this.location)[this.direction], this.size);
    return this;
  }
}
