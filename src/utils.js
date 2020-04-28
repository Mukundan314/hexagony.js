export const INSTRUCTION_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.@0123456789)(+-*:%~,?;!$_|/\\<>[]#{}"\'=^&';

// Returns true if char is an instruction char else false.
export function isInstructionChar(char) {
  return Array.from(INSTRUCTION_CHARS).includes(char);
}

function assertValidDebugMark(debugMark) {
  if (debugMark.length !== 1) {
    throw new RangeError(`debugMark ('${debugMark}') must be a single char`);
  }
  if (isInstructionChar(debugMark)) {
    throw new RangeError(`debugMark ('${debugMark}') cannot be an instruction character`);
  }
}

// Returns locations of Debug Marks.
export function debugMarkLocations(source, debugMark = '`') {
  assertValidDebugMark(debugMark);

  return Array.from(source, (c, i) => (c === debugMark ? i : -1))
    .filter((v) => v !== -1)
    .map((v, i) => v - i);
}

// Replace multiple Debug Marks in the same place with single debugMark.
export function removeDuplicateDebugMarks(source, debugMark = '`') {
  assertValidDebugMark(debugMark);

  return Array.from(source)
    .filter((v, i) => (i === 0) || (!(source[i - 1] === debugMark && v === debugMark)))
    .join('');
}

// Returns the radius smallest hexagon that can fit the source code.
export function sourceSize(source, debugMark = '`') {
  assertValidDebugMark(debugMark);

  const { length } = Array.from(source).filter((c) => c !== debugMark);

  let size = 0;
  while (3 * size * (size + 1) + 1 < length) {
    size += 1;
  }

  return size;
}

// Pads the source with no-ops so that it is an hexagon
export function padSource(source, debugMark = '`') {
  assertValidDebugMark(debugMark);

  const { length } = Array.from(source).filter((c) => c !== debugMark);
  const size = sourceSize(source, debugMark);

  return source.padEnd(source.length + (3 * size * (size + 1) + 1) - length, '.');
}

export default {
  isInstructionChar,
  debugMarkLocations,
  removeDuplicateDebugMarks,
  sourceSize,
  padSource,
};
