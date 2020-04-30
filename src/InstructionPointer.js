import { distance, neighbours } from './coord';

export default class InstructionPointer {
  constructor(location, direction, size) {
    this.location = location;
    this.direction = direction;
    this.size = size;
  }

  moveForward(memory) {
    const newLocation = neighbours(this.location)[this.direction];

    const x = newLocation[0];
    const z = newLocation[1];
    const y = -x - z;

    const abs = [Math.abs(x), Math.abs(y), Math.abs(z)];

    if (distance(newLocation, [0, 0]) > this.size) {
      const pivots = [0, 1, 2].filter((i) => abs[i] > this.size);

      let pivot;
      if (pivots.length === 1) {
        [pivot] = pivots;
      } else {
        pivot = (((pivots[0] - pivots[1]) % 3) + 3) % 3 === 1 ? pivots[1] : pivots[0];
        pivot = memory <= 0 ? (pivot + 1) % 3 : pivot;
      }

      const [i, j] = [0, 1, 2].filter((k) => k !== pivot);

      const wrapped = [-this.location[0], this.location[0] + this.location[1], -this.location[1]];
      [wrapped[i], wrapped[j]] = [wrapped[j], wrapped[i]];

      this.location = [wrapped[0], wrapped[2]];
    } else {
      this.location = newLocation;
    }

    return this;
  }
}
