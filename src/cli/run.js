import fs from 'fs';
import Program from '../Program';

export default function run(file, options) {
  const code = fs.readFileSync(file).toString();
  const program = new Program(code);

  program.pipe(process.stdout);
  program.run();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
  // program.step();
}
