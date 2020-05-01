import fs from 'fs';
import Program from '../Program';

export default function run(file, options) {
  const code = fs.readFileSync(file).toString();
  const program = new Program(code, options.debug, options.debugMark);

  while (!program.finished) {
    program.step();

    const debug = program.debug.read();
    if (debug !== null) {
      process.stderr.write(debug);
    }

    const output = program.output.read();
    if (output !== null) {
      process.stdout.write(output);
    }
  }

  program.run();
}
