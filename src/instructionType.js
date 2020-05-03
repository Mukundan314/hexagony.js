export default function instructionType(instruction) {
  if (instruction === '!') return 'output_int';
  if (instruction === '"') return 'mp_rev_left';
  if (instruction === '#') return 'choose_ip';
  if (instruction === '$') return 'jump';
  if (instruction === '%') return 'mod';
  if (instruction === '&') return 'mem_cpy';
  if (instruction === "'") return 'mp_rev_right';
  if (instruction === '(') return 'dec';
  if (instruction === ')') return 'inc';
  if (instruction === '*') return 'mul';
  if (instruction === '+') return 'add';
  if (instruction === ',') return 'input_char';
  if (instruction === '-') return 'sub';
  if (instruction === '.') return 'nop';
  if (instruction === ':') return 'div';
  if (instruction === ';') return 'output_char';
  if (instruction === '=') return 'mp_reverse';
  if (instruction === '?') return 'input_int';
  if (instruction === '@') return 'terminate';
  if (instruction === '[') return 'prev_ip';
  if (instruction === ']') return 'next_ip';
  if (instruction === '^') return 'mp_branch';
  if (instruction === '{') return 'mp_left';
  if (instruction === '}') return 'mp_right';
  if (instruction === '~') return 'neg';

  if (/\\|_|\||\//.test(instruction)) return 'mirror';
  if (/<|>/.test(instruction)) return 'branch';
  if (/[0-9]/.test(instruction)) return 'digit';
  if (/[A-Za-z]/.test(instruction)) return 'mem_set';

  throw new Error(`Unknown instruction: ${instruction}`);
}
