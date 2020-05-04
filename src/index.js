import Program from './Program';
import InstructionPointer from './InstructionPointer';
import MemoryPointer from './MemoryPointer';
import {
  debugMarkLocations,
  isInstructionChar,
  padSource,
  removeDuplicateDebugMarks,
  sourceSize,
} from './utils';

export { Program };
export { InstructionPointer };
export { MemoryPointer };

export default {
  InstructionPointer,
  MemoryPointer,
  Program,
  debugMarkLocations,
  isInstructionChar,
  padSource,
  removeDuplicateDebugMarks,
  sourceSize,
};
