#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { createCommand } from '../commands/create.js';
import { doctorCommand } from '../commands/doctor.js';

console.log(chalk.bold.cyan('\n⚡ Prompt Stack CLI\n'));

program
  .name('prompt-stack')
  .description('CLI for creating AI-powered applications')
  .version('1.0.0');

// Create command
program
  .command('create <project-name>')
  .description('Create a new Prompt Stack project')
  .option('-t, --template <template>', 'Choose a template', 'default')
  .action(createCommand);

// Doctor command
program
  .command('doctor')
  .description('Check your development environment')
  .action(doctorCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  console.log('\n' + chalk.gray('Learn more at https://promptstack.com'));
}