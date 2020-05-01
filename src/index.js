import Program from './Program';
import InstructionPointer from './InstructionPointer';
import MemoryPointer from './MemoryPointer';
import {
  isInstructionChar,
  debugMarkLocations,
  removeDuplicateDebugMarks,
  sourceSize,
  padSource,
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
