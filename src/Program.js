import { Duplex } from 'stream';
import InstructionPointer from './InstructionPointer';
import MemoryPointer from './MemoryPointer';
import instructionType from './instructionType';
import { padSource, sourceSize } from './utils';

export default class Program extends Duplex {
  constructor(program) {
    super();

    this.program = padSource(program.replace(/\s/g, ''));
    this.size = sourceSize(this.program);

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

  _read(size) { // eslint-disable-line
    this.reading = this.push(this.output.slice(0, size));
    this.output = this.output.slice(size);
  }

  _write(chunk, _, callback) { // eslint-disable-line
    this.input += chunk;
    callback(null);
  }

  _final(callback) { // eslint-disable-line
    this.inputEnded = true;
    callback(null);
  }

  reset() {
    this.finished = false;

    this.input = '';
    this.output = '';

    this.reading = false;
    this.inputEnded = false;

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

    return this;
  }

  step() {
    const instruction = this.gridProgram[this.ips[this.currentIP].location];

    const currValue = this.memory[this.memoryPointer.location] || 0n;
    const leftValue = this.memory[this.memoryPointer.getLeftLocation()] || 0n;
    const rightValue = this.memory[this.memoryPointer.getRightLocation()] || 0n;

    const prevIP = this.currentIP;

    switch (instructionType(instruction)) {
      // Memory manipulation
      case 'digit':
        this.memory[this.memoryPointer.location] = currValue * 10n
          + (currValue < 0n ? -1n : 1n) * BigInt(instruction);
        break;
      case 'inc':
        this.memory[this.memoryPointer.location] = currValue + 1n;
        break;
      case 'dec':
        this.memory[this.memoryPointer.location] = currValue - 1n;
        break;
      case 'add':
        this.memory[this.memoryPointer.location] = leftValue + rightValue;
        break;
      case 'sub':
        this.memory[this.memoryPointer.location] = leftValue - rightValue;
        break;
      case 'mul':
        this.memory[this.memoryPointer.location] = leftValue * rightValue;
        break;
      case 'div':
        this.memory[this.memoryPointer.location] = leftValue / rightValue;
        break;
      case 'mod':
        this.memory[this.memoryPointer.location] = leftValue % rightValue;
        break;
      case 'neg':
        this.memory[this.memoryPointer.location] = -currValue;
        break;
      case 'mem_cpy':
        this.memory[this.memoryPointer.location] = currValue > 0n ? rightValue : leftValue;
        break;
      case 'mem_set':
        this.memory[this.memoryPointer.location] = BigInt(instruction.charCodeAt(0));
        break;

      // Memory Pointer manipulation
      case 'mp_left':
        this.memoryPointer.moveLeft();
        break;
      case 'mp_right':
        this.memoryPointer.moveRight();
        break;
      case 'mp_reverse':
        this.memoryPointer.reverse();
        break;
      case 'mp_rev_left':
        this.memoryPointer.reverse();
        this.memoryPointer.moveRight();
        this.memoryPointer.reverse();
        break;
      case 'mp_rev_right':
        this.memoryPointer.reverse();
        this.memoryPointer.moveLeft();
        this.memoryPointer.reverse();
        break;
      case 'mp_branch':
        if (currValue > 0n) this.memoryPointer.moveRight();
        else this.memoryPointer.moveLeft();
        break;

      // I/O
      case 'input_char':
        break;
      case 'output_char':
        this.output += String.fromCharCode(Number(((currValue % 256n) + 256n) % 256n));
        break;
      case 'input_int':
        break;
      case 'output_int':
        this.output += currValue.toString();
        break;

      // Control Flow
      case 'jump':
        this.ips[this.currentIP].moveForward(currValue > 0n);
        break;
      case 'mirror':
        this.ips[this.currentIP].reflect(instruction);
        break;
      case 'branch':
        this.ips[this.currentIP].branch(instruction, currValue > 0n);
        break;
      case 'next_ip':
        this.currentIP = (this.currentIP + 1) % 6;
        break;
      case 'prev_ip':
        this.currentIP = (((this.currentIP - 1) % 6) + 6) % 6;
        break;
      case 'choose_ip':
        this.currentIP = Number(((currValue % 6n) + 6n) % 6n);
        break;

      case 'nop':
        break;
      case 'terminate':
        this.finished = true;
        break;

      default: throw new Error(`Not implemented yet ${instruction}`);
    }

    if (this.reading) {
      this.reading = this.push(this.output);
      this.output = '';
    }

    this.ips[prevIP].moveForward(this.memory[this.memoryPointer.location] > 0n);

    return this;
  }

  run() {
    const interval = setInterval(() => {
      this.step();
      if (this.finished) clearInterval(interval);
    }, 0);

    return this;
  }
}
