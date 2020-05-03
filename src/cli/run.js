import fs from 'fs';
import Program from '../Program';

export default function run(file, options) {
  const code = fs.readFileSync(file).toString();
  const program = new Program(code, options.debug, options.debugMark);

  program.run();
}
