import { Readable } from 'stream';
import InstructionPointer from './InstructionPointer';
import MemoryPointer from './MemoryPointer';
import {
  padSource, sourceSize, debugMarkLocations, isInstructionChar,
} from './utils';

const REFLECT = {
  '/': {
    E: 'NW', SE: 'W', SW: 'SW', W: 'SE', NW: 'E', NE: 'NE',
  },
  '\\': {
    E: 'SW', SE: 'SE', SW: 'E', W: 'NE', NW: 'NW', NE: 'W',
  },
  _: {
    E: 'E', SE: 'NE', SW: 'NW', W: 'W', NW: 'SW', NE: 'SE',
  },
  '|': {
    E: 'W', SE: 'SW', SW: 'SE', W: 'E', NW: 'NE', NE: 'NW',
  },
  '<': {
    E: 'NE', SE: 'NW', SW: 'W', W: 'E', NW: 'W', NE: 'SW',
  },
  '>': {
    E: 'W', SE: 'E', SW: 'NE', W: 'SW', NW: 'SE', NE: 'E',
  },
};

export default class Program {
  constructor(program, size, debug = false, debugMark = '`') {
    this.size = size === undefined ? sourceSize(program) : size;
    this.debugLocations = debug ? debugMarkLocations(program, debugMark) : [];
    this.program = padSource(program, debugMark).replace(/\c/g, '').replace(debugMark, '');

    if (!Array.from(this.program).every(isInstructionChar)) {
      throw new RangeError('Invalid instructions in program');
    }

    this.gridProgram = Array(2 * this.size + 1).fill().reduce((res, _, i) => {
      const r = i - this.size;
      const start = Object.keys(res).length;
      const stop = start + (2 * this.size + 1) - Math.abs(r);

      Array.from(this.program.slice(start, stop)).forEach((v, j) => {
        res[[j - Math.min(i, this.size), r]] = v;
      });

      return res;
    }, {});

    this.reset();
  }

  step() {
    const instruction = this.gridProgram[this.ips[this.currentIP].location];

    const { direction } = this.ips[this.currentIP];

    const currIP = this.currentIP;
    const currMemory = this.memory[this.memoryPointer.location] || 0n;
    const leftMemory = this.memory[this.memoryPointer.getLeftLocation()] || 0n;
    const rightMemory = this.memory[this.memoryPointer.getRightLocation()] || 0n;

    if (/[a-zA-Z]/.test(instruction)) {
      this.memory[this.memoryPointer.location] = BigInt(instruction.charCodeAt(0));
    } else if (instruction === '@') {
      this.finished = true;
    } else if (/[0-9]/.test(instruction)) {
      this.memory[this.memoryPointer.location] = currMemory * 10n + BigInt(instruction);
    } else if (instruction === ')') {
      this.memory[this.memoryPointer.location] = currMemory + 1n;
    } else if (instruction === '(') {
      this.memory[this.memoryPointer.location] = currMemory - 1n;
    } else if (instruction === '+') {
      this.memory[this.memoryPointer.location] = leftMemory + rightMemory;
    } else if (instruction === '-') {
      this.memory[this.memoryPointer.location] = leftMemory - rightMemory;
    } else if (instruction === '*') {
      this.memory[this.memoryPointer.location] = leftMemory * rightMemory;
    } else if (instruction === ':') {
      this.memory[this.memoryPointer.location] = Math.round(leftMemory / rightMemory);
    } else if (instruction === '%') {
      this.memory[this.memoryPointer.location] = leftMemory % rightMemory;
    } else if (instruction === '~') {
      this.memory[this.memoryPointer.location] = -1n * currMemory;
    } else if (instruction === ',') {
    } else if (instruction === '?') {
    } else if (instruction === ';') {
      this.output.push(String.fromCharCode(Number(currMemory % 256n)));
    } else if (instruction === '!') {
      this.output.push(currMemory.toString());
    } else if (instruction === '$') {
      this.ips[this.currentIP].moveForward(currMemory);
    } else if (instruction === '_') {
      this.ips[this.currentIP].direction = REFLECT[instruction][direction];
    } else if (instruction === '|') {
      this.ips[this.currentIP].direction = REFLECT[instruction][direction];
    } else if (instruction === '/') {
      this.ips[this.currentIP].direction = REFLECT[instruction][direction];
    } else if (instruction === '\\') {
      this.ips[this.currentIP].direction = REFLECT[instruction][direction];
    } else if (instruction === '<') {
      if (currMemory > 0 && direction === 'E') {
        this.ips[this.currentIP].direction = 'SE';
      } else {
        this.ips[this.currentIP].direction = REFLECT[instruction][direction];
      }
    } else if (instruction === '>') {
      if (currMemory > 0 && direction === 'W') {
        this.ips[this.currentIP].direction = 'NW';
      } else {
        this.ips[this.currentIP].direction = REFLECT[instruction][direction];
      }
    } else if (instruction === '[') {
      this.currentIP = this.currentIP === 0 ? 5 : this.currentIP - 1;
    } else if (instruction === ']') {
      this.currentIP = this.currentIP === 5 ? 0 : this.currentIP + 1;
    } else if (instruction === '#') {
      this.currentIP = Number(currMemory % 6n);
    } else if (instruction === '{') {
      this.memoryPointer.moveLeft();
    } else if (instruction === '}') {
      this.memoryPointer.moveRight();
    } else if (instruction === '"') {
      this.memoryPointer.reverse();
      this.memoryPointer.moveRight();
      this.memoryPointer.reverse();
    } else if (instruction === "'") {
      this.memoryPointer.reverse();
      this.memoryPointer.moveLeft();
      this.memoryPointer.reverse();
    } else if (instruction === '=') {
      this.memoryPointer.reverse();
    } else if (instruction === '^') {
      if (currMemory > 0) {
        this.memoryPointer.moveRight();
      } else {
        this.memoryPointer.moveLeft();
      }
    } else if (instruction === '&') {
      if (currMemory > 0) {
        this.memory[this.memoryPointer.location] = rightMemory;
      } else {
        this.memory[this.memoryPointer.location] = leftMemory;
      }
    }

    this.ips[currIP].moveForward(this.memory[this.memoryPointer.location]);

    return this;
  }

  run() {
    while (!this.finished) {
      this.step();
    }
  }

  reset() {
    this.finished = false;

    this.memory = {};
    this.memoryPointer = new MemoryPointer([0, 0, 'E'], false);

    this.currentIP = 0;
    this.ips = [
      new InstructionPointer([0, -this.size], 'E', this.size),
      new InstructionPointer([this.size, -this.size], 'SE', this.size),
      new InstructionPointer([this.size, 0], 'SW', this.size),
      new InstructionPointer([0, this.size], 'W', this.size),
      new InstructionPointer([-this.size, this.size], 'NW', this.size),
      new InstructionPointer([-this.size, 0], 'NE', this.size),
    ];

    this.output = new Readable({ read() {} });

    return this;
  }
}
