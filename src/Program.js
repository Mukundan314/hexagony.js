import { Readable } from 'stream';
import InstructionPointer from './InstructionPointer';
import MemoryPointer from './MemoryPointer';
import {
  padSource, sourceSize, debugMarkLocations, isInstructionChar, removeDuplicateDebugMarks,
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
  constructor(program, debug = false, debugMark = '`') {
    this.program = padSource(removeDuplicateDebugMarks(program.replace(/\s/g, ''), debugMark));
    this.size = sourceSize(this.program, debugMark);
    const debugLocations = new Set(debug ? debugMarkLocations(this.program, debugMark) : []);
    this.program = this.program.split(debugMark).join('');

    if (!Array.from(this.program).every(isInstructionChar)) {
      throw new RangeError('Invalid instructions in program');
    }

    this.debugLocations = [];
    this.gridProgram = Array(2 * this.size + 1).fill().reduce((res, _, i) => {
      const r = i - this.size;
      const start = Object.keys(res).length;
      const stop = start + (2 * this.size + 1) - Math.abs(r);

      Array.from(this.program.slice(start, stop)).forEach((v, j) => {
        if (debugLocations.has(start + j)) {
          this.debugLocations.push([j - Math.min(i, this.size), r]);
        }
        res[[j - Math.min(i, this.size), r]] = v;
      });

      return res;
    }, {});

    this.reset();
  }

  step() {
    const instruction = this.gridProgram[this.ips[this.currentIP].location];

    const { direction } = this.ips[this.currentIP];

    const prevIP = this.currentIP;
    const prevLocation = this.ips[this.currentIP].location;

    const prevMemory = this.memory[this.memoryPointer.location] || 0n;
    const leftMemory = this.memory[this.memoryPointer.getLeftLocation()] || 0n;
    const rightMemory = this.memory[this.memoryPointer.getRightLocation()] || 0n;

    if (/[a-zA-Z]/.test(instruction)) {
      this.memory[this.memoryPointer.location] = BigInt(instruction.charCodeAt(0));
    } else if (instruction === '@') {
      this.finished = true;
    } else if (/[0-9]/.test(instruction)) {
      this.memory[this.memoryPointer.location] = prevMemory * 10n + BigInt(instruction);
    } else if (instruction === ')') {
      this.memory[this.memoryPointer.location] = prevMemory + 1n;
    } else if (instruction === '(') {
      this.memory[this.memoryPointer.location] = prevMemory - 1n;
    } else if (instruction === '+') {
      this.memory[this.memoryPointer.location] = leftMemory + rightMemory;
    } else if (instruction === '-') {
      this.memory[this.memoryPointer.location] = leftMemory - rightMemory;
    } else if (instruction === '*') {
      this.memory[this.memoryPointer.location] = leftMemory * rightMemory;
    } else if (instruction === ':') {
      this.memory[this.memoryPointer.location] = Math.floor(leftMemory / rightMemory);
    } else if (instruction === '%') {
      this.memory[this.memoryPointer.location] = leftMemory % rightMemory;
    } else if (instruction === '~') {
      this.memory[this.memoryPointer.location] = -1n * prevMemory;
    } else if (instruction === ',') {
    } else if (instruction === '?') {
    } else if (instruction === ';') {
      this.output.push(String.fromCharCode(Number(prevMemory % 256n)));
    } else if (instruction === '!') {
      this.output.push(prevMemory.toString());
    } else if (instruction === '$') {
      this.ips[this.currentIP].moveForward(prevMemory);
    } else if (instruction === '_') {
      this.ips[this.currentIP].direction = REFLECT[instruction][direction];
    } else if (instruction === '|') {
      this.ips[this.currentIP].direction = REFLECT[instruction][direction];
    } else if (instruction === '/') {
      this.ips[this.currentIP].direction = REFLECT[instruction][direction];
    } else if (instruction === '\\') {
      this.ips[this.currentIP].direction = REFLECT[instruction][direction];
    } else if (instruction === '<') {
      if (prevMemory > 0 && direction === 'E') {
        this.ips[this.currentIP].direction = 'SE';
      } else {
        this.ips[this.currentIP].direction = REFLECT[instruction][direction];
      }
    } else if (instruction === '>') {
      if (prevMemory > 0 && direction === 'W') {
        this.ips[this.currentIP].direction = 'NW';
      } else {
        this.ips[this.currentIP].direction = REFLECT[instruction][direction];
      }
    } else if (instruction === '[') {
      this.currentIP = this.currentIP === 0 ? 5 : this.currentIP - 1;
    } else if (instruction === ']') {
      this.currentIP = this.currentIP === 5 ? 0 : this.currentIP + 1;
    } else if (instruction === '#') {
      this.currentIP = Number(prevMemory % 6n);
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
      if (prevMemory > 0) {
        this.memoryPointer.moveRight();
      } else {
        this.memoryPointer.moveLeft();
      }
    } else if (instruction === '&') {
      if (prevMemory > 0) {
        this.memory[this.memoryPointer.location] = rightMemory;
      } else {
        this.memory[this.memoryPointer.location] = leftMemory;
      }
    }

    if (this.debugLocations.find((debugLocation) => debugLocation[0] === prevLocation[0]
      && debugLocation[1] === prevLocation[1])) {
      this.debug.push(`
Tick ${this.tick}:
IPs (! indicates active IP):
${this.ips.map((ip, i) => `${prevIP === i ? '!' : ' '} ${i}: ${ip.location} ${ip.direction}`).join('\n')}
Instruction: ${instruction}
Memory: {${Object.entries(this.memory).map(([idx, val]) => `[${idx}]: ${val}`).join(', ')}}
Memory Pointer: ${this.memoryPointer.location} cw=${this.memoryPointer.clockwise}
`);
    }

    this.ips[prevIP].moveForward(this.memory[this.memoryPointer.location]);
    this.tick += 1;

    if (this.finished) {
      this.debug.push(null);
      this.output.push(null);
    }

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
    this.debug = new Readable({ read() {} });

    this.tick = 0;

    return this;
  }
}
