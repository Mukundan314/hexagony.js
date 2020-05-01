import { Command } from 'commander';
import run from './run';

const program = new Command();
program.version('0.0.0');

program
  .command('run <file>', { isDefault: true })
  .option('-d, --debug', 'Print debug info on debug marks', false)
  .option('-m, --debug-mark [mark]', 'Debug mark used in the program', '`')
  .action(run);

program.parse(process.argv);
