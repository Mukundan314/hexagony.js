const DIRECTIONS = {
  E: [1, 0],
  NE: [1, -1],
  NW: [0, -1],
  W: [-1, 0],
  SW: [-1, 1],
  SE: [0, 1],
};

export default class InstructionPointer {
  constructor(location, direction, size) {
    this.location = location;
    this.direction = direction;
    this.size = size;
  }

  moveForward(memory) {
    const newLocation = [
      this.location[0] + DIRECTIONS[this.direction][0],
      this.location[1] + DIRECTIONS[this.direction][1],
    ];

    const abs = [
      Math.abs(newLocation[0]),
      Math.abs(-newLocation[0] - newLocation[1]),
      Math.abs(newLocation[1]),
    ];

    if (Math.max(...abs) > this.size) {
      const pivots = [0, 1, 2].filter((i) => abs[i] > this.size);

      let pivot;
      if (pivots.length === 1) {
        [pivot] = pivots;
      } else {
        pivot = (((pivots[0] - pivots[1]) % 3) + 3) % 3 === 1 ? pivots[1] : pivots[0];
        pivot = memory > 0 ? pivot : (pivot + 1) % 3;
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
