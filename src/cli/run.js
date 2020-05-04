import fs from 'fs';
import Program from '../Program';

export default function run(file, options) {
  const code = fs.readFileSync(file).toString();
  const program = new Program(code);

  process.stdin.pipe(program).pipe(process.stdout);

  program.run();
}
